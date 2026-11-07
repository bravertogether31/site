import assert from "node:assert/strict";
import {randomUUID,randomBytes} from "node:crypto";
import {readFileSync,statSync} from "node:fs";
import {chromium} from "playwright-core";
import pg from "pg";
import {hash as bcryptHash} from "bcryptjs";

if(process.env.BRAVER_ALLOW_BROWSER_QA!=="1")throw Error("Explicit isolated browser QA required");
const path="/tmp/braver-neon-staging-secrets-20261107/database-url";
if((statSync(path).mode&0o077)!==0)throw Error("Unsafe staging secrets");
const url=readFileSync(path,"utf8").trim();
if(!new URL(url).hostname.startsWith("ep-blue-grass-azc3wque"))throw Error("Not staging DB");
const db=new pg.Client({connectionString:url,ssl:{rejectUnauthorized:true}});
const baseOrigin=process.env.BRAVER_BROWSER_QA_ORIGIN||"http://localhost:3912";
if(!["http://localhost:3912","https://braver-neon-staging-20261107.onrender.com"].includes(baseOrigin))throw Error("Refusing unknown QA browser origin");
const id=randomUUID(),email="braver-browser-qa-"+randomUUID()+"@example.invalid";
const password="Synthetic!"+randomBytes(30).toString("base64url");
const oldHash=(await bcryptHash(password,10)).replace(/^\$2b\$/,"$2a$");
let browser,created=false,createdConversationId=null;
try{
 await db.connect();
 await db.query(
   "INSERT INTO auth.users(id,email,encrypted_password,email_confirmed_at,created_at,raw_user_meta_data) VALUES($1,$2,$3,now(),now(),$4::jsonb)",
   [id,email,oldHash,JSON.stringify({display_name:"Braver Browser QA",signup_completed:true})],
 );
 created=true;
 const executablePath=process.env.HOME+"/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell";
 browser=await chromium.launch({executablePath,headless:true,timeout:12000,
   args:["--no-first-run","--no-default-browser-check","--disable-extensions"]});
 const context=await browser.newContext({viewport:{width:1280,height:800}});
 const errors=[];
 const page=await context.newPage();
 page.on("pageerror",error=>errors.push(error.message.slice(0,180)));
 await page.goto(baseOrigin+"/auth?mode=signin",{waitUntil:"domcontentloaded",timeout:25000});
 await page.getByRole("heading",{name:/sign in to continue/i}).waitFor({timeout:25000});
 console.log("PASS isolated Chromium loads Neon native sign-in screen");
 await page.getByRole("textbox",{name:/email address/i}).fill(email);
 await page.locator('input[type="password"]').first().fill(password);
 await page.getByRole("button",{name:"Sign in",exact:true}).click();
 await page.waitForURL(url=>url.pathname==="/messages",{timeout:55000});
 console.log("PASS actual browser migrates legacy bcrypt account and reaches member messages");
 await page.waitForTimeout(2500);
 const body=await page.locator("body").innerText();
 console.log("MEMBER_PAGE_DIAGNOSTIC",JSON.stringify({url:page.url(),length:body.length,preview:body.slice(0,300),pageErrors:errors.slice(0,4)}));
 assert.ok(body.length>100,"Member messages page did not render");
 const member=await page.evaluate(async()=>{
   const res=await fetch("/api/neon-account",{credentials:"same-origin"});
   return {status:res.status,body:res.ok?await res.json():null};
 });
 assert.equal(member.status,200,"Browser session not valid");
 assert.equal(member.body.id,id);
 assert.equal(member.body.role,"member");
 console.log("PASS browser session and server-side member role match user");
 await page.getByRole("button",{name:"New support request"}).first().click();
 await page.getByRole("heading",{name:"Ask the advisor team"}).waitFor({timeout:15000});
 await page.getByRole("textbox",{name:"Subject"}).fill("Synthetic Browser QA Request");
 await page.getByRole("textbox",{name:"Your question"}).fill("Synthetic browser integration test for the Neon migration with no real personal details.");
 await page.getByRole("button",{name:"Create support request"}).click();
 for(let i=0;i<20;i++){
   const request=await db.query("SELECT id FROM public.conversations WHERE teen_id=$1 AND subject=$2",[id,"Synthetic Browser QA Request"]);
   if(request.rows.length){createdConversationId=request.rows[0].id;break;}
   await page.waitForTimeout(500);
 }
 if(!createdConversationId)throw Error("Browser support request form did not create a conversation: "+(await page.locator("body").innerText()).slice(-300));
 const count=await db.query("SELECT COUNT(*)::int AS n FROM public.messages WHERE conversation_id=$1",[createdConversationId]);
 assert.ok(count.rows[0].n>=1,"Initial question missing from messages");
 console.log("PASS member browser support request created conversation and initial message");

 await page.goto(baseOrigin+"/profile",{waitUntil:"domcontentloaded"});
 await page.waitForLoadState("networkidle",{timeout:30000}).catch(()=>{});
 assert.equal(new URL(page.url()).pathname,"/profile","Profile redirected away from signed-in account");
 console.log("PASS protected member profile route opens in browser");
 const authenticatedPages=["/meetings","/essay-submission","/advisor-application"];
 for (const path of authenticatedPages) {
   const response=await page.goto(baseOrigin+path,{waitUntil:"domcontentloaded",timeout:30000});
   await page.waitForTimeout(800);
   const actual=new URL(page.url()).pathname;
   const length=(await page.locator("body").innerText()).length;
   console.log("AUTHENTICATED_PAGE",JSON.stringify({path,status:response?.status(),actual,textLength:length}));
   assert.equal(response?.status(),200,"Member page HTTP error: "+path);
   assert.equal(actual,path,"Member page incorrectly redirected: "+path);
   assert.ok(length>250,"Member page blank or stuck: "+path);
 }
 console.log("PASS member meetings, essay submission and advisor application render");
 const adminPages=["/admin-advisors","/admin-competitions","/admin-reports"];
 for(const path of adminPages){
   await page.goto(baseOrigin+path,{waitUntil:"domcontentloaded",timeout:30000});
   await page.waitForTimeout(800);
   const adminUrl=new URL(page.url()).pathname;
   const body=(await page.locator("body").innerText()).slice(0,1300);
   console.log("ADMIN_MEMBER_VIEW",JSON.stringify({path,url:adminUrl,body:body.slice(-380)}));
 }
 console.log("PASS regular member denied administrator routes");

 const anonContext=await browser.newContext({viewport:{width:375,height:780}});
 const guest=await anonContext.newPage();
 await guest.goto(baseOrigin+"/messages",{waitUntil:"domcontentloaded"});
 await guest.waitForURL(u=>u.pathname==="/auth",{timeout:20000});
 console.log("PASS anonymous browser redirected from protected messages");
 await anonContext.close();
 if(errors.length)console.log("BROWSER_PAGEERROR_COUNT",errors.length,errors.slice(0,3));
 await context.close();
}finally{
 if(browser)await browser.close().catch(()=>{});
 if(created){
   try{
     if(createdConversationId){
       await db.query("DELETE FROM public.messages WHERE conversation_id=$1",[createdConversationId]);
       await db.query("DELETE FROM public.conversation_reads WHERE conversation_id=$1",[createdConversationId]);
       await db.query("DELETE FROM public.conversations WHERE id=$1",[createdConversationId]);
     }
     await db.query('DELETE FROM neon_auth.session WHERE "userId"=$1',[id]);
     await db.query('DELETE FROM neon_auth.account WHERE "userId"=$1',[id]);
     await db.query('DELETE FROM neon_auth."user" WHERE id=$1',[id]);
     await db.query("DELETE FROM public.user_roles WHERE user_id=$1",[id]);
     await db.query("DELETE FROM public.profiles WHERE id=$1",[id]);
     await db.query("DELETE FROM auth.users WHERE id=$1",[id]);
     console.log("PASS isolated browser QA account and sessions removed");
   }catch(err){console.error("BROWSER_QA_CLEANUP_FAILED",err?.code||"unknown");process.exitCode=1}
 }
 await db.end().catch(()=>{});
}
