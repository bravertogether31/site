import { createFileRoute } from "@tanstack/react-router";
import { handleAuthProxyRequest } from "@neondatabase/auth/server";

function validateConfiguredAuthOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const origin = new URL(value);
    if (
      origin.protocol !== "https:" ||
      !origin.hostname.endsWith(".neon.tech") ||
      !origin.hostname.includes(".neonauth.") ||
      origin.username ||
      origin.password ||
      origin.search ||
      origin.hash
    ) return null;
    return value.replace(/\/$/, "");
  } catch {
    return null;
  }
}

async function handler({ request }: { request: Request }): Promise<Response> {
  const disabled = () => Response.json(
    { error: "Auth migration not enabled." },
    { status: 404, headers: { "Cache-Control": "no-store" } },
  );
  if (process.env.NEON_AUTH_PROXY_ENABLED !== "1") return disabled();

  const baseUrl = validateConfiguredAuthOrigin(process.env.NEON_AUTH_BASE_URL);
  const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET ?? "";
  const appOrigin = process.env.BRAVER_SITE_ORIGIN ?? "";
  if (!baseUrl || cookieSecret.length < 32) return disabled();

  const pathname = new URL(request.url).pathname;
  const apiPrefix = "/api/neon-auth/";
  if (!pathname.startsWith(apiPrefix)) return disabled();
  const path = pathname.slice(apiPrefix.length);
  if (!path || path.startsWith("/") || path.includes("..") || path.includes("//")) {
    return Response.json({ error: "Invalid authentication path." }, { status: 400 });
  }

  // Treat every mutation as same-origin only; trust the configured deployment
  // origin instead of caller-controlled Host / X-Forwarded-Host headers.
  if (request.method !== "GET") {
    const submittedOrigin = request.headers.get("origin");
    let allowed = false;
    try {
      const expected = new URL(appOrigin);
      allowed = Boolean(
        submittedOrigin &&
        expected.origin === new URL(submittedOrigin).origin &&
        (expected.protocol === "https:" ||
          (process.env.BRAVER_ALLOW_LOCALHOST_TESTS === "1" &&
            expected.protocol === "http:" && expected.hostname === "localhost"))
      );
    } catch { /* deny malformed origins */ }
    if (!allowed || request.headers.get("sec-fetch-site") === "cross-site") {
      return Response.json(
        { error: "Invalid request origin." },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
    }
  }

  // Toolkit validates upstream responses, manages first-party session cookies
  // and signs the session-data cache with a private server-only secret.
  return handleAuthProxyRequest({
    request,
    path,
    baseUrl,
    cookieSecret,
    sameSite: "lax",
    sessionDataTtl: 60,
  });
}

export const Route = createFileRoute("/api/neon-auth/$")({
  server: {
    handlers: {
      GET: handler,
      POST: handler,
    },
  },
});
