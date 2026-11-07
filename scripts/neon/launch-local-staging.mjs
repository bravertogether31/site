import {readFileSync,statSync} from "node:fs";
import {randomBytes} from "node:crypto";
import {spawn} from "node:child_process";
const root="/tmp/braver-neon-staging-secrets-20261107";
for(const f of ["database-url","s3.json"]){
  if((statSync(root+"/"+f).mode&0o077)!==0)throw Error("Unsafe local staging credential permissions");
}
const db=readFileSync(root+"/database-url","utf8").trim();
const url=new URL(db);
if(!url.hostname.startsWith("ep-blue-grass-azc3wque"))throw Error("Refusing non-staging Neon DB");
const s3=JSON.parse(readFileSync(root+"/s3.json","utf8"));
if(!new URL(s3.endpoint).hostname.startsWith("br-twilight-recipe-azi9p8zg."))throw Error("Refusing non-staging S3");
const env={
  ...process.env,
  PORT:"3912", HOST:"127.0.0.1", NODE_ENV:"development",
  BRAVER_AUTH_PROVIDER:"neon",BRAVER_PUBLIC_DATA_PROVIDER:"neon",
  NEON_AUTH_PROXY_ENABLED:"1",NEON_LEGACY_LOGIN_ENABLED:"1",
  BRAVER_ALLOW_LOCALHOST_TESTS:"1",BRAVER_SITE_ORIGIN:"http://localhost:3912",
  NEON_AUTH_BASE_URL:"https://ep-blue-grass-azc3wque.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth",
  NEON_DATA_API_URL:"https://ep-blue-grass-azc3wque.apirest.c-3.ap-southeast-1.aws.neon.tech/neondb/rest/v1",
  NEON_DATABASE_URL:db,
  NEON_AUTH_COOKIE_SECRET:randomBytes(48).toString("hex"),
  NEON_LEGACY_LOGIN_RATE_SALT:randomBytes(48).toString("hex"),
  AI_RATE_LIMIT_SALT:randomBytes(48).toString("hex"),
  NEON_STORAGE_ENDPOINT:s3.endpoint,NEON_STORAGE_REGION:s3.region,
  NEON_STORAGE_ACCESS_KEY_ID:s3.accessKeyId,
  NEON_STORAGE_SECRET_ACCESS_KEY:s3.secretAccessKey,
  SUPABASE_URL:"https://wzkyomerlwcdyyoqfkzn.supabase.co",
  SUPABASE_PUBLISHABLE_KEY:"sb_publishable_inert_staging_only",
};
const child=spawn(process.execPath,[".output/server/index.mjs"],{stdio:"inherit",env});
process.on("SIGINT",()=>child.kill("SIGINT"));
process.on("SIGTERM",()=>child.kill("SIGTERM"));
child.on("exit",code=>process.exitCode=code??1);
