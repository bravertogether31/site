# BraverTogether managed Neon Auth email customization

Status: Implementation prepared behind an **OFF-by-default** feature flag.
This file documents the release gate. Do not enable the Neon email webhook
merely because the endpoint deploys successfully.

## Previously working Supabase email configuration

- From: `BraverTogether <no-reply@mail.bravertogether.site>`
- Provider: Resend, via `smtp.resend.com:465` in the old Supabase project
- The original six-digit verification email HTML was reconstructed from a
  delivered, historical email (with its actual code omitted).
- These original provider **credentials have not been recovered**.
  Do not use the SMTP password as the Resend API key unless Resend confirms
  that exact credential is valid for its REST API.

## Prerequisites

1. Obtain a live `re_...` **Resend REST API key** from the existing Resend
   project, with permission to send from `mail.bravertogether.site`.
   Never commit or print the key.
2. Confirm domain verification and SPF/DKIM at Resend.
3. In the Render *staging* service, configure secret `RESEND_API_KEY`, and
   `BRAVER_AUTH_EMAIL_WEBHOOK_ENABLED=1`. Do not expose either in `VITE_`
   variables. Keep production's flag OFF.
4. Confirm the current `NEON_AUTH_BASE_URL` on each branch. The route
   fetches the trusted JWKS from that branch to verify detached Ed25519 JWS.

## Staging tests BEFORE enabling any managed Neon webhook

- Confirm `/api/neon-auth-email-webhook` answers POST with 503 while disabled,
  and rejects unsigned or expired requests once enabled.
- Confirm a *signed* staging test event sends a real email from the
  verified domain. Verify sender, subjects, mobile HTML, text body, and code.
- Verify a completed account does **not** receive a new sign-up verification
  email, while existing members can still request password recovery.
- Verify duplicate delivery attempts do not produce duplicate Resend email
  sends (Resend `Idempotency-Key` is derived from Neon's event UUID).
- Verify new signup, OTP receive, OTP verification, chosen password, sign-in,
  wrong-code, resend, and password reset on an isolated test account.
- Since Neon treats `send.otp` and `send.magic_link` as **blocking**, failures
  will block signup/reset. Fail closed rather than returning a false 200.

## Neon staging activation

After the above tests and healthy Render deployment, configure only
`br-twilight-recipe-azi9p8zg` with the HTTPS URL:

`https://braver-neon-staging-20261107.onrender.com/api/neon-auth-email-webhook`

Subscribe to `send.otp` and `send.magic_link`; use 5-second per attempt
timeout. Confirm with `get_neon_auth_config` and conduct a real
staging sign-up email test, noting that managed Neon will stop sending its
built-in emails for subscribed events.

Do not enable production until a full staging test passes. Use
`https://bravertogether.site/api/neon-auth-email-webhook` only after
production secret and feature flag are installed.

## Emergency rollback

First disable Neon managed webhooks on the affected branch; verify
`webhook.enabled=false` and that Neon shared-provider emails resume.
Then disable `BRAVER_AUTH_EMAIL_WEBHOOK_ENABLED` in Render. No app/database
schema rollback is required; all code is additive.

## Limitations

This restores the *look and content* of the archived verification email,
not a guarantee of byte-for-byte identical MIME formatting across providers.
The original Supabase project is still subject to its egress restriction.
Production full-source parity and missing historical private file bytes
cannot be certified until the old service becomes accessible.
