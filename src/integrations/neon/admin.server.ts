/**
 * Server-only Supabase Admin Data API compatibility adapter for Neon PostgreSQL.
 *
 * Reuses the vetted PostgREST-style query surface already used by BraverTogether's
 * server functions. All SQL values are bound parameters. Identifiers are checked
 * against strict identifier syntax and a table allowlist. NO client-side export.
 *
 * This is an OWNER connection and bypasses RLS. Every caller must continue
 * using the existing verifiedAuth + explicit account role/ownership guards.
 * Do not expose arbitrary SQL, table names or filters to browser requests.
 */
import { getNeonServerDatabasePool } from "./legacy-login.server";
import type { QueryResult } from "pg";
import {
  deletePrivateDocument,
  downloadPrivateDocument,
  presignPrivateDocumentRead,
  presignPrivateDocumentUpload,
} from "./storage.server";

const TABLES = new Set([
  "advisor_application_events", "advisor_applications",
  "advisor_onboarding_intents", "ai_usage_daily", "chapter_interest_submissions", "competitions",
  "conversation_reads", "conversations", "essay_submission_events", "essay_submissions",
  "meeting_proposals", "messages", "news_posts",
  "profiles", "public_advisors", "reports", "resource_categories",
  "resource_videos", "user_roles",
]);

function ident(input: string): string {
  if (!/^[a-z][a-z0-9_]*$/.test(input)) throw new Error("Unsupported database identifier");
  return '"' + input + '"';
}
function tableIdent(table: string) {
  if (!TABLES.has(table)) throw new Error("Unapproved server database table");
  return "public." + ident(table);
}
function fields(cols: string) {
  if (cols.trim() === "*") return "*";
  const parts = cols.split(",").map(x=>x.trim());
  if (parts.some(x=>!x)) throw new Error("Invalid projection");
  return parts.map(x=>ident(x)).join(",");
}
type Order = { column: string; ascending: boolean; nullsFirst?: boolean };
type Filter = { column: string; op: string; value: unknown };

export type NeonAdminResult = { data: unknown; error: { message: string; code?: string } | null; status: number; count?: number | null };
class QueryBuilder implements PromiseLike<NeonAdminResult> {
  private action: "select" | "insert" | "upsert" | "update" | "delete" = "select";
  private projected: string = "*";
  private filters: Filter[] = [];
  private orders: Order[] = [];
  private desiredLimit?: number;
  private desiredOffset?: number;
  private payload: Record<string,unknown>[] = [];
  private conflictKeys: string[] = [];
  private returnRows = false;
  private cardinality: "list" | "single" | "maybeSingle" = "list";
  private readonly table: string;
  constructor(table: string) { this.table=table; tableIdent(table); }

  select(columns = "*"): this {
    fields(columns);
    this.projected = columns;
    this.returnRows = true;
    return this;
  }
  insert(values: Record<string,unknown> | Record<string,unknown>[]): this {
    this.action = "insert";
    this.payload = Array.isArray(values) ? values : [values];
    return this;
  }
  upsert(values: Record<string,unknown> | Record<string,unknown>[], opts?: {onConflict?:string}): this {
    this.action = "upsert";
    this.payload = Array.isArray(values) ? values : [values];
    this.conflictKeys = (opts?.onConflict||"id").split(",").map(x=>x.trim());
    this.conflictKeys.forEach(ident);
    return this;
  }
  update(values: Record<string,unknown>): this {
    this.action = "update"; this.payload = [values]; return this;
  }
  delete(): this { this.action = "delete"; return this; }

