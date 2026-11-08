-- BraverTogether: one-time/idempotent identity-only backfill after Supabase -> Neon recovery.
-- Deliberately inserts NO credential/password; existing password login continues
-- through prepareLegacyNeonSignIn, while verified accounts become discoverable
-- for Neon Auth password-reset requests.
-- Do not execute against an unverified/reconciled source database.
INSERT INTO neon_auth."user" (
  id, name, email, "emailVerified", "createdAt", "updatedAt"
)
SELECT
  u.id,
  left(coalesce(
    nullif(btrim(p.display_name), ''),
    nullif(btrim(u.raw_user_meta_data->>'display_name'), ''),
    split_part(u.email, '@', 1)
  ), 255),
  lower(btrim(u.email)),
  true,
  u.created_at,
  now()
FROM auth.users AS u
LEFT JOIN public.profiles AS p ON p.id = u.id
WHERE u.email_confirmed_at IS NOT NULL
  AND coalesce((u.raw_user_meta_data->>'signup_completed')::boolean, true)
  AND u.deleted_at IS NULL
  AND (u.banned_until IS NULL OR u.banned_until <= now())
  AND NOT EXISTS (
    SELECT 1 FROM neon_auth."user" AS n
    WHERE n.id = u.id
       OR lower(n.email) = lower(btrim(u.email))
  )
ON CONFLICT DO NOTHING
RETURNING id;
