import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireContentEditor } from "@/lib/content-editor-permissions.server";

export type CurriculumDocument = {
  id: string;
  title: string;
  country: string;
  description: string;
  kind: "curriculum" | "cheat_sheet";
  original_filename: string;
  file_size_bytes: number;
  published?: boolean;
  created_at: string;
};

const UPDATE = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(3).max(180),
  country: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1200),
  published: z.boolean(),
}).strict();

async function pool() {
  const { getNeonServerDatabasePool } = await import("@/integrations/neon/legacy-login.server");
  return getNeonServerDatabasePool();
}

/** Public list returns only published metadata; storage keys are never exposed. */
export const listPublicCurriculums = createServerFn({ method: "GET" })
  .handler(async (): Promise<CurriculumDocument[]> => {
    if (process.env.BRAVER_AUTH_PROVIDER === "neon") {
      const result = await (await pool()).query<CurriculumDocument>(
        `SELECT id,title,country,description,kind,original_filename,file_size_bytes,created_at
         FROM public.curriculum_documents
         WHERE published=true ORDER BY country,kind,title LIMIT 500`
      );
      return result.rows;
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("curriculum_documents")
      .select("id,title,country,description,kind,original_filename,file_size_bytes,created_at")
      .eq("published", true)
      .order("country")
      .limit(500);
    if (error) throw new Error("Curriculum documents could not be loaded.");
    return (data ?? []) as CurriculumDocument[];
  });

/** Editing always requires both an authenticated session and the current admin role. */
export const listAdminCurriculums = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CurriculumDocument[]> => {
    await requireContentEditor(context.userId);
    if (process.env.BRAVER_AUTH_PROVIDER === "neon") {
      const result = await (await pool()).query<CurriculumDocument>(
        `SELECT id,title,country,description,kind,original_filename,file_size_bytes,published,created_at
         FROM public.curriculum_documents ORDER BY created_at DESC LIMIT 500`
      );
      return result.rows;
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("curriculum_documents")
      .select("id,title,country,description,kind,original_filename,file_size_bytes,published,created_at")
      .order("created_at", { ascending: false }).limit(500);
    if (error) throw new Error("Curriculum documents could not be loaded.");
    return (data ?? []) as CurriculumDocument[];
  });

export const updateCurriculumDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((value: unknown) => UPDATE.parse(value))
  .handler(async ({ context, data }) => {
    await requireContentEditor(context.userId);
    if (process.env.BRAVER_AUTH_PROVIDER === "neon") {
      const result = await (await pool()).query(
        `UPDATE public.curriculum_documents SET title=$2,country=$3,description=$4,
         published=$5,updated_at=now() WHERE id=$1::uuid RETURNING id`,
        [data.id,data.title,data.country,data.description,data.published]
      );
      if (result.rowCount !== 1) throw new Error("Curriculum document not found.");
      return { ok: true as const };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: updated, error } = await supabaseAdmin.from("curriculum_documents")
      .update({title:data.title,country:data.country,description:data.description,published:data.published,updated_at:new Date().toISOString()})
      .eq("id",data.id).select("id").single();
    if (error || !updated) throw new Error("Curriculum document could not be saved.");
    return { ok: true as const };
  });
