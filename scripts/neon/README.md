# Braver Together — Supabase to Neon recovery checkpoint

This directory contains a schema-only recovery generator and replay SQL for the November 1, 2026 Supabase snapshot. No password hashes, account data, documents, messages, refresh tokens or credentials are committed.

Source Supabase: wzkyomerlwcdyyoqfkzn.
Neon recovery: autumn-sea-53276711.
Source snapshot: 54 datasets, 377 rows.
Production app: bravertogether.site / Render site-7xxq.onrender.com.
No production switch authorized until test gates pass.

## Regenerate the schema-only SQL

On the authorized Mac with the protected backup directory, run:

    python3 scripts/neon/build_recovery_sql.py --backup-dir "$HOME/Desktop/.dp-emergency-backups-20261101/bravertogether" --output scripts/neon/20261107_restore.sql

The generator refuses unexpected catalogs, produces SQL only, and does not connect to any database. The script checks row counts for all 54 tables before making changes; it runs atomically.

## Verified staging

A full rebuild from the incomplete snapshot succeeded on fresh isolated Neon branch br-icy-recipe-azuqocox.
Readback: 214 constraints, 61 public indexes, 26 RLS policies, 19/19 public RLS-enabled tables, 19 helper functions, 14 public triggers and one new-user trigger. The 12 users, 12 profiles and 24 messages remained intact.
An earlier isolated branch br-fancy-hat-az2zjz0z also passed an idempotent replay.
These changes have NOT been promoted to Neon main.

## Current blockers, do not bypass

1. Source SQL read access timed out. Current-source freshness since November 1 remains unverified.
2. A private essay-submissions PDF binary is still missing. Storage metadata alone is not the file.
3. Braver Together uses Supabase Auth, PostgREST, Storage, Realtime and RPCs; Neon PostgreSQL is not a drop-in replacement.
4. Managed Neon Auth cannot be presumed to preserve the original 12 bcrypt credentials, user IDs and existing sessions.
5. JWT verification, RLS isolation, signup, password login/OTP/reset, uploaded files, private messages, realtime, admin/advisor/teen controls and live production workflows must pass staging acceptance.
6. Render automatically deploys main. Keep migration work isolated in a feature branch until safe promotion and rollback are ready.

VERDICT: DATA_AND_SCHEMA_RECOVERY_REHEARSAL_PASSED. PRODUCTION_NEON_CUTOVER_BLOCKED.

## Validated public-data adapter (07 November 2026)

The read-only BRAVER_PUBLIC_DATA_PROVIDER=neon mode now serves public Resources, Competitions and directory-only Advisors from Neon Auth anonymous JWT + RLS-controlled Neon Data API. It is not a full application provider switch.

- Staging and main tested: anonymous token valid; categories, competitions, advisors selectable; messages and user_roles explicitly denied, essay submissions invisible. Both smoke runs passed.
- Local staging Node SSR: 12 tested paths returned HTTP 200 using Neon public data. Linked advisor identities cannot be verified via public API and deliberately fail closed if encountered.
- Run explicit integration smoke: npm run test:neon-public with both NEON_AUTH_BASE_URL and NEON_DATA_API_URL set to the SAME isolated Neon branch.
- Do not promote to production until member Auth/Storage/realtime and all document files are verified; source freshness and missing original PDF remain unresolved.
- Neon main 2026-11-07 schema restored with backups; no Render production config modified.

## 2026-11-07 authenticated cutover staging proof

New authenticated functionality on the **isolated test branch only**:

- Legacy bcrypt verification and one-time conversion to native Neon Auth scrypt, retaining the original UUID.
- First-party `/api/neon-auth/*` session-cookie proxy and `/api/neon-legacy-login` fallback. Both are disabled by default and reject cross-site mutation requests.
- Cookie/session verification uses Neon Auth; signed Data API tokens use the managed `/token` exchange, EdDSA JWKS verification, exact issuer/audience/expiry, and matching first-party session.
- Direct database role lookup and guarded `/api/neon-account` endpoint. The original Supabase Auth and middleware remain the default.
- Server-side identity throttling (6 attempts per 10 minutes) in private schema. The schema migration `20261107_login_throttle.sql` is applied to the isolated test branch only.
- Read-only public Neon Data API adapter for Resources, Competitions, and the unlinked public advisor directory.

The synthetic staging test with `BRAVER_STAGING_ORIGIN=http://localhost:3912` passed: incorrect bcrypt rejection, six-attempt throttle, native conversion, real Neon Auth sign-in, first-party cookie session, authenticated RLS isolation, correct member role, forged/missing-cookie JWT denial, and cleanup. Do not run this test against production; it hard-checks a known isolated Neon hostname and demands exactly 12 baseline users.

**Flag combinations:** `VITE_BRAVER_AUTH_PROVIDER` is BUILD-time, `BRAVER_AUTH_PROVIDER` is RUNTIME. Both must match. `NEON_AUTH_PROXY_ENABLED` and `NEON_LEGACY_LOGIN_ENABLED` must stay `0` on production until all protected features are fully migrated. `BRAVER_ALLOW_LOCALHOST_TESTS` must never be enabled on a public deployment.

**Unfinished release gates:** current Supabase data freshness; missing private essay PDF binary; signup/OTP/reset; original profile/message/meeting/competition services still use Supabase Admin/Storage/Realtime; advisor/teen/admin end-to-end permissions and all pages in an externally reachable staging deployment; final data sync, rollback and live cutover. This checkpoint is **NOT SAFE TO MERGE TO MAIN**.
