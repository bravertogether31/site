# BraverTogether — 8 November 2026 production recovery continuation

## Exact deployed release and unchanged interface
- Live domain: https://bravertogether.site
- GitHub production main commit: 0a75475e971b6b0d5b8ad7f74d06ee655cdc1ed6
- Render production service: srv-dap0kpmk1f9s7391kavg, release status LIVE
- No frontend/application code or production deploy changed in this continuation.
- Fourteen public URLs returned HTTP 200; five representative pages (home, original signup, original sign-in, about, competitions) rendered in isolated headless Chromium.

## Neon recovery operations
- Production project: autumn-sea-53276711.
- Production branch ID: br-weathered-butterfly-az9e6cri (still deployed); staging remains isolated.
- Original preserved records after explicitly approved synthetic-account cleanup: 12 auth.users, 12 profiles, 12 native Neon Auth user identities, 24 messages, 1 essay submission.
- Zero synthetic test auth.users/profiles/user_roles remain for test identity 15436f78-dd5c-468e-a9d6-e160893011b6.
- Deletion asserted exact identity/email, unverified signup state, no native sessions/accounts, and no conversation/message activity. All three mirrored test rows deleted atomically; readback zero.
- Native identities backfilled: 12/12, exact matching IDs and email addresses, 0 mismatches. No passwords or existing credentials altered; rerun inserted zero rows.
- A read-write production snapshot is not available for this non-root Neon branch. A no-compute, ready, child backup branch was created: br-wild-hall-azpdd60x (braver-production-backup-after-cleanup-20261108). Parent LSN: 0/211C320. Do not delete.
- Protected-branch flag could not be set: current Neon plan has reached its protection allowance.

## Original Supabase access: precise diagnosis
- Original project: wzkyomerlwcdyyoqfkzn, organization eifuyvuoyhcviefdqngo (work), Free plan.
- Supabase status API reports ACTIVE_HEALTHY, but actual REST API with active publishable key returns HTTP 402 and exceed_egress_quota.
- First observed 402 in 2 November API logs: 2026-11-02 23:07:27 UTC. Latest observed successful request before restriction: 2026-11-02 22:43:02 UTC.
- Daily log aggregation: from November 3 through November 8, logged requests were HTTP 402/401, without successful application writes.
- Only successful POST on November 2 was /rest/v1/rpc/consume_ai_allowance (200, 16:07 UTC), not a content submission. A November 1 login token and network-ban retrieval were the two earlier successful POST requests.
- API log evidence reduces but does not eliminate risk of source changes after the November 1 emergency backup: direct SQL/dashboard writes and unlogged actions cannot be ruled out.
- The earlier staged 54/54-table, 377/377-record count parity to the November 1 backup remains historical evidence; not a November 8 live-Supabase reconciliation.
- Do not delete/modify the original Supabase project. To recover source data, restore source API access by resolving Free-plan egress overage at Supabase Organization > Usage, waiting for billing-cycle quota reset or explicitly authorizing a paid upgrade; no billing upgrade was performed.

## Historical archived essay
- Original essay submission ID: 049f2ad1-c11e-48c7-b5e5-bed2a20d8050; recorded filename: Automated_Headwinds_Prompt4.pdf.
- Database record and storage.objects metadata preserved, showing the original object path, exactly 11,260 bytes, and SHA-256 723978f9e8a53461e98cbc42372bfcc182affe6dd45beabbaf70ec34163acbba.
- Neon private bucket essay-submissions currently has zero objects. The PDF binary is missing; the existing app explicitly reports unavailable private objects rather than giving a dead signed URL.
- Searched connected Google Drive and Gmail by exact filename/headwinds. Scanned the connected Mac for matching filename and all PDFs with that exact byte size: no copy found.
- Do not fabricate or substitute a different PDF. After Supabase access returns, retrieve the exact private object and compare SHA-256 before copying to Neon. If unrecoverable, request a replacement from the legitimate owner and verify authenticity.

## Authentication / communication gates still unproven
- Original signup email delivery to a user-owned QA address was confirmed on live production and the test account was removed.
- Full six-digit code-entry and password-reset-email-to-successful-new-login flow remain uncertified; previous automation was blocked during those steps. Do not claim full auth QA.
- Neon Auth has verified email/password enabled, OTP email verification, session revocation on password reset, production trusted domains, and localhost disabled.
- Neon Auth uses the shared auth@mail.myneon.app sender. Dedicated production SMTP is not yet configured; requires verified mail domain, sender provider and credentials.

## Production acceptance / boundary
- Database cleanup and 12-account identity-only backfill: PASSED.
- Frontend parity (no changes) and public live page basic/browser smoke: PASSED for routes tested.
- Private file binary recovery: BLOCKED on missing original bytes/source 402.
- Complete source delta reconciliation: BLOCKED on Supabase exceed_egress_quota.
- End-to-end OTP/password recovery: NOT CERTIFIED.
- Dedicated production email sender: NOT CONFIGURED.
- No paid change, production frontend deployment, Supabase mutation, or additional synthetic user was made by this continuation.

Keep the documentation pull request in draft and do not trigger production auto-deploy merely to merge evidence-only files.
