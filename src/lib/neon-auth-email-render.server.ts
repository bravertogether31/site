import verificationTemplate from "./email-templates/verification.html?raw";

export type BraverEmail = {
  subject: string;
  html: string;
  text: string;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;",
  })[char] || char);
}

/** Original archived Supabase/Resend email HTML, with a dynamic OTP substituted. */
export function brandedOtpEmail(code: string, type: "email-verification" | "sign-in" | "forget-password"): BraverEmail {
  if (!/^\d{6}$/.test(code)) throw new Error("Invalid verification code");
  const title = type === "forget-password" ? "Reset your password" :
    type === "sign-in" ? "Confirm your sign in" : "Verify your email";
  const description = type === "forget-password"
    ? "Enter the six-digit code below to reset your BraverTogether password."
    : type === "sign-in"
    ? "Enter the six-digit code below to sign in to your BraverTogether account."
    : "Enter the six-digit code below to continue creating your BraverTogether account.";
  const html = verificationTemplate
    .replaceAll("{{OTP_CODE}}", code)
    .replaceAll("Verify your email", title)
    .replaceAll("Email verification", type === "forget-password" ? "Password reset" :
      type === "sign-in" ? "Sign-in verification" : "Email verification")
    .replaceAll("Enter the six-digit code below to continue creating your BraverTogether account.", description);
  const subject = type === "email-verification"
    ? `${code} is your BraverTogether verification code`
    : type === "forget-password"
    ? `${code} is your BraverTogether password reset code`
    : `${code} is your BraverTogether sign-in code`;
  return { subject, html, text: `${title}\n\n${description}\n\nVerification code: ${code}\n\nKeep this code private. Never share it.\n\nBraverTogether · Digital Legal Literacy` };
}

export function brandedLinkEmail(url: string, type: "email-verification" | "sign-in" | "forget-password"): BraverEmail {
  const title = type === "forget-password" ? "Reset your password" :
    type === "sign-in" ? "Sign in to BraverTogether" : "Verify your email";
  const description = type === "forget-password"
    ? "Use the secure link below to reset your BraverTogether password."
    : type === "sign-in"
    ? "Use the secure link below to access your BraverTogether account."
    : "Use the secure link below to finish verifying your email address.";
  const action = type === "forget-password" ? "Reset password" :
    type === "sign-in" ? "Sign in securely" : "Verify email";
  const safeUrl = escapeHtml(url);
  const button = `<a href="${safeUrl}" style="display:inline-block; background:#007f87; color:#ffffff; padding:14px 22px; font:700 16px Inter,Arial,sans-serif; border-radius:9px; text-decoration:none; letter-spacing:0;">${action}</a>`;
  const html = verificationTemplate
    .replaceAll("Email verification", type === "forget-password" ? "Password reset" : "Email verification")
    .replaceAll("Verify your email", title)
    .replaceAll("Enter the six-digit code below to continue creating your BraverTogether account.", description)
    .replace("Your BraverTogether verification code is {{OTP_CODE}}.", description)
    .replace("{{OTP_CODE}}", button)
    .replace("Verification code", "Secure link");
  return { subject: `${title} — BraverTogether`, html, text: `${title}\n\n${description}\n\n${url}\n\nNever share this link. If you didn't request this email, you can ignore it.\n\nBraverTogether · Digital Legal Literacy` };
}
