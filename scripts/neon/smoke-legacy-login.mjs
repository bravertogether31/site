import assert from "node:assert/strict";
import { randomBytes, randomUUID, createHmac } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import pg from "pg";
import { hash as bcryptHash } from "bcryptjs";
import { verifyPassword } from "better-auth/crypto";
import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthVanillaAdapter } from "@neondatabase/auth/vanilla/adapters";

if (process.env.BRAVER_ALLOW_SYNTHETIC_LOGIN_TEST !== "1") throw Error("Synthetic test requires isolated-branch opt-in.");
const f="/tmp/braver-staging-neon-db-url-20261107";
if((statSync(f).mode & 0o077)!==0) throw Error("Insecure local credential permissions");
const url=readFileSync(f,"utf8").trim();
if(!(new URL(url).hostname.startsWith("ep-blue-grass-azc3wque-pooler.") || new URL(url).hostname.startsWith("ep-blue-grass-azc3wque.")))throw Error("Not isolated test database");
const id=randomUUID(),email="braver-legacy-"+randomUUID()+"@example.invalid";
const password="Synthetic!"+randomBytes(30).toString("base64url");
const wrong="Incorrect!"+randomBytes(30).toString("base64url");
const bcrypt=(await bcryptHash(password,10)).replace(/^\$2b\$/,"$2a$");
const baseUrl=process.env.BRAVER_STAGING_ORIGIN||"http://localhost:3910";
const client=new pg.Client({connectionString:url,ssl:{rejectUnauthorized:true},connectionTimeoutMillis:8000});
let created=false;
try{
 await client.connect();
 const initial=await client.query("SELECT count(*)::int AS n FROM auth.users");
 assert.equal(initial.rows[0].n,12);
 await client.query("INSERT INTO auth.users(id,email,encrypted_password,email_confirmed_at,created_at,raw_user_meta_data) VALUES($1,$2,$3,now(),now(),$4::jsonb)",[id,email,bcrypt,JSON.stringify({display_name:"Synthetic Tester",signup_completed:true})]);
 created=true;
 await client.query("INSERT INTO public.profiles(id,display_name) VALUES($1,'Synthetic Tester') ON CONFLICT(id) DO UPDATE SET display_name='Synthetic Tester'",[id]);
 process.env.NEON_DATABASE_URL=url;
 process.env.NEON_LEGACY_LOGIN_RATE_SALT=randomBytes(48).toString("hex");
 process.env.NEON_LEGACY_LOGIN_ENABLED="1";
 const {prepareLegacyNeonSignIn}=await import("../../src/integrations/neon/legacy-login.server.ts");
 assert.equal(await prepareLegacyNeonSignIn({email,password:wrong}),false);
 const notCreated=await client.query('SELECT count(*)::int AS n FROM neon_auth."user" WHERE id=$1',[id]);
 assert.equal(notCreated.rows[0].n,0);
 console.log("PASS wrong legacy password rejected without identity creation");
 for(let n=0;n<5;n++) assert.equal(await prepareLegacyNeonSignIn({email,password:wrong}),false);
 assert.equal(await prepareLegacyNeonSignIn({email,password}),false,"Exceeded attempt limit must block even correct password");
 const resetDigest=createHmac("sha256",process.env.NEON_LEGACY_LOGIN_RATE_SALT).update("braver-login:"+email).digest("hex");
 await client.query("DELETE FROM private.braver_login_throttle WHERE identity_digest=$1",[resetDigest]);
 console.log("PASS per-account rate limit blocks brute-force after six attempts");

 assert.equal(await prepareLegacyNeonSignIn({email,password}),true);
 const newIdentity=await client.query('SELECT u.id::text AS id,u."emailVerified" AS verified,a.password AS digest FROM neon_auth."user" u JOIN neon_auth.account a ON a."userId"=u.id WHERE u.id=$1 AND a."providerId"=$2',[id,"credential"]);
 assert.equal(newIdentity.rows.length,1);
 assert.equal(newIdentity.rows[0].id,id);
 assert.equal(newIdentity.rows[0].verified,true);
 assert.ok(!newIdentity.rows[0].digest.startsWith("$2a$"));
 assert.equal(await verifyPassword({hash:newIdentity.rows[0].digest,password}),true);
 assert.equal(await verifyPassword({hash:newIdentity.rows[0].digest,password:wrong}),false);
 console.log("PASS original UUID and native scrypt password hash validated");
 const auth=createAuthClient("https://ep-blue-grass-azc3wque.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth",{adapter:BetterAuthVanillaAdapter({fetchOptions:{headers:{Origin:"http://localhost:3907"}}})});
 const signin=await auth.signIn.email({email,password});
 assert.equal(signin.error,null);
 assert.equal(signin.data?.user?.id,id);
 assert.ok(signin.data?.token,"No native Better Auth session token");
 console.log("PASS actual managed Neon Auth sign-in with original synthetic password");
 let rejected=false;
 try {const denied=await auth.signIn.email({email,password:wrong}); rejected=Boolean(denied.error);} catch (error) {rejected=error?.status===401 || error?.code==="invalid_credentials";}
 assert.equal(rejected,true,"Incorrect password must fail Neon Auth");
 console.log("PASS managed Neon Auth denies incorrect password");
 const proxied=await fetch(baseUrl+"/api/neon-auth/sign-in/email",{method:"POST",headers:{Origin:baseUrl,"Content-Type":"application/json"},body:JSON.stringify({email,password})});
 assert.equal(proxied.status,200,"Staging same-origin auth proxy should sign in");
 const cookies=proxied.headers.getSetCookie();
 assert.ok(cookies.some((c)=>c.includes("__Secure-neon-auth") && /httponly/i.test(c)),"Expected a secure managed session cookie");
 const sessionCookies=cookies.map((c)=>c.split(";")[0]).join("; ");
 const sessionResponse=await fetch(baseUrl+"/api/neon-auth/get-session",{headers:{Cookie:sessionCookies}});
 assert.equal(sessionResponse.status,200);
 const session=await sessionResponse.json();
 assert.equal(session?.user?.id,id,"Proxied session identity mismatch");
 console.log("PASS first-party Neon Auth proxy sign-in and session cookie readback");
 const tokenResponse=await fetch(baseUrl+"/api/neon-auth/token",{headers:{Cookie:sessionCookies}});
 assert.equal(tokenResponse.status,200,"Signed JWT exchange endpoint failed");
 const tokenPayload=await tokenResponse.json();
 const token=tokenPayload?.token || tokenPayload?.data?.token;
 assert.ok(typeof token==="string" && token.split(".").length===3,"Neon session must expose a signed Data API JWT");
 const jwtClaims=JSON.parse(Buffer.from(token.split(".")[1],"base64url").toString());
 console.log("JWT_CLAIM_METADATA",JSON.stringify({keys:Object.keys(jwtClaims).sort(),role:jwtClaims.role,audience:jwtClaims.aud,issuerHost:new URL(jwtClaims.iss).hostname,algorithm:JSON.parse(Buffer.from(token.split(".")[0],"base64url").toString()).alg}));
 const claim=JSON.parse(Buffer.from(token.split(".")[1],"base64url").toString("utf8"));
 console.log("JWT_META","keys",Object.keys(claim).join(","),"aud",claim.aud,"iss",claim.iss,"role",claim.role);
 const rest="https://ep-blue-grass-azc3wque.apirest.c-3.ap-southeast-1.aws.neon.tech/neondb/rest/v1";
 async function readRls(table){
   const r=await fetch(rest+"/"+table+"?select=*&limit=30",{headers:{Authorization:"Bearer "+token}});
   assert.equal(r.status,200,table+" RLS API failed");
   return r.json();
 }
 const profileRows=await readRls("profiles");
 assert.deepEqual(profileRows.map((x)=>x.id),[id],"Private profiles must be scoped to the authenticated account");
 const roleRows=await readRls("user_roles");
 assert.deepEqual(roleRows.map((x)=>x.user_id),[id],"Roles must be visible only to their owner");
 const conversations=await readRls("conversations");
 assert.equal(conversations.length,0,"Synthetic member must not see other users private conversations");
 console.log("PASS Neon JWT authenticated RLS: own profile and role only, no unrelated messages");
 const accountResponse=await fetch(baseUrl+"/api/neon-account",{headers:{Cookie:sessionCookies}});
 assert.equal(accountResponse.status,200,"Account API must recognize Neon session cookie");
 const account=await accountResponse.json();
 assert.equal(account.id,id,"Wrong account identity");
 assert.equal(account.role,"member","Wrong account role");
 assert.equal(account.hasRoleConflict,false,"Unexpected access conflict");
 const anon=await fetch(baseUrl+"/api/neon-account");
 assert.equal(anon.status,401,"Unauthenticated session allowed account access");
 console.log("PASS app-level session and role endpoint: member only, anonymous denied");
 const checked=await fetch(baseUrl+"/api/neon-account",{headers:{Cookie:sessionCookies,Authorization:"Bearer "+token}});
 assert.equal(checked.status,200,"Signed token + live session should authorize account lookup");
 const stolen=await fetch(baseUrl+"/api/neon-account",{headers:{Authorization:"Bearer "+token}});
 assert.equal(stolen.status,401,"JWT without original browser session must be refused");
 const counterfeit=await fetch(baseUrl+"/api/neon-account",{headers:{Cookie:sessionCookies,Authorization:"Bearer invalid.fake.signature"}});
 assert.equal(counterfeit.status,401,"Forged JWT must be refused");
 console.log("PASS verified EdDSA JWT + live session; mismatched/forged requests denied");




}finally{
 if(created){
  try{
   await client.query('DELETE FROM neon_auth.session WHERE "userId"=$1',[id]);
   await client.query('DELETE FROM neon_auth.account WHERE "userId"=$1',[id]);
   await client.query('DELETE FROM neon_auth."user" WHERE id=$1',[id]);
   await client.query('DELETE FROM public.user_roles WHERE user_id=$1',[id]);
   await client.query('DELETE FROM public.profiles WHERE id=$1',[id]);
   await client.query('DELETE FROM auth.users WHERE id=$1',[id]);
   const digest=createHmac("sha256",process.env.NEON_LEGACY_LOGIN_RATE_SALT||"").update("braver-login:"+email).digest("hex");
   await client.query("DELETE FROM private.braver_login_throttle WHERE identity_digest=$1",[digest]);
   console.log("PASS synthetic account, sessions and credentials cleaned");
  }catch(e){console.error("Synthetic cleanup requires review",e?.code||"error");process.exitCode=1}
 }
 await client.end().catch(()=>undefined);
}
