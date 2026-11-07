#!/usr/bin/env python3
"""Generate a transactionally atomic, schema-only Neon recovery SQL file.

Reads the authenticated private Supabase backups stored on the owner's Mac.
NEVER exports user data, password hashes, refresh tokens or files.
Does not connect to or modify any database.
"""
import argparse, hashlib, json, re
from pathlib import Path

def load(path):
    return json.loads(path.read_text())

def ident(v):
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_ ]*",v):
        raise ValueError("Invalid identifier")
    return '"' + v + '"'

def lit(s):
    return "'" + s.replace("'", "''") + "'"

def command(s):
    return "EXECUTE " + lit(s.rstrip(";")+";") + ";"

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--backup-dir",type=Path,required=True)
    parser.add_argument("--output",type=Path,required=True)
    a=parser.parse_args()
    b=a.backup_dir
    c=b.parent/"audit-addenda-20261101"/"catalog-brave"
    data={}
    for name in ["brave-data-1.json","brave-data-2.json","brave-data-3.json"]:
        item=load(b/name)
        if item["project"]!="wzkyomerlwcdyyoqfkzn":
            raise ValueError("Wrong Supabase source project")
        for key,rows in item["tables"].items():
            if key in data:raise ValueError("Duplicate dataset")
            data[key]=rows
    if len(data)!=54 or sum(map(len,data.values()))!=377:
        raise ValueError("Unexpected source snapshot counts")
    columns=[x for x in load(b/"columns.json") if x["table_schema"]=="public"]
    indexes=[x for x in load(b/"indexes.json") if x["schemaname"]=="public"]
    constraints=load(b/"constraints.json")
    policies=load(b/"policies.json")
    catalog=load(c/"integrity.json")
    routines=sum([load(c/("routines-"+s+".json")) for s in ("auth","public","private")],[])
    triggers=[x for x in catalog["triggers"] if x["schema"]=="public" or (x["schema"]=="auth" and x["name"]=="on_auth_user_created")]
    expected=(211,61,214,26,19,15)
    if tuple(map(len,(columns,indexes,constraints,policies,routines,triggers)))!=expected:
        raise ValueError("Source catalog changed; abort")
    sql=["-- BRAVER TOGETHER: schema-only recovery, source snapshot 2026-11-01.",
         "-- Never run against a live database; private-file, Auth and E2E verification are separate gates.",
         "DO $recovery$","BEGIN",
         "PERFORM set_config('search_path','public,pg_catalog',true);"]
    # Ensure source data was restored without loss before DDL.
    for table,rows in sorted(data.items()):
        s,t=table.split(".")
        sql.append(f"IF (SELECT count(*) FROM {ident(s)}.{ident(t)}) <> {len(rows)} THEN RAISE EXCEPTION 'Target count mismatch: {table}'; END IF;")
    for role in ("anon","authenticated","service_role"):
        sql.append(f"IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname={lit(role)}) THEN {command('CREATE ROLE '+role+' NOLOGIN')} END IF;")
    sql.append(command("CREATE SCHEMA IF NOT EXISTS private"))
    for schema,name,values in (
        ("public","app_role",("admin","advisor","teen")),
        ("storage","buckettype",("STANDARD","ANALYTICS","VECTOR")),
    ):
        expr=f"CREATE TYPE {schema}.{name} AS ENUM ("+",".join(map(lit,values))+")"
        sql.append(f"IF NOT EXISTS(SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname={lit(schema)} AND t.typname={lit(name)}) THEN {command(expr)} END IF;")
    for table,col,typ in (
        ("public.user_roles","role","public.app_role"),
        ("storage.buckets","type","storage.buckettype"),
        ("storage.buckets_analytics","type","storage.buckettype"),
        ("storage.buckets_vectors","type","storage.buckettype")
    ):
        schema,table_name=table.split(".")
        type_name=typ.split(".")[1]
        sql.append(f"IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema={lit(schema)} AND table_name={lit(table_name)} AND column_name={lit(col)} AND udt_name<>{lit(type_name)}) THEN {command(f'ALTER TABLE {table} ALTER COLUMN {col} TYPE {typ} USING {col}::text::{typ}')} END IF;")
    # Restore PK and UNIQUE before FKs.
    for typ in ("PRIMARY KEY","UNIQUE","CHECK","FOREIGN KEY"):
        for x in constraints:
            if not x["definition"].startswith(typ):continue
            schema,table,name=x["schema"],x["table_name"],x["name"]
            stmt=f"ALTER TABLE {ident(schema)}.{ident(table)} ADD CONSTRAINT {ident(name)} {x['definition']}"
            sql.append(f"IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid={lit(schema+'.'+table)}::regclass AND conname={lit(name)}) THEN {command(stmt)} END IF;")
    for r in routines:
        if not r["definition"].startswith("CREATE OR REPLACE FUNCTION"):
            raise ValueError("Unexpected routine definition")
        sql.append(command(r["definition"]))
    for x in columns:
        table,col=ident(x["table_name"]),ident(x["column_name"])
        if x["is_nullable"]=="NO":
            sql.append(command(f"ALTER TABLE public.{table} ALTER COLUMN {col} SET NOT NULL"))
        if x["column_default"] is not None:
            sql.append(command(f"ALTER TABLE public.{table} ALTER COLUMN {col} SET DEFAULT {x['column_default']}"))
    for x in indexes:
        sql.append(f"IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname={lit(x['indexname'])}) THEN {command(x['indexdef'])} END IF;")
    for x in triggers:
        schema,table,name=x["schema"],x["table"],x["name"]
        sql.append(f"IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid={lit(schema+'.'+table)}::regclass AND tgname={lit(name)}) THEN {command(x['definition'])} END IF;")
    for table in sorted(n.split(".")[1] for n in data if n.startswith("public.")):
        sql.append(command(f"ALTER TABLE public.{ident(table)} ENABLE ROW LEVEL SECURITY"))
    sql.extend((command("REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC,anon,authenticated"),
                command("GRANT USAGE ON SCHEMA public,auth TO anon,authenticated"),
                command("GRANT USAGE ON SCHEMA private TO authenticated")))
    grants={"anon":{},"authenticated":{}}
    for x in policies:
        roles=x["roles"].strip("{}").split(",")
        if not set(roles)<=set(("public","anon","authenticated")):
            raise ValueError("Unexpected policy role")
        name='"'+x["policyname"].replace('"','""')+'"'
        statement=f"CREATE POLICY {name} ON {ident(x['schemaname'])}.{ident(x['tablename'])} AS {x['permissive']} FOR {x['cmd']} TO "+",".join("PUBLIC" if r=="public" else ident(r) for r in roles)
        if x["qual"] is not None:statement+=" USING ("+x["qual"]+")"
        if x["with_check"] is not None:statement+=" WITH CHECK ("+x["with_check"]+")"
        sql.append(f"IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname={lit(x['schemaname'])} AND tablename={lit(x['tablename'])} AND policyname={lit(x['policyname'])}) THEN {command(statement)} END IF;")
        for role in grants:
            if role in roles or "public" in roles:
                ops=("SELECT","INSERT","UPDATE","DELETE") if x["cmd"]=="ALL" else (x["cmd"],)
                grants[role].setdefault(x["tablename"],set()).update(ops)
    for role,m in grants.items():
        for table,ops in sorted(m.items()):
            sql.append(command(f"GRANT {','.join(sorted(ops))} ON public.{ident(table)} TO {role}"))
    sql.append(command("REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA auth,private,public FROM PUBLIC"))
    for fn,roles in (
        ("auth.uid()","anon,authenticated"),
        ("auth.jwt()","anon,authenticated"),
        ("auth.role()","authenticated"),
        ("auth.email()","authenticated"),
        ("private.has_role(uuid,public.app_role)","authenticated"),
        ("private.current_account_role()","authenticated"),
        ("private.is_message_advisor(uuid)","authenticated"),
    ):
        sql.append(command(f"GRANT EXECUTE ON FUNCTION {fn} TO {roles}"))
    sql.append("END $recovery$;")
    output="\n".join(line.rstrip() for line in "\n".join(sql).splitlines())+"\n"
    a.output.parent.mkdir(parents=True,exist_ok=True)
    a.output.write_text(output)
    print("Generated schema-only SQL",a.output,"bytes",len(output),"sha256",hashlib.sha256(output.encode()).hexdigest())

if __name__=="__main__":main()
