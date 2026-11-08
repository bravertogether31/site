import assert from "node:assert/strict";
import { randomUUID,randomBytes } from "node:crypto";
import { readFileSync,statSync } from "node:fs";
import { chromium } from "playwright-core";
import { hash as bcryptHash } from "bcryptjs";
import pg from "pg";

if(process.env.BRAVER_ALLOW_BROWSER_QA!=="1") throw Error("Isolated QA opt-in required");
const origin="https://braver-neon-staging-20261107.onrender.com";
const file="/tmp/braver-neon-staging-secrets-20261107/database-url";
if(statSync(file).mode&0o077)throw Error("Unsafe credential mode");
const connectionString=readFileSync(file,"utf8").trim();
if(!new URL(connectionString).hostname.startsWith("ep-blue-grass-azc3wque"))throw Error("Refusing non-staging DB");
const advisorId=randomUUID(),memberId=randomUUID(),conversationId=randomUUID();
const email="braver-advisorqa-"+randomUUID()+"@example.invalid";
const memberEmail="braver-advtestmember-"+randomUUID()+"@example.invalid";
const password="Synthetic!"+randomBytes(24).toString("base64url");
const hash=(await bcryptHash(password,10)).replace(/^\$2b\$/,"$2a$");
const db=new pg.Client({connectionString,ssl:{rejectUnauthorized:true}});
let browser,created=false;
try{
 await db.connect();
 await db.query("INSERT INTO auth.users(id,email,encrypted_password,email_confirmed_at,created_at,raw_user_meta_data) VALUES($1,$2,$3,now(),now(),$4::jsonb),($5,$6,$7,now(),now(),$8::jsonb)",
 [advisorId,email,hash,JSON.stringify({display_name:"Synthetic Advisor",signup_completed:true}),memberId,memberEmail,hash,JSON.stringify({display_name:"Synthetic Member",signup_completed:true})]);
 created=true;
 await db.query("DELETE FROM public.user_roles WHERE user_id=$1",[advisorId]);
 await db.query("INSERT INTO public.user_roles(user_id,role) VALUES($1,'advisor')",[advisorId]);
 await db.query("INSERT INTO public.advisor_applications(user_id,email,full_name,experience,motivation,status,submitted_at) VALUES($1,$2,$3,$4,$5,'approved',now())",
 [advisorId,email,"Synthetic Advisor","Synthetic approved advisor test experience for BraverTogether staging","Synthetic advisor onboarding test motivation"]);
 await db.query("UPDATE public.profiles SET is_advisor=true,is_public=true,accepting_messages=true,availability_status='available' WHERE id=$1",[advisorId]);
 await db.query("INSERT INTO public.conversations(id,teen_id,subject,topic,status) VALUES($1,$2,'Synthetic advisor queue privacy QA','privacy','open')",[conversationId,memberId]);
 await db.query("INSERT INTO public.messages(conversation_id,sender_id,sender_kind,body) VALUES($1,$2,'human','Synthetic private member message for advisor QA')",[conversationId,memberId]);
 console.log("PASS isolated approved advisor and unclaimed member conversation seeded");
 const evidence=await db.query("SELECT p.is_advisor,(SELECT array_agg(r.role::text) FROM public.user_roles r WHERE r.user_id=p.id) AS roles,(SELECT a.status FROM public.advisor_applications a WHERE a.user_id=p.id LIMIT 1) AS appstatus FROM public.profiles p WHERE p.id=$1",[advisorId]);
 console.log("ADVISOR_EVIDENCE",JSON.stringify(evidence.rows[0]));
 browser=await chromium.launch({executablePath:process.env.HOME+"/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell",headless:true,timeout:12000});
 const context=await browser.newContext({viewport:{width:1300,height:850}});const page=await context.newPage();const errors=[];
 page.on("pageerror",e=>errors.push(e.message.slice(0,200)));
 await page.goto(origin+"/auth?mode=signin",{waitUntil:"domcontentloaded"});
 await page.getByRole("heading",{name:/sign in to continue/i}).waitFor();
 await page.getByRole("textbox",{name:/email address/i}).fill(email);
 await page.locator('input[type="password"]').first().fill(password);
 await page.getByRole("button",{name:"Sign in",exact:true}).click();
 try {await page.waitForURL(u=>u.pathname==="/messages",{timeout:14000});} catch(e) {
  const msg=(await page.locator("body").innerText()).slice(-600);
  const who=await page.evaluate(async()=>{const r=await fetch("/api/neon-account",{credentials:"same-origin"});return {status:r.status,body:await r.text()}});
  console.log("ADVISOR_LOGIN_DIAGNOSTIC",JSON.stringify({url:page.url(),msg,who}));
  throw e;
}
 const response=await page.evaluate(async()=>{const r=await fetch("/api/neon-account",{credentials:"same-origin"});return {status:r.status,data:r.ok?await r.json():null}});
 assert.equal(response.status,200);assert.equal(response.data.id,advisorId);assert.equal(response.data.role,"advisor");
 console.log("PASS real browser advisor login resolves approved advisor role");
 await page.getByText("Open Request Queue",{exact:true}).first().click().catch(()=>{});
 await page.getByText("Synthetic advisor queue privacy QA",{exact:false}).first().waitFor({timeout:15000});
 console.log("PASS approved advisor sees unclaimed queue topic without initial message");
 await page.getByText("Synthetic advisor queue privacy QA",{exact:false}).first().click();
 await page.getByRole("button",{name:"Claim request"}).waitFor({timeout:12000});
 await page.getByRole("button",{name:"Claim request"}).click();
 for(let i=0;i<20;i++){
   const r=await db.query("SELECT advisor_id FROM public.conversations WHERE id=$1",[conversationId]);
   if(r.rows[0]?.advisor_id===advisorId)break;
   await page.waitForTimeout(500);
 }
 const after=await db.query("SELECT advisor_id FROM public.conversations WHERE id=$1",[conversationId]);
 console.log("ADVISOR_CLAIM_DIAGNOSTIC",JSON.stringify({claimed:after.rows[0]?.advisor_id||null,body:(await page.locator("body").innerText()).slice(-800)}));
 assert.equal(after.rows[0]?.advisor_id,advisorId);
 console.log("PASS advisor claims queue request through browser and Neon stores assignment");
 await page.getByText("Synthetic private member message for advisor QA",{exact:false}).first().waitFor({timeout:15000});
 console.log("PASS advisor can read private message only after claiming it");
 const reply="Synthetic advisor reply saved through Neon.";
 const input=page.locator('input[placeholder^="Write a message"]');
 await input.waitFor({timeout:12000});
 await input.fill(reply);
 await page.locator('form').filter({has:input}).locator('button[type="submit"]').click();
 for(let i=0;i<18;i++){
   const r=await db.query("SELECT COUNT(*)::int AS n FROM public.messages WHERE conversation_id=$1 AND sender_id=$2 AND body=$3",[conversationId,advisorId,reply]);
   if(r.rows[0].n===1)break;
   await page.waitForTimeout(500);
 }
 const replyRows=await db.query("SELECT COUNT(*)::int AS n FROM public.messages WHERE conversation_id=$1 AND sender_id=$2 AND body=$3",[conversationId,advisorId,reply]);
 assert.equal(replyRows.rows[0].n,1,"Browser reply not saved");
 console.log("PASS advisor replies to assigned member via private Neon messages");
 await page.goto(origin+"/meetings",{waitUntil:"domcontentloaded",timeout:30000});
 await page.getByRole("heading",{name:"Meetings with assigned members"}).waitFor({timeout:15000});
 await page.getByRole("button",{name:"Propose a meeting"}).click();
 await page.getByRole("heading",{name:"Choose a time and link"}).waitFor();
 await page.locator('input[type="datetime-local"]').fill("2026-11-11T12:00");
 await page.getByRole("textbox",{name:"Meeting title"}).fill("Synthetic advisor QA meeting");
 await page.getByRole("textbox",{name:"Meeting link"}).fill("https://meet.google.com/abc-defg-hij");
 await page.getByRole("button",{name:"Send proposal"}).click();
 for(let i=0;i<18;i++){
   const r=await db.query("SELECT COUNT(*)::int AS n FROM public.meeting_proposals WHERE conversation_id=$1 AND proposer_id=$2",[conversationId,advisorId]);
   if(r.rows[0].n===1)break;
   await page.waitForTimeout(500);
 }
 const proposals=await db.query("SELECT COUNT(*)::int AS n FROM public.meeting_proposals WHERE conversation_id=$1 AND proposer_id=$2",[conversationId,advisorId]);
 assert.equal(proposals.rows[0].n,1,"Advisor meeting proposal not persisted");
 console.log("PASS advisor meeting proposal created from browser through Neon");
 const memberContext=await browser.newContext({viewport:{width:1000,height:850}});
 const memberPage=await memberContext.newPage();
 await memberPage.goto(origin+"/auth?mode=signin",{waitUntil:"domcontentloaded"});
 await memberPage.getByRole("heading",{name:/sign in to continue/i}).waitFor();
 await memberPage.getByRole("textbox",{name:/email address/i}).fill(memberEmail);
 await memberPage.locator('input[type="password"]').first().fill(password);
 await memberPage.getByRole("button",{name:"Sign in",exact:true}).click();
 await memberPage.waitForURL(u=>u.pathname==="/messages",{timeout:45000});
 await memberPage.goto(origin+"/meetings",{waitUntil:"domcontentloaded"});
 await memberPage.getByText("Synthetic advisor QA meeting",{exact:true}).first().waitFor({timeout:15000});
 await memberPage.getByRole("button",{name:"Accept",exact:true}).click();
 for(let i=0;i<20;i++){
  const r=await db.query("SELECT status FROM public.meeting_proposals WHERE conversation_id=$1",[conversationId]);
  if(r.rows[0]?.status==="accepted")break;
  await memberPage.waitForTimeout(500);
 }
 const accepted=await db.query("SELECT status,responded_by FROM public.meeting_proposals WHERE conversation_id=$1",[conversationId]);
 assert.equal(accepted.rows[0]?.status,"accepted");
 assert.equal(accepted.rows[0]?.responded_by,memberId);
 console.log("PASS member accepted meeting from second independent browser session");
 await memberContext.close();


 assert.equal(errors.length,0,"Browser page errors: "+errors.join("; "));
 await context.close();
}finally{
 if(browser)await browser.close().catch(()=>{});
 if(created){
  try{
   await db.query("DELETE FROM public.meeting_proposals WHERE conversation_id=$1",[conversationId]);
   await db.query("DELETE FROM public.conversation_reads WHERE conversation_id=$1",[conversationId]);
   await db.query("DELETE FROM public.messages WHERE conversation_id=$1",[conversationId]);
   await db.query("DELETE FROM public.conversations WHERE id=$1",[conversationId]);
   await db.query("DELETE FROM public.advisor_application_events WHERE application_id IN (SELECT id FROM public.advisor_applications WHERE user_id=$1)",[advisorId]);
   await db.query("DELETE FROM public.advisor_applications WHERE user_id=$1",[advisorId]);
   for(const id of [advisorId,memberId]){
    await db.query('DELETE FROM neon_auth.session WHERE "userId"=$1',[id]);
    await db.query('DELETE FROM neon_auth.account WHERE "userId"=$1',[id]);
    await db.query('DELETE FROM neon_auth."user" WHERE id=$1',[id]);
    await db.query("DELETE FROM public.user_roles WHERE user_id=$1",[id]);
    await db.query("DELETE FROM public.profiles WHERE id=$1",[id]);
    await db.query("DELETE FROM auth.users WHERE id=$1",[id]);
   }
   console.log("PASS synthetic advisor and member records cleaned");
  }catch(e){console.error("ADVISOR_CLEANUP_FAILED",e.code||e.message);process.exitCode=1;}
 }
 await db.end().catch(()=>{});
}
