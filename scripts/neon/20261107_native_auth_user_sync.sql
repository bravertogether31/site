-- Braver Together: bridge new Neon Auth users into the preserved identity schema.
-- Apply ONLY after restoring all original constraints, functions, and RLS on an isolated branch.
-- No source user/password/session data is embedded in this migration.
BEGIN;
CREATE OR REPLACE FUNCTION private.sync_new_neon_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path=public,pg_catalog
AS $sync$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO auth.users(id,email,encrypted_password,email_confirmed_at,raw_user_meta_data,created_at)
    VALUES (
      NEW.id,
      lower(NEW.email),
      NULL,
      CASE WHEN NEW."emailVerified" THEN now() ELSE NULL END,
      jsonb_build_object(
        'display_name',
        left(coalesce(nullif(btrim(NEW.name),''),split_part(NEW.email,'@',1)),255),
        'signup_completed',true
      ),
      NEW."createdAt"
    )
    ON CONFLICT(id) DO NOTHING;
  ELSIF TG_OP='UPDATE' AND NEW."emailVerified" IS TRUE
        AND OLD."emailVerified" IS DISTINCT FROM TRUE THEN
    UPDATE auth.users
    SET email_confirmed_at=coalesce(email_confirmed_at,now())
    WHERE id=NEW.id;
  END IF;
  RETURN NEW;
END
$sync$;
REVOKE ALL ON FUNCTION private.sync_new_neon_auth_user() FROM PUBLIC,anon,anonymous,authenticated;
DROP TRIGGER IF EXISTS sync_new_neon_auth_user ON neon_auth."user";
CREATE TRIGGER sync_new_neon_auth_user
AFTER INSERT OR UPDATE OF "emailVerified" ON neon_auth."user"
FOR EACH ROW EXECUTE FUNCTION private.sync_new_neon_auth_user();
COMMIT;
