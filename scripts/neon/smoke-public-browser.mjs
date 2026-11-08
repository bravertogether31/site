import {chromium} from "playwright-core";
import assert from "node:assert/strict";
const origin="https://braver-neon-staging-20261107.onrender.com";
const executablePath=process.env.HOME+"/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell";
const routes=["/","/about","/resources","/competitions","/events","/news","/advisors","/team","/safety","/privacy","/community-guidelines","/decoder","/auth?mode=signup"];
const browser=await chromium.launch({executablePath,headless:true,timeout:15000});
const results=[];
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 for(const route of routes){
   const before=errors.length;
   let response;
   try{
     response=await page.goto(origin+route,{waitUntil:"domcontentloaded",timeout:22000});
     await page.waitForTimeout(600);
     const body=await page.locator("body").innerText();
     const status=response?.status();
     const ok=status===200&&body.length>140&&!body.includes("This page didn't load")&&errors.length===before;
     const item={route,status,length:body.length,ok,error:ok?null:errors.at(-1)||body.slice(0,180)};
     results.push(item);
     console.log("PAGE_QA",JSON.stringify(item));
   }catch(e){results.push({route,ok:false,error:String(e).slice(0,220)});console.log("PAGE_QA_ERROR",route,String(e).slice(0,220));}
 }
 const failures=results.filter(x=>!x.ok);
 console.log("PUBLIC_QA_SUMMARY",JSON.stringify({pages:results.length,pass:results.length-failures.length,fail:failures.length}));
 assert.equal(failures.length,0,"Some public pages failed");
}finally{await browser.close();}
