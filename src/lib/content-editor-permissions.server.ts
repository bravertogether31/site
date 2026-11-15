import { loadAccountAccessState } from "@/lib/account-access.functions";

export async function isContentEditor(userId: string): Promise<boolean> {
  const access = await loadAccountAccessState(userId);
  if (access.role === "administrator") return true;
  if (access.role !== "member") return false;

  if (process.env.BRAVER_AUTH_PROVIDER === "neon") {
    const { getNeonServerDatabasePool } = await import("@/integrations/neon/legacy-login.server");
    const result = await getNeonServerDatabasePool().query<{allowed:boolean}>(
      "SELECT EXISTS (SELECT 1 FROM public.site_content_editors WHERE user_id=$1::uuid) AS allowed",
      [userId]
    );
    return result.rows[0]?.allowed === true;
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const {data,error} = await supabaseAdmin.from("site_content_editors")
    .select("user_id").eq("user_id",userId).maybeSingle();
  if (error) throw new Error("Content editor permissions are unavailable.");
  return Boolean(data);
}

export async function requireContentEditor(userId: string): Promise<void> {
  if (!(await isContentEditor(userId))) {
    throw new Error("Website editor permissions are required.");
  }
}
