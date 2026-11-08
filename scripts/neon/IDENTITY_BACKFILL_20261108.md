# BraverTogether Neon identity-only recovery backfill (8 Nov 2026)

## Why

The emergency migration preserved the twelve original `auth.users` identities but
did not populate their rows in `neon_auth."user"` until first successful legacy-password login.
Managed Neon Auth password reset searches the native directory and therefore cannot
send a reset email to a recovered user who has not logged in and forgotten their
legacy password.

The fix is to provision *identity records only* for already-confirmed and eligible
legacy users. Do **not** copy/rewrite passwords or pre-create native credential
rows. The first-login legacy bcrypt -> native credential migration remains valid;
a successful managed password reset may create a credential for a user who lacks one.

## Executed migration and verification

The accompanying SQL was applied manually and successfully to the isolated
recovery-validation branch and then to the production-candidate Neon branch:
- Neon project: `autumn-sea-53276711`
- staging: `br-twilight-recipe-azi9p8zg`
- production: `br-weathered-butterfly-az9e6cri`
- inserted 12 identities in each environment; repeat on production returned 0 rows
- production native user identities: 12, matching 12 confirmed legacy identities
- 0 ID/email mismatches; 0 existing native password-credential records
- 24 historical messages and 1 historical essay-submission record preserved
- no application/frontend files changed; Render continued serving `0a75475`
- no email or account password was changed
- all inserted rows are user identities, not session/credential records

This is **not** proof that the password-reset email callback and new-password
submission have completed end-to-end. Retest those independently with an
authorized synthetic account before certifying the reset workflow.

## Open data/release exceptions

1. The historic essay-submission *record* is present, but its original binary
   PDF could not be found in the Neon private bucket or previously searched
   backup sources; preserve the record and do not fabricate a file.
2. Original Supabase project is healthy by status but direct SQL/list_tables
   calls time out. November 1 backup parity does not demonstrate that later
   Supabase changes were reconciled. Keep Supabase unchanged for recovery.
3. Production Neon Auth is using a shared development email sender; configure
   and validate an approved custom SMTP provider for real user deliverability.
4. A synthetic, unverified test signup from a production email-delivery check
   was removed from the native Neon directory but its mirrored legacy
   `auth.users`/`profiles`/`user_roles` entries remain. Explicitly scoped
   cleanup requires separate authorization and should be audited.
5. Positive email OTP code entry and successful password reset remain unproven
   by this identity-only backfill.

## Scope

This change is a database recovery **data operation** only: no UI redesign,
route behavior changes, password rewrites, user-role promotion, production
redeployment, or Supabase mutation.
