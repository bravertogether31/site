import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from "@aws-sdk/client-s3";
if (process.env.BRAVER_ALLOW_SYNTHETIC_STORAGE_TEST !== "1") throw Error("Isolated-branch test flag required");
const file="/tmp/braver-neon-staging-secrets-20261107/s3.json";
if ((statSync(file).mode&0o077)!==0) throw Error("Storage credential permissions too open");
const s=JSON.parse(readFileSync(file,"utf8"));
if(!new URL(s.endpoint).hostname.startsWith("br-twilight-recipe-azi9p8zg."))throw Error("Refusing non-staging storage endpoint");
const client=new S3Client({
  region:s.region, endpoint:s.endpoint,forcePathStyle:true,
  credentials:{accessKeyId:s.accessKeyId,secretAccessKey:s.secretAccessKey}
});
const origins=["http://localhost:3912","https://braver-neon-staging.onrender.com"];
for(const bucket of ["essay-submissions","advisor-cvs"]){
  await client.send(new PutBucketCorsCommand({Bucket:bucket,CORSConfiguration:{CORSRules:[{
    AllowedOrigins:origins,AllowedMethods:["PUT","GET","HEAD"],
    AllowedHeaders:["content-type","x-amz-*"],ExposeHeaders:["ETag"],MaxAgeSeconds:300,
  }]}}));
  const result=await client.send(new GetBucketCorsCommand({Bucket:bucket}));
  assert.deepEqual(result.CORSRules?.[0]?.AllowedOrigins?.sort(),[...origins].sort());
  console.log("PASS staging signed browser file upload CORS",bucket);
}
