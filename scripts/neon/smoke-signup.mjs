import {createAuthClient} from "@neondatabase/auth";
import {BetterAuthVanillaAdapter} from "@neondatabase/auth/vanilla/adapters";
import {randomUUID,randomBytes} from "node:crypto";
import {readFileSync} from "node:fs";
import pg from "pg";
if(process.env.BRAVER_ALLOW_SYNTHETIC_SIGNUP_TEST!=="1")throw Error("Isolated staging only");
const email="braver-signup-qa-"+randomUUID()+"@example.invalid";
const password="Synthetic!"+randomBytes(30).toString("base64url");
const url="https://ep-blue-grass-azc3wque.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth";
const auth=createAuthClient(url,{adapter:BetterAuthVanillaAdapter({fetchOptions:{headers:{Origin:"http://localhost:3912"}}})});
const connection=readFileSync("/tmp/braver-neon-staging-secrets-20261107/database-url","utf8").trim();
if(!new URL(connection).hostname.startsWith("ep-blue-grass-azc3wque"))throw Error("Not staging");
const db=new pg.Client({connectionString:connection,ssl:{rejectUnauthorized:true}});
await db.connect();let id;
try{
 const out=await auth.signUp.email({name:"Braver Synthetic Signup",email,password});
 console.log("SIGNUP_RESULT",{errorCode:out.error?.code||null,status:out.error?.status||null,hasUser:!!out.data?.user,hasSession:!!out.data?.token});
 const r=await db.query('SELECT n.id::text,n."emailVerified" AS verified,u.email AS legacy,p.display_name AS profile,ur.role::text AS role FROM neon_auth."user" n LEFT JOIN auth.users u ON u.id=n.id LEFT JOIN public.profiles p ON p.id=n.id LEFT JOIN public.user_roles ur ON ur.user_id=n.id WHERE n.email=$1',[email]);id=r.rows[0]?.id;
 console.log("SIGNUP_DB_RESULT",{native:r.rows.length,verified:r.rows[0]?.verified,legacyExists:!!r.rows[0]?.legacy,profileExists:!!r.rows[0]?.profile,role:r.rows[0]?.role});
}catch(e){console.log("SIGNUP_ERROR",e.code||e.name,e.message?.slice(0,160))}
finally{
 if(id){
  await db.query('DELETE FROM neon_auth.session WHERE "userId"=$1',[id]);
  await db.query('DELETE FROM neon_auth.account WHERE "userId"=$1',[id]);
  await db.query('DELETE FROM neon_auth."user" WHERE id=$1',[id]);
  await db.query("DELETE FROM public.user_roles WHERE user_id=$1",[id]);
  await db.query("DELETE FROM public.profiles WHERE id=$1",[id]);
  await db.query("DELETE FROM auth.users WHERE id=$1",[id]);
  console.log("SYNTHETIC_SIGNUP_CLEANUP_DONE");
 }
 await db.end();
}
