import { createFileRoute } from "@tanstack/react-router";
import { SITE_COPY_ALLOWED, type SiteCopyOverrides } from "@/lib/site-copy";

const HEADERS = {
  "X-Content-Type-Options":"nosniff",
  "Cache-Control":"no-store",
};
async function connection(){
  const { getNeonServerDatabasePool } = await import("@/integrations/neon/legacy-login.server");
  return getNeonServerDatabasePool();
}
async function getCopy():Promise<SiteCopyOverrides> {
  let values:Array<{key:string,value:string}> = [];
  if(process.env.BRAVER_AUTH_PROVIDER === "neon"){
    const result=await(await connection()).query<{key:string,value:string}>(
      "SELECT key,value FROM public.site_copy ORDER BY key LIMIT 20"
    );
    values=result.rows;
  }else{
    const {supabaseAdmin}=await import("@/integrations/supabase/client.server");
    const {data,error}=await supabaseAdmin.from("site_copy").select("key,value").limit(20);
    if(error) throw new Error("The content could not be loaded.");
    values=data||[];
  }
  const copy:Record<string,string>={};
  for(const item of values) if(SITE_COPY_ALLOWED.has(item.key))copy[item.key]=item.value;
  return copy as SiteCopyOverrides;
}

export const Route = createFileRoute("/api/site-copy")({
  server:{handlers:{
    GET:async()=>{
      try{
        const copy=await getCopy();
        return Response.json({copy},{headers:{...HEADERS,"Cache-Control":"public,max-age=30,s-maxage=60"}});
      }catch{
        // Public routes always keep their verified static text if a data source fails.
        return Response.json({copy:{}},{headers:HEADERS});
      }
    },
    POST:async({request})=>{
      const expectedOrigin=process.env.BRAVER_SITE_ORIGIN;
      if(!expectedOrigin || request.headers.get("sec-fetch-site")==="cross-site" ||
        request.headers.get("origin")!==new URL(expectedOrigin).origin ||
        request.headers.get("content-type")?.split(";")[0]!=="application/json" ||
        Number(request.headers.get("content-length")||0)>5000){
        return Response.json({error:"Invalid request"},{status:403,headers:HEADERS});
      }
      let userId: string;
      try{
        if(process.env.BRAVER_AUTH_PROVIDER!=="neon"){
          return Response.json({error:"Site editing is currently unavailable."},{status:503,headers:HEADERS});
        }
        const {requireNeonAccountSession}=await import("@/integrations/neon/auth.server");
        userId=(await requireNeonAccountSession()).id;
      }catch{
        return Response.json({error:"Please sign in to edit website content."},{status:401,headers:HEADERS});
      }
      try{
        const {requireContentEditor}=await import("@/lib/content-editor-permissions.server");
        await requireContentEditor(userId);
      }catch{
        return Response.json({error:"Editor access is required."},{status:403,headers:HEADERS});
      }
      let payload:unknown;
      try{ payload=await request.json(); }catch{return Response.json({error:"Invalid JSON"},{status:400,headers:HEADERS});}
      if(!payload || typeof payload!=="object")return Response.json({error:"Invalid content"},{status:400,headers:HEADERS});
      const {key,value}=payload as Record<string,unknown>;
      if(typeof key!=="string" || !SITE_COPY_ALLOWED.has(key) ||
        typeof value!=="string" || value.trim().length===0 || value.length>2000){
        return Response.json({error:"Choose an allowed field and enter 1–2000 characters of plain text."},{status:400,headers:HEADERS});
      }
      try{
        await (await connection()).query(
          `INSERT INTO public.site_copy(key,value,edited_by,updated_at)
           VALUES ($1,$2,$3::uuid,now())
           ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,
           edited_by=EXCLUDED.edited_by,updated_at=now()`,
          [key,value.trim(),userId]
        );
        return Response.json({ok:true},{headers:HEADERS});
      }catch(error){
        console.error("[Site copy] Save failed",error instanceof Error?error.name:"unknown");
        return Response.json({error:"The content could not be saved."},{status:503,headers:HEADERS});
      }
    },
  }},
});
