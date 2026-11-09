import { createFileRoute } from "@tanstack/react-router";
import { randomBytes, createHmac } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { z } from "zod";

const emailSchema=z.string().trim().toLowerCase().email().max(320);
const start=z.object({action:z.literal("start"),email:emailSchema,fullName:z.string().trim().min(2).max(100),agreed:z.literal(true)}).strict();
const resend=z.object({action:z.literal("resend"),email:emailSchema}).strict();
const complete=z.object({action:z.literal("complete"),password:z.string().min(8).max(4096),fullName:z.string().trim().min(2).max(100)}).strict();
const headers={"Cache-Control":"no-store","Content-Type":"application/json","X-Content-Type-Options":"nosniff"};
function permitted(request:Request){
 const expected=process.env.BRAVER_SITE_ORIGIN;
 try{
  if(!expected || new URL(request.headers.get("origin")||"").origin!==new URL(expected).origin)return false;
  if(request.headers.get("sec-fetch-site")==="cross-site")return false;
  return new URL(expected).protocol==="https:" || (process.env.BRAVER_ALLOW_LOCALHOST_TESTS==="1" && new URL(expected).origin==="http://localhost:3912");
 }catch{return false}
}
async function pool(){
 const {getNeonServerDatabasePool}=await import("@/integrations/neon/legacy-login.server");
 return getNeonServerDatabasePool();
}
async function throttle(email:string){
 const salt=process.env.NEON_LEGACY_LOGIN_RATE_SALT||"";
 if(salt.length<32)throw Error("Signup rate-limiter unavailable");
 const digest=createHmac("sha256",salt).update("braver-signup:"+email).digest("hex");
 const sql=`INSERT INTO private.braver_login_throttle(identity_digest,window_start,attempts,updated_at)
 VALUES($1,now(),1,now()) ON CONFLICT(identity_digest) DO UPDATE
 SET attempts=CASE WHEN private.braver_login_throttle.window_start<now()-interval '10 minutes' THEN 1 ELSE private.braver_login_throttle.attempts+1 END,
 window_start=CASE WHEN private.braver_login_throttle.window_start<now()-interval '10 minutes' THEN now() ELSE private.braver_login_throttle.window_start END,
 updated_at=now() RETURNING attempts`;
 const result=await (await pool()).query<{attempts:number}>(sql,[digest]);
 return Number(result.rows[0]?.attempts??999)<=6;
}
/** Never send signup verification to a completed or unknown account. */
async function signupState(email:string):Promise<"new"|"pending"|"completed">{
 const result=await (await pool()).query<{
  legacy_exists:boolean; legacy_completed:boolean|null; native_exists:boolean;
 }>(`SELECT
   EXISTS(SELECT 1 FROM auth.users WHERE lower(email)=$1) AS legacy_exists,
   (SELECT COALESCE((raw_user_meta_data->>'signup_completed')::boolean,true)
    FROM auth.users WHERE lower(email)=$1 LIMIT 1) AS legacy_completed,
   EXISTS(SELECT 1 FROM neon_auth."user" WHERE lower(email)=$1) AS native_exists`,[email]);
 const row=result.rows[0];
 if(row.legacy_exists && row.legacy_completed===false)return "pending";
 if(row.legacy_exists || row.native_exists)return "completed";
 return "new";
}
async function native(){
 const {createAuthClient}=await import("@neondatabase/auth");
 const {BetterAuthVanillaAdapter}=await import("@neondatabase/auth/vanilla/adapters");
 const url=process.env.NEON_AUTH_BASE_URL||"",origin=process.env.BRAVER_SITE_ORIGIN||"";
 if(!url.startsWith("https://") || !new URL(url).hostname.endsWith(".neon.tech"))throw Error("Auth endpoint unavailable");
 const client=createAuthClient(url,{adapter:BetterAuthVanillaAdapter({fetchOptions:{headers:{Origin:origin}}})});
 // Neon registers emailOtp at runtime; the patched Better Auth types no longer infer it.
 const withOtp=client as typeof client & {
   emailOtp:{sendVerificationOtp(input:{email:string;type:"email-verification"}):Promise<{error:unknown|null}>};
 };
 if(typeof withOtp.emailOtp?.sendVerificationOtp!=="function")throw Error("Verification code delivery is unavailable");
 return withOtp;
}
async function status(){
 const {requireNeonAccountSession}=await import("@/integrations/neon/auth.server");
 const session=await requireNeonAccountSession();
 const result=await (await pool()).query<{completed:boolean,name:string|null}>(
  `SELECT COALESCE((u.raw_user_meta_data->>'signup_completed')::boolean,false) AS completed,
  p.display_name AS name
  FROM auth.users u LEFT JOIN public.profiles p ON p.id=u.id
  WHERE u.id=$1::uuid AND lower(u.email)=$2 LIMIT 1`,[session.id,session.email]);
 if(result.rowCount!==1)throw Error("Unrecognized account");
 return {id:session.id,email:session.email,signup_completed:result.rows[0].completed,name:result.rows[0].name};
}
async function finish(password:string,fullName:string){
 const {requireNeonAccountSession}=await import("@/integrations/neon/auth.server");
 const session=await requireNeonAccountSession();
 const hashed=await hashPassword(password);
 const client=await (await pool()).connect();
 try{
  await client.query("BEGIN");
  const result=await client.query<{completed:boolean,verified:boolean}>(
   `SELECT COALESCE((u.raw_user_meta_data->>'signup_completed')::boolean,false) AS completed,
   n."emailVerified" AS verified
   FROM auth.users u JOIN neon_auth."user" n ON n.id=u.id
   WHERE u.id=$1::uuid AND lower(u.email)=$2 FOR UPDATE OF u`,[session.id,session.email]);
  if(result.rowCount!==1 || result.rows[0].completed || !result.rows[0].verified)throw Error("Signup verification is no longer valid.");
  const record=await client.query(
   `UPDATE neon_auth.account SET password=$1,"updatedAt"=now()
    WHERE "userId"=$2::uuid AND "providerId"='credential' RETURNING id`,[hashed,session.id]);
  if(record.rowCount!==1)throw Error("Signup credential is missing.");
  const updated=await client.query(
   `UPDATE auth.users SET raw_user_meta_data=COALESCE(raw_user_meta_data,'{}'::jsonb) ||
   jsonb_build_object('signup_completed',true,'full_name',$2::text,'display_name',$2::text)
   WHERE id=$1::uuid AND email_confirmed_at IS NOT NULL RETURNING id`,[session.id,fullName]);
  if(updated.rowCount!==1)throw Error("Email verification is incomplete");
  await client.query("UPDATE public.profiles SET display_name=$2 WHERE id=$1::uuid",[session.id,fullName]);
  await client.query("COMMIT");
 }catch(error){await client.query("ROLLBACK");throw error}finally{client.release()}
}
export const Route=createFileRoute("/api/neon-signup")({server:{handlers:{
 GET:async()=>{
  if(process.env.BRAVER_AUTH_PROVIDER!=="neon")return Response.json({error:"Unavailable"},{status:404,headers});
  try{return Response.json(await status(),{headers})}catch{return Response.json({error:"Not signed in"},{status:401,headers})}
 },
 POST:async({request})=>{
  if(process.env.BRAVER_AUTH_PROVIDER!=="neon")return Response.json({error:"Unavailable"},{status:404,headers});
  if(!permitted(request) || request.headers.get("content-type")?.split(";")[0]!=="application/json" || Number(request.headers.get("content-length")||"0")>8500)return Response.json({error:"Invalid request"},{status:403,headers});
  let input:unknown;try{input=await request.json()}catch{return Response.json({error:"Invalid request"},{status:400,headers})}
  if(start.safeParse(input).success){
   const data=start.parse(input);
   try{
    // The rate-limit write and existing-account lookup are independent.
    // Run them concurrently to avoid two sequential Oregon-to-Singapore RTTs.
    const [allowed,state]=await Promise.all([throttle(data.email),signupState(data.email)]);
    if(!allowed)return Response.json({error:"Too many attempts. Try again later."},{status:429,headers});
    if(state==="completed")return Response.json({error:"An account already exists for this email. Please sign in or reset your password."},{status:409,headers});
    const auth=await native();
    if(state==="pending"){
      const pending=await auth.emailOtp.sendVerificationOtp({email:data.email,type:"email-verification"});
      if(pending.error)return Response.json({error:"Could not resend the verification code."},{status:400,headers});
      return Response.json({ok:true},{headers});
    }
    const password=randomBytes(48).toString("base64url");
    const response=await auth.signUp.email({email:data.email,name:data.fullName,password});
    if(response.error)return Response.json({error:"Could not send a verification code. If you already have an account, sign in instead."},{status:400,headers});
    return Response.json({ok:true},{headers});
   }catch{return Response.json({error:"Verification code could not be sent."},{status:503,headers})}
  }
  if(resend.safeParse(input).success){
   const data=resend.parse(input);
   try{
    const [allowed,state]=await Promise.all([throttle(data.email),signupState(data.email)]);
    if(!allowed)return Response.json({error:"Too many attempts. Try again later."},{status:429,headers});
    if(state!=="pending"){
      return Response.json({error:"A pending signup was not found. Please sign in or start registration again."},{status:409,headers});
    }
    const auth=await native();
    const result=await auth.emailOtp.sendVerificationOtp({email:data.email,type:"email-verification"});
    if(result.error)return Response.json({error:"Unable to resend code."},{status:400,headers});
    return Response.json({ok:true},{headers});
   }catch{return Response.json({error:"Unable to resend code."},{status:503,headers})}
  }
  if(complete.safeParse(input).success){
   const data=complete.parse(input);
   try{await finish(data.password,data.fullName);return Response.json({ok:true},{headers})}
   catch{return Response.json({error:"Verified signup could not be completed. Please retry or sign in."},{status:400,headers})}
  }
  return Response.json({error:"Invalid request"},{status:400,headers});
 }
}}});
