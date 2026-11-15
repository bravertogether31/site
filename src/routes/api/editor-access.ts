import { createFileRoute } from "@tanstack/react-router";
const HEADERS={"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};
export const Route=createFileRoute("/api/editor-access")({
 server:{handlers:{GET:async()=>{
  if(process.env.BRAVER_AUTH_PROVIDER!=="neon")return Response.json({allowed:false},{status:503,headers:HEADERS});
  try{
    const {requireNeonAccountSession}=await import("@/integrations/neon/auth.server");
    const {isContentEditor}=await import("@/lib/content-editor-permissions.server");
    const {id}=await requireNeonAccountSession();
    if(!(await isContentEditor(id)))return Response.json({allowed:false},{status:403,headers:HEADERS});
    return Response.json({allowed:true},{headers:HEADERS});
  }catch{return Response.json({allowed:false},{status:401,headers:HEADERS})}
 }}}});
