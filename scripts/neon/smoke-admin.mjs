import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {readFileSync,statSync} from "node:fs";

const path="/tmp/braver-neon-staging-secrets-20261107/database-url";
if(process.env.BRAVER_ALLOW_SYNTHETIC_ADMIN_TEST!=="1")throw Error("Admin test flag required");
if((statSync(path).mode&0o077)!==0)throw Error("Unsafe staging DB URL permissions");
const dburl=readFileSync(path,"utf8").trim();
if(!new URL(dburl).hostname.startsWith("ep-blue-grass-azc3wque"))throw Error("Refusing to mutate non-staging database");
process.env.NEON_DATABASE_URL=dburl;
process.env.BRAVER_AUTH_PROVIDER="neon";
const loaded=await import("../../src/integrations/neon/admin.server.ts");
const {getNeonAdminClient}=loaded.default??loaded;
const client=getNeonAdminClient();
const id=randomUUID();
const email="braver-synthetic-"+id+"@example.invalid";
let recordInserted=false;
try{
 const empty=await client.from("chapter_interest_submissions").select("id").eq("id",id).maybeSingle();
 assert.equal(empty.error,null);assert.equal(empty.data,null);
 const payload={
   id,name:"Braver Synthetic Integration",email,nationality:"Test",
   location:"Synthetic",age:22,interested_people:1,notes:"Temporary QA",
 };
 const saved=await client.from("chapter_interest_submissions").insert(payload).select("id,email").single();
 assert.equal(saved.error,null,saved.error?.message);assert.equal(saved.data.id,id);
 recordInserted=true;
 const read=await client.from("chapter_interest_submissions").select("id,email").ilike("email",email.toUpperCase()).limit(2);
 assert.equal(read.error,null);assert.equal(read.data.length,1);assert.equal(read.data[0].id,id);
 console.log("PASS Neon PostgreSQL admin insert and ILIKE select");
 const update=await client.from("chapter_interest_submissions").update({notes:"Updated QA"}).eq("id",id).select("notes").maybeSingle();
 assert.equal(update.error,null);assert.equal(update.data.notes,"Updated QA");
 const upsert=await client.from("chapter_interest_submissions").upsert({...payload,notes:"UPSERT QA"},{onConflict:"id"}).select("notes").single();
 assert.equal(upsert.error,null,upsert.error?.message);assert.equal(upsert.data.notes,"UPSERT QA");
 console.log("PASS Neon admin update, safe upsert and returning");
 const rejected=await client.from("chapter_interest_submissions").update({notes:"UNSAFE"});
 assert.ok(rejected.error,"Unfiltered admin UPDATE was allowed");
 const invalid=await client.from("chapter_interest_submissions").eq("id",id).in("id",[]).select("*");
 assert.equal(invalid.data.length,0);
 console.log("PASS Unfiltered writes refused and empty IN safe");
 const never=await client.from("chapter_interest_submissions").select("id").eq("id",randomUUID()).single();
 assert.ok(never.error,"Single cardinality must reject missing rows");
 const list=await client.from("chapter_interest_submissions").select("id").order("created_at",{ascending:false}).limit(1);
 assert.equal(list.error,null);
 const rpcKey="braver-qa-"+randomUUID();
 const allowance=await client.rpc("consume_ai_allowance",{p_feature:"decoder",p_actor_key:rpcKey,p_limit:3});
 assert.equal(allowance.error,null,allowance.error?.message);
 console.log("PASS Stored procedure consume_ai_allowance via Neon owner connection");
 const cleanup=await client.from("ai_usage_daily").delete().eq("actor_key",rpcKey);
 assert.equal(cleanup.error,null);
}finally{
 if(recordInserted){
   const cleanup=await client.from("chapter_interest_submissions").delete().eq("id",id);
   if(cleanup.error){console.error("Synthetic cleanup failed",cleanup.error.message);process.exitCode=1}
   else console.log("PASS synthetic staging database row removed");
 }
}
