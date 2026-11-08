-- Restore the original BraverTogether three-step signup semantics on Neon.
-- New signups remain incomplete until the verified member chooses a password.
-- Existing users and their password hashes are not changed.
CREATE OR REPLACE FUNCTION private.sync_new_neon_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $trigger$
BEGIN
 IF TG_OP = 'INSERT' THEN
  INSERT INTO auth.users(
    id,email,encrypted_password,email_confirmed_at,raw_user_meta_data,created_at
  )
  VALUES (
    NEW.id,lower(NEW.email),NULL,
    CASE WHEN NEW."emailVerified" THEN now() ELSE NULL END,
    jsonb_build_object(
      'display_name',left(coalesce(nullif(btrim(NEW.name),''),split_part(NEW.email,'@',1)),255),
      'full_name',left(coalesce(nullif(btrim(NEW.name),''),split_part(NEW.email,'@',1)),255),
      'signup_completed',false
    ),
    NEW."createdAt"
  )
  ON CONFLICT(id) DO NOTHING;
 ELSIF TG_OP='UPDATE'
    AND NEW."emailVerified" IS TRUE
    AND OLD."emailVerified" IS DISTINCT FROM TRUE THEN
  UPDATE auth.users
  SET email_confirmed_at=coalesce(email_confirmed_at,now())
  WHERE id=NEW.id;
 END IF;
 RETURN NEW;
END
$trigger$;
