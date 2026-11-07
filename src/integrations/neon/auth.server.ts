import { createAuthServer, extractNeonAuthCookies } from "@neondatabase/auth/server";
import { getRequest, setCookie } from "@tanstack/react-start/server";

function validateNeonUrl(value: string | undefined): string {
  if (!value) throw new Error("Neon Auth is not configured");
  const parsed = new URL(value);
  if (parsed.protocol !== "https:" ||
    !parsed.hostname.endsWith(".neon.tech") ||
    !parsed.hostname.includes(".neonauth.") ||
    parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error("Invalid managed Neon Auth endpoint");
  }
  return value.replace(/\/$/, "");
}

function build() {
  const secret = process.env.NEON_AUTH_COOKIE_SECRET ?? "";
  const siteOrigin = process.env.BRAVER_SITE_ORIGIN ?? "";
  if (secret.length < 32) throw new Error("Auth cookie signature key missing");
  return createAuthServer({
    baseUrl: validateNeonUrl(process.env.NEON_AUTH_BASE_URL),
    cookieSecret: secret,
    sessionDataTtl: 60,
    sameSite: "lax",
    context: () => {
      const request = getRequest();
      return {
        getCookies: () => extractNeonAuthCookies(request.headers.get("cookie") ?? ""),
        setCookie: (name, value, options) => {
          setCookie(name, value, options);
        },
        getHeader: (name) => request.headers.get(name),
        getOrigin: () => {
          const header = request.headers.get("origin");
          // Trusted provider validates these origins. Never let Host alone
          // establish the origin on a deployed server.
          return header || siteOrigin;
        },
        getFramework: () => "tanstack-start",
      };
    },
  });
}

let cached:
  | { config: string; client: ReturnType<typeof createAuthServer> }
  | undefined;

export function neonAuthServer() {
  if (process.env.BRAVER_AUTH_PROVIDER !== "neon") {
    throw new Error("Neon Auth is not the selected application provider.");
  }
  const key = [
    process.env.NEON_AUTH_BASE_URL,
    process.env.NEON_AUTH_COOKIE_SECRET,
    process.env.BRAVER_SITE_ORIGIN,
  ].join("|");
  if (!cached || cached.config !== key) cached = { config: key, client: build() };
  return cached.client;
}

export async function requireNeonAccountSession(): Promise<{
  id: string;
  email: string;
  sessionId: string;
}> {
  const result = await neonAuthServer().getSession();
  const user = result?.data?.user;
  const session = result?.data?.session;
  if (!user?.id || !user.email || user.emailVerified !== true || !session?.id) {
    throw new Error("Unauthorized: verified Neon session required.");
  }
  return { id: user.id, email: user.email.trim().toLowerCase(), sessionId: session.id };
}
