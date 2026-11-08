-- BraverTogether Neon recovery: translate original Supabase privileged writer rules
-- to Neon PostgreSQL owner used EXCLUSIVELY by the server-only admin adapter.
-- Ordinary Data API clients execute as authenticated/anonymous, not neondb_owner.
-- Run after the original Supabase functions/triggers are restored.
BEGIN;

CREATE OR REPLACE FUNCTION public.guard_advisor_flag()
RETURNS trigger LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  request_role text := COALESCE(current_setting('request.jwt.claims', true)::jsonb->>'role', '');
BEGIN
  IF request_role <> 'service_role'
     AND current_user NOT IN ('service_role','postgres','supabase_admin','neondb_owner') THEN
    NEW.is_advisor := OLD.is_advisor;
  END IF;

  IF NEW.is_advisor = false THEN
    NEW.is_public := false;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.guard_conversation_update()
RETURNS trigger LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  jwt_role text := COALESCE(current_setting('request.jwt.claims', true)::jsonb->>'role', '');
BEGIN
  IF jwt_role <> 'service_role'
     AND current_user <> 'neondb_owner'
     AND pg_trigger_depth() = 1 THEN
    IF NEW.teen_id IS DISTINCT FROM OLD.teen_id
       OR NEW.advisor_id IS DISTINCT FROM OLD.advisor_id
       OR NEW.created_at IS DISTINCT FROM OLD.created_at
       OR NEW.last_message_at IS DISTINCT FROM OLD.last_message_at THEN
      RAISE EXCEPTION 'Conversation participants and timestamps cannot be changed';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

COMMIT;
