import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, PencilLine } from "lucide-react";
import { toast } from "sonner";

import { SiteLayout, Section, Eyebrow } from "@/components/SiteLayout";
import { SITE_COPY_FIELDS, type SiteCopyOverrides, type SiteCopyKey } from "@/lib/site-copy";

export const Route = createFileRoute("/_authenticated/site-editor")({
  head: () => ({ meta: [
    {title:"Website Editor — BraverTogether"},
    {name:"robots",content:"noindex,nofollow"},
  ] }),
  component: SiteEditor,
});

function SiteEditor(){
  const [copy,setCopy]=useState<SiteCopyOverrides>({});
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState<SiteCopyKey|null>(null);
  const [authorized,setAuthorized]=useState<boolean|null>(null);

  useEffect(()=>{
    let active=true;
    async function load(){
      try{
        const permission=await fetch("/api/editor-access",{credentials:"same-origin",cache:"no-store"});
        if(!active)return;
        if(!permission.ok){setAuthorized(false);return}
        setAuthorized(true);
        const response=await fetch("/api/site-copy",{credentials:"same-origin",cache:"no-store"});
        if(!response.ok)throw new Error("The content could not be loaded.");
        const data:unknown=await response.json();
        if(!active)return;
        if(!data||typeof data!=="object"||!("copy" in data))return;
        setCopy((data as {copy:SiteCopyOverrides}).copy??{});
      }catch{
        if(active)toast.error("The website content could not be loaded.");
      }finally{if(active)setLoading(false)}
    }
    void load();
    return()=>{active=false};
  },[]);

  async function save(key:SiteCopyKey){
    const field=SITE_COPY_FIELDS.find(f=>f.key===key);
    if(!field)return;
    setSaving(key);
    try{
      const response=await fetch("/api/site-copy",{
        method:"POST",credentials:"same-origin",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({key,value:copy[key]??field.fallback}),
      });
      const body=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(body.error||"Could not save this text.");
      toast.success("Saved. Public pages can take up to a minute to refresh.");
    }catch(error){
      toast.error(error instanceof Error?error.message:"Could not save the text.");
    }finally{setSaving(null)}
  }

  return (
    <SiteLayout>
      <div className="bg-hero">
        <Section className="py-16">
          <Eyebrow>Website content</Eyebrow>
          <h1 className="mt-4 text-4xl font-bold">Website Editor</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
            Change selected homepage, founder and curriculum descriptions without editing code.
            Text is displayed as plain text, not HTML, to protect the website.
          </p>
          <div className="mt-5 flex flex-wrap gap-5 text-sm font-semibold text-teal">
            <Link to="/">View Homepage</Link>
            <Link to="/about">View About</Link>
            <Link to="/curriculums" search={{tab:undefined}}>View Curriculums</Link>
            <Link to="/admin-curriculums">Manage PDFs</Link>
          </div>
        </Section>
      </div>
      <Section className="max-w-5xl">
        {loading?<p role="status">Checking editor access…</p>:authorized===false?
          <p role="alert" className="rounded-xl border border-border p-6">This account does not have website editing access. Sign in with the designated BraverTogether editor or administrator account.</p>:
          <div className="space-y-10">
            {["Homepage","About","Curriculums"].map(section=>(
              <section key={section}>
                <h2 className="text-2xl font-bold">{section}</h2>
                <div className="mt-5 grid gap-4">
                  {SITE_COPY_FIELDS.filter(f=>f.section===section).map(field=>(
                    <div key={field.key} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                      <label htmlFor={field.key} className="block text-sm font-semibold">{field.label}</label>
                      <textarea
                        id={field.key}
                        value={copy[field.key]??field.fallback}
                        onChange={e=>setCopy(current=>({...current,[field.key]:e.target.value}))}
                        maxLength={2000}
                        rows={Math.min(7,Math.max(3,Math.ceil((copy[field.key]??field.fallback).length/110)))}
                        className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-teal/30"
                      />
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-xs text-muted-foreground">{(copy[field.key]??field.fallback).length}/2000 characters</span>
                        <button
                          type="button"
                          onClick={()=>void save(field.key)}
                          disabled={Boolean(saving)}
                          className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                          {saving===field.key?<PencilLine className="h-4 w-4 animate-pulse"/>:<Save className="h-4 w-4"/>}
                          {saving===field.key?"Saving…":"Save this field"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>}
      </Section>
    </SiteLayout>
  );
}
