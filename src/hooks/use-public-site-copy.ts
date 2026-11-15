import { useEffect, useState } from "react";
import type { SiteCopyOverrides } from "@/lib/site-copy";

let cache: {at: number; data: SiteCopyOverrides} | undefined;
let pending: Promise<SiteCopyOverrides> | undefined;

export function invalidateSiteCopyCache() {
  cache=undefined;
  pending=undefined;
}

export function usePublicSiteCopy(): SiteCopyOverrides {
  const [copy,setCopy]=useState<SiteCopyOverrides>(()=>cache?.data ?? {});
  useEffect(()=>{
    let active=true;
    const now=Date.now();
    if(cache && now-cache.at<60_000){
      setCopy(cache.data);
      return ()=>{ active=false };
    }
    if(!pending) {
      pending=fetch("/api/site-copy",{credentials:"same-origin"})
        .then(async r=>{
          if(!r.ok)return {} as SiteCopyOverrides;
          const json:unknown=await r.json();
          if(!json || typeof json!=="object" || !("copy" in json))return {};
          const result=(json as {copy:unknown}).copy;
          return result && typeof result==="object" ? result as SiteCopyOverrides : {};
        })
        .catch(()=>cache?.data??{})
        .then(copy=>{cache={at:Date.now(),data:copy};return copy})
        .finally(()=>{pending=undefined});
    }
    void pending.then(data=>{if(active)setCopy(data)});
    return ()=>{active=false};
  },[]);
  return copy;
}
