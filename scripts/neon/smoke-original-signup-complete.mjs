import assert from "node:assert/strict";
import {randomUUID,randomBytes} from "node:crypto";
import {readFileSync,statSync} from "node:fs";
import pg from "pg";
import {chromium} from "playwright-core";
import {hashPassword} from "better-auth/crypto";
const root="/tmp/braver-neon-staging-secrets-20261107/database-url";
if(process.env.BRAVER_ALLOW_BROWSER_QA!=="1")throw Error("Staging test explicitly required");
if(statSync(root).mode&0o077)throw Error("Unsafe staging database credentials");
const connectionString=readFileSync(root,"utf8").trim();
if(!new URL(connectionString).hostname.startsWith("ep-blue-grass-azc3wque"))throw Error("Not isolated staging DB");
const db=new pg.Client({connectionString,ssl:{rejectUnauthorized:true}});
const id=randomUUID(),email="braver-original-steps-"+randomUUID()+"@example.invalid";
const temporary="Temp-Password!"+randomBytes(24).toString("base64url");
const newPassword="New-Password!"+randomBytes(24).toString("base64url");
let browser,inserted=false;
try {
 await db.connect();
 await db.query(
  'INSERT INTO neon_auth."user"(id,name,email,"emailVerified","createdAt","updatedAt") VALUES ($1,$2,$3,true,now(),now())',
  [id,"Synthetic Original Signup QA",email],
 );inserted=true;
 await db.query(
  'INSERT INTO neon_auth.account("accountId","providerId","userId",password,"createdAt","updatedAt") VALUES ($1::text,\'credential\',$1::uuid,$2,now(),now())',
  [id,await hashPassword(temporary)],
 );
 const initial=await db.query("SELECT raw_user_meta_data->>'signup_completed' AS completed FROM auth.users WHERE id=$1",[id]);
 assert.equal(initial.rows[0]?.completed,"false","Native signup trigger must mark pending");
 browser=await chromium.launch({headless:true,executablePath:process.env.HOME+"/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell",timeout:15000});
 const page=await browser.newPage({viewport:{width:1280,height:850}});
 page.on("pageerror",error=>console.log("QA_BROWSER_ERROR",error.message.slice(0,220)));
 const origin="http://localhost:3912";
 await page.goto(origin+"/auth?mode=signin",{waitUntil:"domcontentloaded",timeout:25000});
 await page.locator('input[placeholder="you@example.com"]').first().fill(email);
 await page.locator("input[type=password]").first().fill(temporary);
 await page.locator("form button[type=submit]").click();
 await page.waitForURL(u=>u.pathname==="/messages",{timeout:35000});
 console.log("PASS temporary synthetic verified session established for post-OTP signup step");
 await page.evaluate(({id,email})=>{
  sessionStorage.setItem("braver_together_signup",JSON.stringify({email,fullName:"Synthetic Original Signup QA",step:"password",verifiedUserId:id}));
 },{id,email});
 await page.goto(origin+"/auth?mode=signup",{waitUntil:"domcontentloaded",timeout:25000});
 await page.locator('form input[type="password"]').first().waitFor({timeout:15000});
 const progress=(await page.locator("body").innerText()).slice(0,800);
 assert.ok(progress.includes("Create")||progress.includes("password"),"Original password creation step not visible");
 const fields=page.locator('form input[type="password"]');
 assert.equal(await fields.count(),2,"Expected original matching-password form");
 await fields.nth(0).fill(newPassword);
 await fields.nth(1).fill(newPassword);
 await page.locator("form button[type=submit]").click();
 await page.waitForURL(u=>u.pathname==="/messages",{timeout:30000});
 const result=await db.query("SELECT raw_user_meta_data->>'signup_completed' AS completed FROM auth.users WHERE id=$1",[id]);
 assert.equal(result.rows[0]?.completed,"true");
 console.log("PASS original password creation screen completed pending Neon signup");
 await page.getByRole("button",{name:"Account",exact:true}).click();
 await page.getByRole("menu").getByRole("button",{name:"Sign out",exact:true}).click();
 await page.waitForURL(u=>u.pathname==="/",{timeout:20000});
 await page.goto(origin+"/auth?mode=signin",{waitUntil:"domcontentloaded"});
 await page.locator('input[placeholder="you@example.com"]').first().fill(email);
 await page.locator("input[type=password]").first().fill(newPassword);
 await page.locator("form button[type=submit]").click();
 await page.waitForURL(u=>u.pathname==="/messages",{timeout:30000});
 console.log("PASS original sign-in screen accepts newly established Neon password");
}finally{
 if(browser)await browser.close().catch(()=>{});
 if(inserted){
  try{
   await db.query('DELETE FROM neon_auth.session WHERE "userId"=$1',[id]);
   await db.query('DELETE FROM neon_auth.account WHERE "userId"=$1',[id]);
   await db.query('DELETE FROM neon_auth."user" WHERE id=$1',[id]);
   await db.query("DELETE FROM public.user_roles WHERE user_id=$1",[id]);
   await db.query("DELETE FROM public.profiles WHERE id=$1",[id]);
   await db.query("DELETE FROM auth.users WHERE id=$1",[id]);
   console.log("PASS synthetic pending-signup test identity cleaned");
  }catch(error){console.error("QA_CLEANUP_FAILED",error.message);process.exitCode=1;}
 }
 await db.end().catch(()=>{});
}
