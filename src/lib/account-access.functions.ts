import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  resolveAccountAccess,
  type AccountAccessState,
  type AdvisorApplicationStatus,
  type EffectiveAccountRole,
} from "@/lib/account-access";

export const loadAccountAccessState = createServerOnlyFn(
  async (userId: string): Promise<AccountAccessState> => {
    if (process.env.BRAVER_AUTH_PROVIDER === "neon") {
      const { getNeonServerDatabasePool } = await import("@/integrations/neon/legacy-login.server");
      const rows = await getNeonServerDatabasePool().query<{
        is_advisor: boolean;
        roles: string[];
        application_status: string | null;
        has_intent: boolean;
      }>(
        `SELECT p.is_advisor,
          COALESCE((SELECT array_agg(r.role::text) FROM public.user_roles r WHERE r.user_id=p.id),ARRAY[]::text[]) AS roles,
          (SELECT a.status::text FROM public.advisor_applications a WHERE a.user_id=p.id LIMIT 1) AS application_status,
          EXISTS(SELECT 1 FROM public.advisor_onboarding_intents i WHERE i.user_id=p.id) AS has_intent
         FROM public.profiles p WHERE p.id=$1::uuid`, [userId]);
      const state = rows.rows[0];
      const roles = new Set(state?.roles || []);
      const applicationStatus = (state?.application_status as AdvisorApplicationStatus | undefined) ?? null;
      return resolveAccountAccess({
        hasMemberRole: roles.has("teen"),
        hasAdvisorRole: roles.has("advisor"),
        hasAdminRole: roles.has("admin"),
        profileIsAdvisor: state?.is_advisor === true,
        applicationStatus,
        isApplicant: Boolean(state?.has_intent || applicationStatus),
      });
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [profileResult, rolesResult, applicationResult, intentResult] =
      await Promise.all([
        supabaseAdmin
          .from("profiles")
          .select("is_advisor")
          .eq("id", userId)
          .maybeSingle(),
        supabaseAdmin.from("user_roles").select("role").eq("user_id", userId),
        supabaseAdmin
          .from("advisor_applications")
          .select("status")
          .eq("user_id", userId)
          .maybeSingle(),
        supabaseAdmin
          .from("advisor_onboarding_intents")
          .select("user_id")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

    const firstError = [
      profileResult.error,
      rolesResult.error,
      applicationResult.error,
      intentResult.error,
    ].find(Boolean);
    if (firstError) throw new Error(firstError.message);

    const roles = new Set((rolesResult.data ?? []).map((row) => row.role));
    const applicationStatus =
      (applicationResult.data?.status as AdvisorApplicationStatus | undefined) ??
      null;

    return resolveAccountAccess({
      hasMemberRole: roles.has("teen"),
      hasAdvisorRole: roles.has("advisor"),
      hasAdminRole: roles.has("admin"),
      profileIsAdvisor: profileResult.data?.is_advisor === true,
      applicationStatus,
      isApplicant: Boolean(intentResult.data || applicationResult.data),
    });
  },
);

export const requireAccountRole = createServerOnlyFn(
  async (
    userId: string,
    allowed: EffectiveAccountRole[],
  ): Promise<AccountAccessState> => {
    const access = await loadAccountAccessState(userId);
    if (!allowed.includes(access.role)) {
      if (access.hasRoleConflict) {
        throw new Error(
          "This account has conflicting access records. Contact an administrator before continuing.",
        );
      }
      const label = allowed
        .map((role) =>
          role === "administrator"
            ? "administrator"
            : role === "advisor"
              ? "approved advisor"
              : role,
        )
        .join(" or ");
      throw new Error(`This action requires a ${label} account.`);
    }
    return access;
  },
);

export const getAccountAccessState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => loadAccountAccessState(context.userId));

// Managed Neon Auth cookies are checked server-side before any account role is returned.
// The legacy Supabase route remains unchanged until the entire provider switch.
export const getNeonAccountAccessState = createServerFn({ method: "GET" })
  .handler(async () => {
    const { requireNeonAccountSession } = await import("@/integrations/neon/auth.server");
    const { id } = await requireNeonAccountSession();
    return loadAccountAccessState(id);
  });
