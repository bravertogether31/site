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
