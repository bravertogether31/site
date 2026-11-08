import assert from "node:assert/strict";
import {randomBytes, randomUUID, createHash} from "node:crypto";
import {readFileSync, statSync} from "node:fs";
import {chromium} from "playwright-core";
import {hash as bcryptHash} from "bcryptjs";
import {S3Client, DeleteObjectCommand, HeadObjectCommand} from "@aws-sdk/client-s3";
import pg from "pg";

if (process.env.BRAVER_ALLOW_BROWSER_QA !== "1") throw new Error("Staging QA opt-in required");
const origin = process.env.BRAVER_QA_ORIGIN || "https://braver-neon-staging-20261107.onrender.com";
if (!["http://localhost:3912", "https://braver-neon-staging-20261107.onrender.com"].includes(origin)) throw Error("Unknown staging origin");
const dir = "/tmp/braver-neon-staging-secrets-20261107";
for(const name of ["database-url","s3.json"]) if(statSync(dir+"/"+name).mode & 0o077) throw new Error("Unsafe private staging secret");
const conn = readFileSync(dir+"/database-url","utf8").trim();
if(!new URL(conn).hostname.startsWith("ep-blue-grass-azc3wque"))throw new Error("Not isolated staging database");
const config = JSON.parse(readFileSync(dir+"/s3.json","utf8"));
if(!new URL(config.endpoint).hostname.startsWith("br-twilight-recipe-azi9p8zg.")) throw Error("Not isolated staging S3");
const s3 = new S3Client({endpoint:config.endpoint,region:config.region,forcePathStyle:true,credentials:{accessKeyId:config.accessKeyId,secretAccessKey:config.secretAccessKey}});
const id=randomUUID(),email="braver-cv-qa-"+randomUUID()+"@example.invalid";
const password="Synthetic!"+randomBytes(25).toString("base64url");
const hash=(await bcryptHash(password,10)).replace("$2b$","$2a$");
const db=new pg.Client({connectionString:conn,ssl:{rejectUnauthorized:true}});
let created=false,browser,cvKey=null;
const pdf=Buffer.from("%PDF-1.4\\n1 0 obj<</Type/Catalog>>endobj\\ntrailer<</Root 1 0 R>>\\n%%EOF\\n");
const sha=createHash("sha256").update(pdf).digest("hex");
try {
 await db.connect();
 await db.query("INSERT INTO auth.users(id,email,encrypted_password,email_confirmed_at,created_at,raw_user_meta_data) VALUES($1,$2,$3,now(),now(),$4::jsonb)",[id,email,hash,JSON.stringify({display_name:"Synthetic CV QA",signup_completed:true})]);
 created=true;
 browser=await chromium.launch({headless:true,timeout:14000,executablePath:process.env.HOME+"/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell"});
 const context=await browser.newContext({viewport:{width:1240,height:820}});
 const page=await context.newPage();
 const errors=[]; const failures=[];
 page.on("pageerror",e=>errors.push(e.message.slice(0,200)));
 page.on("response",res=>{if(res.status()>=400)failures.push({status:res.status(),url:res.url().slice(0,160)})});
 await page.goto(origin+"/auth?mode=signin",{waitUntil:"domcontentloaded",timeout:35000});
 await page.getByRole("heading",{name:/sign in to continue/i}).waitFor();
 await page.getByRole("textbox",{name:/email address/i}).fill(email);
 await page.locator('input[type="password"]').first().fill(password);
 await page.getByRole("button",{name:"Sign in",exact:true}).click();
 try { await page.waitForURL(u=>u.pathname==="/messages",{timeout:22000}); } catch (e) { console.log("SIGNIN_DIAGNOSTIC",JSON.stringify({url:page.url(),body:(await page.locator("body").innerText()).slice(-450)})); throw e; }
 console.log("PASS synthetic member signs into HTTPS Neon staging");
 await page.goto(origin+"/advisor-application",{waitUntil:"domcontentloaded",timeout:35000});
 await page.getByRole("heading",{name:/help young people understand/i}).waitFor({timeout:15000});
 await page.getByLabel(/Full name/).fill("Synthetic CV QA");
 await page.getByLabel(/Email address/).fill(email);
 await page.getByLabel(/Focus areas/).fill("Digital privacy, Online safety");
 await page.getByLabel(/Relevant education and experience/).fill("Synthetic volunteer qualifications from a browser integration testing account; this is not a real application.");
 await page.getByLabel(/Why would you like to volunteer/).fill("Synthetic motivation to validate encrypted document uploads and metadata on a safe isolated staging branch.");
 await page.locator("#advisor-cv-file").setInputFiles({name:"synthetic-advisor.pdf",mimeType:"application/pdf",buffer:pdf});
 await page.getByRole("button",{name:/submit application/i}).click();
 for(let i=0;i<45;i++){
   const rows=await db.query("SELECT id,status,cv_file_path,cv_original_filename,cv_file_sha256,pending_cv_file_path FROM public.advisor_applications WHERE user_id=$1",[id]);
   if(rows.rows[0]){cvKey=rows.rows[0].cv_file_path||rows.rows[0].pending_cv_file_path; if(rows.rows[0].status==="pending"&&rows.rows[0].cv_file_path)break;}
   await page.waitForTimeout(800);
 }
 const state=await db.query("SELECT id,status,cv_file_path,cv_original_filename,cv_file_sha256,pending_cv_file_path FROM public.advisor_applications WHERE user_id=$1",[id]);
 const row=state.rows[0];
 console.log("CV_RESULT",JSON.stringify({hasRecord:!!row,status:row?.status,hasFile:!!row?.cv_file_path,hasPending:!!row?.pending_cv_file_path,errors,failedNetwork:failures.slice(-6),visible:(await page.locator("body").innerText()).slice(-430)}));
 assert.equal(row?.status,"pending","Advisor CV application did not finalize");
 assert.ok(row.cv_file_path,"Saved CV file path missing");
 assert.equal(row.cv_file_sha256,sha,"CV document integrity mismatch");
 assert.equal(row.cv_original_filename,"synthetic-advisor.pdf");
 console.log("PASS real browser signed file upload, server-side PDF SHA-256 verification and pending advisor submission");
 const head=await s3.send(new HeadObjectCommand({Bucket:"advisor-cvs",Key:row.cv_file_path}));
 assert.equal(head.ContentLength,pdf.length);
 console.log("PASS private Neon bucket contains correct validated CV bytes");
 assert.equal(errors.length,0,"Browser JavaScript error");
 await context.close();
} finally {
 if(browser)await browser.close().catch(()=>{});
 if(created){
  try{
   const apps=await db.query("SELECT id,cv_file_path,pending_cv_file_path FROM public.advisor_applications WHERE user_id=$1",[id]);
   for(const x of apps.rows){
     for(const key of [x.cv_file_path,x.pending_cv_file_path]){
       if(key && key.startsWith(id+"/")) await s3.send(new DeleteObjectCommand({Bucket:"advisor-cvs",Key:key}));
     }
     await db.query("DELETE FROM public.advisor_application_events WHERE application_id=$1",[x.id]);
   }
   await db.query("DELETE FROM public.advisor_applications WHERE user_id=$1",[id]);
   await db.query("DELETE FROM public.advisor_onboarding_intents WHERE user_id=$1",[id]);
   await db.query('DELETE FROM neon_auth.session WHERE "userId"=$1',[id]);
   await db.query('DELETE FROM neon_auth.account WHERE "userId"=$1',[id]);
   await db.query('DELETE FROM neon_auth."user" WHERE id=$1',[id]);
   await db.query("DELETE FROM public.user_roles WHERE user_id=$1",[id]);
   await db.query("DELETE FROM public.profiles WHERE id=$1",[id]);
   await db.query("DELETE FROM auth.users WHERE id=$1",[id]);
   console.log("PASS synthetic CV applicant, file, and sessions cleaned");
  } catch(e){console.error("CV_QA_CLEANUP_FAILED",e?.code||e?.message);process.exitCode=1;}
 }
 await db.end().catch(()=>{});
}
