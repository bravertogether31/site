-- Braver Together — server-only rate control for legacy first-login migration.
-- Applied only after RLS restoration; never exposed via Neon Data API.
BEGIN;
CREATE SCHEMA IF NOT EXISTS private;
CREATE TABLE IF NOT EXISTS private.braver_login_throttle (
  identity_digest text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  attempts integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT braver_login_attempt_range CHECK (attempts BETWEEN 0 AND 1000000)
);
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, anonymous;
REVOKE ALL ON TABLE private.braver_login_throttle FROM PUBLIC, anon, anonymous, authenticated;
COMMIT;
