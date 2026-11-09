import { createFileRoute } from "@tanstack/react-router";
import { verifyNeonEmailWebhook } from "@/lib/neon-email-webhook-verify.server";
import { brandedLinkEmail, brandedOtpEmail } from "@/lib/neon-auth-email-render.server";

const fixedHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};
const FROM = "BraverTogether <no-reply@mail.bravertogether.site>";

async function deliverEmail(email: string, message: { subject:string; html:string; text:string }, eventId: string) {
  const key = process.env.RESEND_API_KEY || process.env.BRAVER_RESEND_API_KEY || "";
  if (!/^re_[A-Za-z0-9_-]{10,}$/.test(key)) throw new Error("Resend is not configured");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `braver-neon-${eventId}`,
    },
    body: JSON.stringify({ from: FROM, to: [email], ...message }),
    redirect: "error",
    signal: AbortSignal.timeout(3_500),
  });
  if (!response.ok) throw new Error("Email provider did not accept delivery");
}

/** Do not send signup verification to a previously completed member. */
async function completedAccount(email: string): Promise<boolean> {
  const { getNeonServerDatabasePool } = await import("@/integrations/neon/legacy-login.server");
  const { rows } = await getNeonServerDatabasePool().query<{ completed: boolean }>(
    `SELECT EXISTS(
       SELECT 1 FROM auth.users
       WHERE lower(email)=lower($1) AND
         (email_confirmed_at IS NOT NULL OR raw_user_meta_data->>'signup_completed'='true')
     ) AS completed`,
    [email],
  );
  return rows[0]?.completed === true;
}

async function handler({request}:{request:Request}):Promise<Response> {
  if (process.env.BRAVER_AUTH_PROVIDER !== "neon" ||
      process.env.BRAVER_AUTH_EMAIL_WEBHOOK_ENABLED !== "1") {
    return Response.json({ error: "Email delivery integration is disabled" }, {status:503,headers:fixedHeaders});
  }
  if (request.headers.get("content-type")?.split(";")[0]?.trim() !== "application/json" ||
      Number(request.headers.get("content-length") || 0) > 20_000) {
    return Response.json({error:"Invalid request"},{status:400,headers:fixedHeaders});
  }
  const raw = await request.text();
  let event: Awaited<ReturnType<typeof verifyNeonEmailWebhook>>;
  try {
    const base = process.env.NEON_AUTH_BASE_URL || "";
    event = await verifyNeonEmailWebhook(raw,request.headers,base);
  } catch {
    return Response.json({error:"Unauthorized webhook"},{status:401,headers:fixedHeaders});
  }
  try {
    const email = event.user.email!.trim().toLowerCase();
    if (event.event_type === "send.otp" && event.event_data.otp_type === "email-verification" &&
        await completedAccount(email)) {
      // Only suppress initial signup-verification emails for completed users.
      // Password-reset and sign-in mail to existing users are still valid.
      return Response.json({ok:true},{headers:fixedHeaders});
    }
    const message = event.event_type === "send.otp"
      ? brandedOtpEmail(event.event_data.otp_code!,
          event.event_data.otp_type as "email-verification" | "sign-in" | "forget-password")
      : brandedLinkEmail(event.event_data.link_url!,
          event.event_data.link_type as "email-verification" | "sign-in" | "forget-password");
    await deliverEmail(email,message,event.event_id);
    return Response.json({ok:true},{headers:fixedHeaders});
  } catch {
    // Neon will retry with the SAME event id; Resend's idempotency key prevents
    // duplicate deliveries if the response was lost after successful send.
    // Never log the recipient, verification code, link or API token.
    return Response.json({error:"Email delivery temporarily unavailable"},{status:503,headers:fixedHeaders});
  }
}

export const Route = createFileRoute("/api/neon-auth-email-webhook")({
  server: { handlers: { POST: handler } },
});