  eq(column: string, value: unknown): this {
    this.filters.push({column,op:"eq",value});return this;
  }
  neq(column: string, value: unknown): this {
    this.filters.push({column,op:"neq",value});return this;
  }
  is(column: string, value: unknown): this {
    if (value !== null && typeof value !== "boolean") throw new Error("Unsupported IS operand");
    this.filters.push({column,op:"is",value});return this;
  }
  ilike(column: string, value: string): this {
    if(typeof value!=="string"||value.length>2000)throw new Error("Invalid ILIKE filter");
    this.filters.push({column,op:"ilike",value});return this;
  }
  in(column: string, values: unknown[]): this {
    if (!Array.isArray(values) || values.length>1000) throw new Error("Invalid IN filter");
    this.filters.push({column,op:"in",value:values});return this;
  }
  gt(column:string,value:unknown){this.filters.push({column,op:"gt",value});return this}
  gte(column:string,value:unknown){this.filters.push({column,op:"gte",value});return this}
  lt(column:string,value:unknown){this.filters.push({column,op:"lt",value});return this}
  lte(column:string,value:unknown){this.filters.push({column,op:"lte",value});return this}
  order(column:string,options?:{ascending?:boolean;nullsFirst?:boolean}):this{
    this.orders.push({column,ascending:options?.ascending!==false,nullsFirst:options?.nullsFirst});
    return this;
  }
  limit(n:number):this {
    if (!Number.isSafeInteger(n) || n<0 || n>10000) throw new Error("Invalid query limit");
    this.desiredLimit=n;return this;
  }
  range(start:number,end:number):this{
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||end<start||end-start>10000)throw new Error("Invalid range");
    this.desiredOffset=start;this.desiredLimit=end-start+1;return this;
  }
  single():this{this.cardinality="single";this.returnRows=true;return this}
  maybeSingle():this{this.cardinality="maybeSingle";this.returnRows=true;return this}

  private statement(): { text: string; values:unknown[] } {
    const tbl=tableIdent(this.table),values:unknown[]=[];
    const bind=(v:unknown):string=>{ values.push(v);return "$"+values.length; };
    const where=this.filters.map(f=>{
      const column=ident(f.column);
      if(f.op==="is"){return column+" IS "+(f.value===null?"NULL":f.value?"TRUE":"FALSE");}
      if(f.op==="in"){
        const list=f.value as unknown[];
        if(!list.length)return "FALSE";
        return column+" IN ("+list.map(bind).join(",")+")";
      }
      if(f.value===null)return column+(f.op==="neq"?" IS NOT NULL":" IS NULL");
      const operation=({eq:"=",neq:"<>",gt:">",gte:">=",lt:"<",lte:"<=",ilike:"ILIKE"} as Record<string,string>)[f.op];
      if(!operation)throw new Error("Invalid SQL operator");
      return column+" "+operation+" "+bind(f.value);
    }).join(" AND ");
    const whereSql=where?" WHERE "+where:"";
    const returning=this.returnRows?" RETURNING "+fields(this.projected):"";
    const orderSql=this.orders.length?" ORDER BY "+this.orders.map(o=>
      ident(o.column)+(o.ascending?" ASC":" DESC")+
      (o.nullsFirst===undefined?"":o.nullsFirst?" NULLS FIRST":" NULLS LAST")
    ).join(","):"";
    const limitSql=this.desiredLimit!==undefined?" LIMIT "+this.desiredLimit:"";
    const offsetSql=this.desiredOffset!==undefined?" OFFSET "+this.desiredOffset:"";
    if(this.action==="select"){
      return {text:"SELECT "+fields(this.projected)+" FROM "+tbl+whereSql+orderSql+limitSql+offsetSql,values};
    }
    if(this.action==="update"||this.action==="delete"){
      if(!where)throw new Error("Refusing unfiltered database modification");
      if(this.action==="delete")return {text:"DELETE FROM "+tbl+whereSql+returning,values};
      const patch=this.payload[0];
      const keys=Object.keys(patch);
      if(!keys.length)throw new Error("Empty database update");
      const set=keys.map(k=>ident(k)+"="+bind(patch[k])).join(",");
      return {text:"UPDATE "+tbl+" SET "+set+whereSql+returning,values};
    }
    if(!this.payload.length||this.payload.length>1000)throw new Error("Invalid insert payload");
    const keys=Object.keys(this.payload[0]);
    if(!keys.length)throw new Error("Empty insert object");
    for(const row of this.payload)if(Object.keys(row).sort().join(",")!==[...keys].sort().join(",")){
      throw new Error("Batch insert rows must have identical columns");
    }
    const insertValues=this.payload.map(row=>"("+keys.map(k=>bind(row[k])).join(",")+")").join(",");
    let text="INSERT INTO "+tbl+" ("+keys.map(ident).join(",")+") VALUES "+insertValues;
    if(this.action==="upsert"){
      const doUpdate=keys.filter(k=>!this.conflictKeys.includes(k));
      text+=" ON CONFLICT ("+this.conflictKeys.map(ident).join(",")+") "+(doUpdate.length?
        "DO UPDATE SET "+doUpdate.map(k=>ident(k)+"=EXCLUDED."+ident(k)).join(","):
        "DO NOTHING");
    }
    return {text:text+returning,values};
  }

  async execute():Promise<NeonAdminResult>{
    try{
      const statement=this.statement();
      const result:QueryResult=await getNeonServerDatabasePool().query(statement);
      let data:unknown=this.returnRows?result.rows:null;
      if(this.cardinality!=="list"){
        if(result.rows.length>1 || (this.cardinality==="single"&&result.rows.length!==1)){
          return {data:null,error:{message:"Incorrect result cardinality",code:"PGRST116"},status:406};
        }
        data=result.rows[0]??null;
      }
      return {data,error:null,status:200,count:result.rowCount};
    }catch(error){
      const e=error as {message?:string;code?:string};
      return {data:null,error:{message:e.message||"Database query failed",code:e.code},status:400};
    }
  }
  then<TResult1 = NeonAdminResult, TResult2 = never>(
    resolve?: ((value:NeonAdminResult)=>TResult1|PromiseLike<TResult1>) | null,
    reject?: ((reason:unknown)=>TResult2|PromiseLike<TResult2>) | null,
  ):Promise<TResult1|TResult2> { return this.execute().then(resolve,reject); }
}

