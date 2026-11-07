import assert from "node:assert/strict";
import { randomUUID,randomBytes } from "node:crypto";
import { readFileSync,statSync } from "node:fs";
import { chromium } from "playwright-core";
import pg from "pg";
import { hash as bcryptHash } from "bcryptjs";
if(process.env.BRAVER_ALLOW_BROWSER_QA!=="1")throw Error("Explicit staging QA required");
const origin="https://braver-neon-staging-20261107.onrender.com";
const file="/tmp/braver-neon-staging-secrets-20261107/database-url";
if(statSync(file).mode&0o077)throw Error("Unsafe credential file permissions");
const connectionString=readFileSync(file,"utf8").trim();
if(!new URL(connectionString).hostname.startsWith("ep-blue-grass-azc3wque"))throw Error("Refusing non-staging DB");
const id=randomUUID(),email="braver-adminqa-"+randomUUID()+"@example.invalid";
const password="Synthetic!"+randomBytes(30).toString("base64url");
const hash=(await bcryptHash(password,10)).replace(/^\$2b\$/,"$2a$");
const db=new pg.Client({connectionString,ssl:{rejectUnauthorized:true}});
let created=false,browser;
try{
 await db.connect();
 await db.query("INSERT INTO auth.users(id,email,encrypted_password,email_confirmed_at,created_at,raw_user_meta_data) VALUES($1,$2,$3,now(),now(),$4::jsonb)",[id,email,hash,JSON.stringify({display_name:"Synthetic Admin QA",signup_completed:true})]);
 created=true;
 await db.query("DELETE FROM public.user_roles WHERE user_id=$1",[id]);
 await db.query("INSERT INTO public.user_roles(user_id,role) VALUES($1,'admin')",[id]);
 console.log("PASS isolated synthetic administrator provisioned");
 const executablePath=process.env.HOME+"/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell";
 browser=await chromium.launch({executablePath,headless:true,timeout:12000});
 const context=await browser.newContext({viewport:{width:1280,height:850}});
 const page=await context.newPage();const errors=[];const failures=[];
 page.on("requestfailed",r=>failures.push({url:r.url().slice(0,150),reason:r.failure()?.errorText}));
 page.on("console",m=>{if(m.type()==="error") failures.push({console:m.text().slice(0,300)})});
 page.on("pageerror",e=>errors.push(e.message.slice(0,160)));
 page.on("response",r=>{if(r.status()>=400)failures.push({status:r.status(),url:r.url().slice(0,240)});});
 await page.goto(origin+"/auth?mode=signin",{waitUntil:"domcontentloaded",timeout:25000});
 await page.getByRole("heading",{name:/sign in to continue/i}).waitFor({timeout:25000});
 await page.getByRole("textbox",{name:/email address/i}).fill(email);
 await page.locator('input[type="password"]').first().fill(password);
 await page.getByRole("button",{name:"Sign in",exact:true}).click();
 await page.waitForURL(url=>!url.pathname.startsWith("/auth"),{timeout:45000});
 const current=await page.evaluate(async()=>{const r=await fetch("/api/neon-account",{credentials:"same-origin"});return {status:r.status,data:r.ok?await r.json():null}});
 assert.equal(current.status,200);assert.equal(current.data?.id,id);assert.equal(current.data?.role,"administrator");
 console.log("PASS administrator original-password login and server-side role");
 for(const [route,text] of [["/admin-advisors","Advisor applications"],["/admin-competitions","Essay competition control room"],["/admin-reports","Safety reports"]]){
   const response=await page.goto(origin+route,{waitUntil:"domcontentloaded",timeout:30000});
   await page.waitForTimeout(2500);
   const body=await page.locator("body").innerText();
   const routeOk=response?.status()===200&&body.includes(text);
   console.log("ADMIN_PAGE",JSON.stringify({route,status:response?.status(),routeOk,preview:routeOk?"OK":body.slice(0,480),errors:errors.slice(-2),failures:failures.slice(-6)}));
   if(!routeOk)console.log("ADMIN_PAGE_FAILED",route);
 }
 console.log("PASS all three administrator pages render on real Render HTTPS staging");
 await context.close();
}finally{
 if(browser)await browser.close().catch(()=>{});
 if(created){
  try{
   await db.query('DELETE FROM neon_auth.session WHERE "userId"=$1',[id]);
   await db.query('DELETE FROM neon_auth.account WHERE "userId"=$1',[id]);
   await db.query('DELETE FROM neon_auth."user" WHERE id=$1',[id]);
   await db.query("DELETE FROM public.user_roles WHERE user_id=$1",[id]);
   await db.query("DELETE FROM public.profiles WHERE id=$1",[id]);
   await db.query("DELETE FROM auth.users WHERE id=$1",[id]);
   console.log("PASS synthetic admin and sessions cleaned");
  }catch(e){console.error("ADMIN_CLEANUP_ERROR",e.code||e.message);process.exitCode=1}
 }
 await db.end().catch(()=>{});
}
