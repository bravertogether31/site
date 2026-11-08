import assert from "node:assert/strict";
import {randomBytes, randomUUID, createHash} from "node:crypto";
import {readFileSync, statSync} from "node:fs";
import {chromium} from "playwright-core";
import {hash as bcryptHash} from "bcryptjs";
import {S3Client, DeleteObjectCommand, HeadObjectCommand} from "@aws-sdk/client-s3";
import pg from "pg";

if(process.env.BRAVER_ALLOW_BROWSER_QA!=="1")throw Error("Explicit isolated browser QA required");
const dir="/tmp/braver-neon-staging-secrets-20261107";
for(const file of ["database-url","s3.json"])if(statSync(dir+"/"+file).mode&0o077)throw Error("Unsafe staging credentials");
const conn=readFileSync(dir+"/database-url","utf8").trim();
if(!new URL(conn).hostname.startsWith("ep-blue-grass-azc3wque"))throw Error("Not isolated staging");
const s3config=JSON.parse(readFileSync(dir+"/s3.json","utf8"));
if(!new URL(s3config.endpoint).hostname.startsWith("br-twilight-recipe-azi9p8zg."))throw Error("Wrong S3 branch");
const s3=new S3Client({endpoint:s3config.endpoint,region:s3config.region,forcePathStyle:true,credentials:{accessKeyId:s3config.accessKeyId,secretAccessKey:s3config.secretAccessKey}});
const id=randomUUID(),competitionId=randomUUID(),slug="neon-qa-"+randomUUID();
const email="braver-essay-qa-"+randomUUID()+"@example.invalid",password="Synthetic!"+randomBytes(25).toString("base64url");
const encrypted=(await bcryptHash(password,10)).replace("$2b$","$2a$");
const pdf=Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n");
const digest=createHash("sha256").update(pdf).digest("hex");
const db=new pg.Client({connectionString:conn,ssl:{rejectUnauthorized:true}});
let userCreated=false,competitionCreated=false,submissionId=null,browser;
const origin="http://localhost:3912";
try{
 await db.connect();
 await db.query("INSERT INTO auth.users(id,email,encrypted_password,email_confirmed_at,created_at,raw_user_meta_data) VALUES($1,$2,$3,now(),now(),$4::jsonb)",[id,email,encrypted,JSON.stringify({display_name:"Synthetic Essay QA",signup_completed:true})]);userCreated=true;
 await db.query("INSERT INTO public.competitions(id,slug,title,summary,status,opens_at,closes_at,minimum_age,maximum_age,minimum_words,maximum_words,is_public,category,prompts,public_rules) VALUES($1,$2,'Synthetic Staging Essay Competition','Isolated automated QA competition for file and data integrity verification','open',now()-interval '1 hour',now()+interval '2 days',12,20,200,5000,true,'essay',ARRAY['Synthetic essay prompt for staging testing'],'Synthetic QA only')",[competitionId,slug]);competitionCreated=true;
 browser=await chromium.launch({headless:true,timeout:14000,executablePath:process.env.HOME+"/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell"});
 const context=await browser.newContext({viewport:{width:1220,height:830}});const page=await context.newPage();
 const errors=[];page.on("pageerror",e=>errors.push(e.message.slice(0,200)));
 await page.goto(origin+"/auth?mode=signin",{waitUntil:"domcontentloaded",timeout:25000});
 await page.getByRole("heading",{name:/sign in to continue/i}).waitFor();
 await page.getByRole("textbox",{name:/email address/i}).fill(email);
 await page.locator('input[type="password"]').first().fill(password);
 await page.getByRole("button",{name:"Sign in",exact:true}).click();
 await page.waitForURL(u=>u.pathname==="/messages",{timeout:24000});
 console.log("PASS member signed into local Neon staging with original password");
 await page.goto(origin+"/essay-submission?competition="+slug,{waitUntil:"domcontentloaded",timeout:25000});
 await page.getByRole("heading",{name:/create your entry/i}).waitFor({timeout:15000});
 await page.getByLabel(/Participant name/).fill("Synthetic Essay QA");
 await page.getByLabel(/^Age/).fill("17");
 await page.getByRole("button",{name:/Select country or territory/}).click();
 await page.getByPlaceholder("Search country or territory").fill("United Arab Emirates");
 await page.getByRole("option",{name:/United Arab Emirates/}).click();
 await page.getByLabel(/Essay title/).fill("Synthetic Original Essay for Neon Verification");
 await page.getByLabel(/Word count/).fill("1200");
 await page.locator("#essay-file").setInputFiles({name:"synthetic-essay.pdf",mimeType:"application/pdf",buffer:pdf});
 await page.getByRole("checkbox").nth(0).check();
 await page.getByRole("checkbox").nth(1).check();
 await page.locator('form button[type="submit"]').click();
 for(let i=0;i<30;i++){
   const r=await db.query("SELECT id,status,file_path FROM public.essay_submissions WHERE user_id=$1 AND competition_id=$2",[id,competitionId]);
   if(r.rows.length){submissionId=r.rows[0].id;if(r.rows[0].status==="submitted"&&r.rows[0].file_path)break;}
   await page.waitForTimeout(750);
 }
 const r=await db.query("SELECT status,file_path,file_sha256,original_filename,submission_code,pending_file_path FROM public.essay_submissions WHERE id=$1",[submissionId]);
 const record=r.rows[0];console.log("ESSAY_RESULT",JSON.stringify({status:record?.status,hasFile:!!record?.file_path,code:record?.submission_code,errors,visible:(await page.locator("body").innerText()).slice(-350)}));
 assert.equal(record?.status,"submitted","Essay upload not finalized");
 assert.ok(record.file_path,"Essay file path missing");
 assert.equal(record.file_sha256,digest);
 assert.equal(record.original_filename,"synthetic-essay.pdf");
 const head=await s3.send(new HeadObjectCommand({Bucket:"essay-submissions",Key:record.file_path}));
 assert.equal(head.ContentLength,pdf.length);
 assert.equal(errors.length,0,"Page JavaScript errors");
 console.log("PASS browser essay submission with signed private Neon upload, matching checksum, and stored receipt");
 await context.close();
}finally{
 if(browser)await browser.close().catch(()=>{});
 try{
  if(submissionId){
   const r=await db.query("SELECT file_path,pending_file_path FROM public.essay_submissions WHERE id=$1",[submissionId]);
   for(const row of r.rows)for(const key of [row.file_path,row.pending_file_path])if(key&&key.startsWith(id+"/"))await s3.send(new DeleteObjectCommand({Bucket:"essay-submissions",Key:key}));
   await db.query("DELETE FROM public.essay_submission_events WHERE submission_id=$1",[submissionId]);
   await db.query("DELETE FROM public.essay_submissions WHERE id=$1",[submissionId]);
  }
  if(competitionCreated)await db.query("DELETE FROM public.competitions WHERE id=$1",[competitionId]);
  if(userCreated){
   await db.query('DELETE FROM neon_auth.session WHERE "userId"=$1',[id]);
   await db.query('DELETE FROM neon_auth.account WHERE "userId"=$1',[id]);
   await db.query('DELETE FROM neon_auth."user" WHERE id=$1',[id]);
   await db.query("DELETE FROM public.user_roles WHERE user_id=$1",[id]);
   await db.query("DELETE FROM public.profiles WHERE id=$1",[id]);
   await db.query("DELETE FROM auth.users WHERE id=$1",[id]);
  }
  console.log("PASS synthetic essay user, competition, submission and private file cleaned");
 }catch(e){console.error("ESSAY_QA_CLEANUP_FAILED",e.code||e.message);process.exitCode=1}
 await db.end().catch(()=>{});
}
