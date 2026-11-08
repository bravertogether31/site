# BraverTogether — Neon recovery release gate
**Checkpoint:** 8 November 2026
**GitHub repository:** `bravertogether31/site`
**Isolated feature branch:** `codex/neon-cutover-20261107`
**Staging URL:** https://braver-neon-staging-20261107.onrender.com
**Staging Render service:** `srv-dbnmuebbc2fs73fjfalg`
**Production Render service:** `srv-dap0kpmk1f9s7391kavg` (still on Supabase and main; not modified during these tests)

## Verified — hosted HTTPS end-to-end
The following were exercised on the actual Render staging hostname using separate, isolated headless Chromium sessions, not just API mocks:

1. **Public UI:** 13 of 13 pages rendered in mobile-sized Chromium, no page-level JavaScript errors.
2. **Member:** preserved legacy bcrypt password upgraded at first sign-in to managed Neon Auth; correct account role, support-request form inserted a private conversation and its initial message; Profile, Meetings, Essay Submission and Advisor Application rendered; anonymous access redirected to sign-in.
3. **Logout:** session-cookie sign-out originally failed with HTTP 415; fixed to send JSON in both frontend clients. Hosted QA confirms navigation to home, server rejection of the old session, and denial of protected routes.
4. **Administrator:** original-password sign-in, correct administrator role and all three administrator pages (advisor applications, competition control room and safety reports) rendered. A migrated date-handling crash was repaired.
5. **Advisor and two-party messaging:** approved advisor logged in, could see only unclaimed queue metadata, claimed a request, then could read the private question, replied, created a meeting proposal; a separate member session accepted it. Assignments, replies and status changes were checked in Neon. The restored Supabase triggers were adjusted on staging to recognize the *server-only* Neon database owner, not ordinary Data API users.
6. **Private CV:** signed browser PUT to isolated `advisor-cvs` bucket; server verified the PDF, file size and SHA-256; pending application recorded; object verified by S3 HEAD.
7. **Private essay:** synthetic open essay competition, member signed-in browser PUT to `essay-submissions`; server verified document, size and SHA-256; receipt and submitted record persisted.
8. **Security:** forged JWT, token lacking matching browser cookie, anonymous private reads, unrelated messages, sender impersonation, arbitrary advisor self-promotion, reassignment of conversation and unfiltered privileged updates were denied or rejected in prior isolated tests.
9. **Cleanup:** every synthetic test account, session, conversation, proposal, application, competition and document was removed; tests have explicit cleanup routines.

Full hosted browser acceptance logs were saved privately on the connected Mac as `/tmp/braver-qa-{public,member,admin,advisor,cv,essay}-final.log`. Tests are scripted in `scripts/neon/smoke-*.mjs`; synthetic tests must not be run on production.

## Recovered content
- Original emergency export dated **1 November 2026**, stored at `/Users/altygupta/Desktop/.dp-emergency-backups-20261101/bravertogether/`.
- **54/54 tables matched the backup's row counts, totaling 377/377 records** on the isolated Neon staging branch as of 8 November 2026. A separate prior proof checked source JSONB row equivalence at import; the current regression rechecked counts.
- The staged database had 12 preserved original identities and zero remaining synthetic native Neon Auth test accounts.
- One historic `essay_submissions.file_path` is present but **the corresponding PDF binary is missing** from Neon Storage. No existing advisor CV file is referenced.
- The application now detects missing private objects before issuing downloads, returning an explicit recovery error rather than a dead signed URL. **The missing PDF itself is not restored.**
- A real six-digit signup verification email was received through Neon shared email delivery, with the app name subsequently changed to BraverTogether. Positive code-entry and password-reset completion have not been verified.
- Original Supabase SQL/list_tables still times out due to source connection restriction. Therefore a November 1 backup count match **does not establish November 8 data freshness**.

## Production cutover — OPEN BLOCKERS
**DO NOT describe production as fully migrated yet.** The old Render production service still uses `main`, with auto-deploy enabled, and the older Supabase application. A premature merge would trigger live deployment.

1. Recover source access and export any changes since the November 1 snapshot; reconcile against the Neon recovery branch without silently discarding records or overwriting newer user changes.
2. Retrieve the missing historical essay PDF from Supabase or its owner, or explicitly document that this single binary is unrecoverable and provide an integrity-checked replacement path.
3. Confirm OTP code-entry and password-reset completion on a test identity. Shared Neon SMTP delivered an actual signup code but is intended for development; configure and verify an approved production sender when available.
4. Final live domain and hosting configuration, authenticated role tests, backup/rollback plan and controlled deployment of the validated code. Keep source Supabase intact for recovery. Do not confuse the isolated Neon staging project branch with a complete fresh-source production migration.
5. Monitor disk space on the connected Mac (about 7–8 GB free), without deleting unrelated data or any of the emergency backup files.

**Staging feature flags:** `BRAVER_AUTH_PROVIDER=neon` and `VITE_BRAVER_AUTH_PROVIDER=neon` with branch-scoped auth/data API/storage. **Production defaults unchanged.** Temporary staging credentials are private and are not committed to GitHub.

## Restart instructions
Inspect the latest `codex/neon-cutover-20261107` branch, connected BraverTogether Render service, isolated Neon project `autumn-sea-53276711` branch `br-twilight-recipe-azi9p8zg`, and Mac backup audit `NEON_RECOVERY_AUDIT_20261107.md`. Keep completed test proofs and leave production unchanged until release blockers are resolved.
