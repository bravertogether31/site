import { PostgrestClient } from "@supabase/postgrest-js";
import type { User } from "@supabase/supabase-js";

// Browser-only Neon Data API adapter with first-party session and JWT proxy.
function dataApiUrl(): string {
  const configured = import.meta.env.VITE_NEON_DATA_API_URL;
  if (!configured) throw new Error("Neon Data API frontend URL not configured");
  const url = new URL(configured);
  if (
    url.protocol !== "https:" || !url.hostname.endsWith(".neon.tech") ||
    !url.hostname.includes(".apirest.") || !url.pathname.endsWith("/rest/v1") ||
    url.username || url.password || url.search || url.hash
  ) throw new Error("Unexpected Neon public API");
  return configured;
}

type Identity = {id:string;email:string;name?:string;createdAt?:string;emailVerified?:boolean};
function convertUser(user:Identity|null|undefined):User|null {
  if (!user?.id || !user.email || user.emailVerified !== true) return null;
  return {
    id:user.id, email:user.email,
    aud:"authenticated",created_at:user.createdAt||"",
    app_metadata:{},user_metadata:{full_name:user.name||"",signup_completed:true},
  } as User;
}
let cachedIdentity:Promise<User|null>|null=null;
let tokenPromise:Promise<string|null>|null=null;

async function currentUser(fresh=false):Promise<User|null> {
  if (!cachedIdentity || fresh) {
    cachedIdentity=fetch("/api/neon-auth/get-session",{credentials:"same-origin",cache:"no-store"})
      .then(async res=> {
        if(!res.ok)return null;
        const json=await res.json();
        return convertUser(json?.user);
      }).catch(()=>null);
  }
  return cachedIdentity;
}
async function bearer():Promise<string|null>{
  if(!tokenPromise){
    tokenPromise=fetch("/api/neon-auth/token",{credentials:"same-origin",cache:"no-store"})
      .then(async res=>{
        if(!res.ok)return null;
        const data=await res.json();
        const token=data?.token??data?.data?.token;
        return typeof token==="string"&&token.split(".").length===3?token:null;
      }).catch(()=>null).finally(()=>{tokenPromise=null});
  }
  return tokenPromise;
}
function authChange(){
  cachedIdentity=null;
  if(typeof window!=="undefined")window.dispatchEvent(new Event("braver-neon-auth-change"));
}
const auth = {
  async getUser(){return {data:{user:await currentUser(true)},error:null};},
  async getSession(){
    const user=await currentUser(true);
    return {data:{session:user?{user,access_token:await bearer()}:null},error:null};
  },
  async signOut(){
    const res=await fetch("/api/neon-auth/sign-out",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:"{}"});
    if(!res.ok)return {error:new Error("Could not sign out.")};
    authChange();return {error:null};
  },
  onAuthStateChange(listener:(event:string,session:{user:User}|null)=>void){
    let active=true;
    const onChange=()=>{void currentUser(true).then(user=>{
      if(active)listener(user?"SIGNED_IN":"SIGNED_OUT",user?{user}:null);
    });};
    window.addEventListener("braver-neon-auth-change",onChange);
    window.addEventListener("focus",onChange);
    return {data:{subscription:{unsubscribe(){
      active=false;window.removeEventListener("braver-neon-auth-change",onChange);
      window.removeEventListener("focus",onChange);
    }}}};
  },
  async signInWithOtp(){return {data:null,error:new Error("Use Neon Auth email verification.")};},
  async verifyOtp(){return {data:{user:null,session:null},error:new Error("Use Neon Auth email verification.")};},
  async updateUser(){return {data:{user:null},error:new Error("Use Neon Auth account settings.")};},
  async resetPasswordForEmail(email:string){
    const res=await fetch("/api/neon-auth/request-password-reset",{
      method:"POST",credentials:"same-origin",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({email,redirectTo:window.location.origin+"/auth?mode=signin&recovery=1"}),
    });
    return {data:null,error:res.ok?null:new Error("Password reset could not be requested.")};
  },
};
let client: {from:(table:string)=>ReturnType<PostgrestClient["from"]>;auth:typeof auth}|undefined;
export function getNeonBrowserClient(){
  if(typeof window==="undefined")throw Error("Neon browser data client is browser-only");
  if(!client){
    const db=new PostgrestClient(dataApiUrl(),{
      fetch:async(input,init)=>{
        const token=await bearer();
        if(!token)throw new Error("Please sign in again.");
        const headers=new Headers(init?.headers);
        headers.set("Authorization","Bearer "+token);
        return fetch(input,{...init,headers,redirect:"error"});
      },
    });
    client={from:table=>db.from(table),auth};
  }
  return client;
}