const storage={
  from(bucket:string){
    if(bucket!=="essay-submissions"&&bucket!=="advisor-cvs"){
      throw new Error("Unapproved storage bucket");
    }
    return {
      async createSignedUploadUrl(key:string){
        try{
          // In Neon mode, the upload "token" is an actual 5-minute presigned PUT URL.
          // Client upload flows must use PUT instead of Supabase's uploadToSignedUrl.
          const contentType=key.endsWith(".pdf")?"application/pdf":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          const token=await presignPrivateDocumentUpload({bucket,key,mimeType:contentType});
          return {data:{token,path:key,signedUrl:token},error:null};
        }catch(e){return {data:null,error:{message:(e as Error).message}}}
      },
      async createSignedUrl(key:string,expiresIn:number,opts?:{download?:string}){
        try{
          if(expiresIn>300||expiresIn<1)throw new Error("Invalid private link lifetime");
          const signedUrl=await presignPrivateDocumentRead(bucket,key,opts?.download||"document");
          return {data:{signedUrl},error:null};
        }catch(e){return {data:null,error:{message:(e as Error).message}}}
      },
      async download(key:string){
        try{
          const bytes=await downloadPrivateDocument(bucket,key,bucket==="advisor-cvs"?5*1024*1024:10*1024*1024);
          return {data:new Blob([new Uint8Array(bytes)]),error:null};
        }catch(e){return {data:null,error:{message:(e as Error).message}}}
      },
      async remove(paths:string[]){
        try{
          if(paths.length>100)throw new Error("Excessive file removal request");
          for(const path of paths)await deletePrivateDocument(bucket,path);
          return {data:paths.map(name=>({name})),error:null};
        }catch(e){return {data:null,error:{message:(e as Error).message}}}
      },
    };
  }
};

const admin={
  from(table:string){ return new QueryBuilder(table); },
  async rpc(name:string,args:Record<string,unknown>){
    try{
      if(!["create_support_request","consume_ai_allowance"].includes(name))throw new Error("Unknown server RPC");
      const keys=Object.keys(args);
      if(keys.some(k=>!/^p_[a-z0-9_]+$/.test(k)))throw new Error("Invalid RPC argument name");
      const sql="SELECT public."+ident(name)+"("+keys.map((k,i)=>ident(k)+" => $"+(i+1)).join(",")+") AS result";
      const result=await getNeonServerDatabasePool().query(sql,Object.values(args));
      return {data:result.rows[0]?.result??null,error:null};
    }catch(error){return {data:null,error:{message:(error as Error).message}}}
  },
  storage,
  auth: {
    admin:{
      async listUsers({page=1,perPage=1000}:{page?:number;perPage?:number}){
        try{
          if(!Number.isSafeInteger(page)||page<1||perPage>1000||perPage<1)throw new Error("Invalid page");
          const r=await getNeonServerDatabasePool().query(
            'SELECT id,email,"emailVerified" AS verified FROM neon_auth."user" ORDER BY email LIMIT $1 OFFSET $2',
            [perPage,(page-1)*perPage]
          );
          return {data:{users:r.rows.map(x=>({...x,user_metadata:{signup_completed:true}}))},error:null};
        }catch(error){return {data:{users:[]},error:{message:(error as Error).message}}}
      }
    }
  }
};
export function getNeonAdminClient(){return admin;}
