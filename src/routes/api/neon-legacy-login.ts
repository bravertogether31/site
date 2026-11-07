import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Credentials = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(4096),
}).strict();

/**
 * Isolated migration-only endpoint.
 * This does NOT issue a session: the managed Neon Auth server authenticates
 * the supplied password and issues a real session on the next sign-in call.
 * Unavailable until the explicit, server-only cutover gate is enabled.
 */
export const Route = createFileRoute("/api/neon-legacy-login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers = { "Cache-Control": "no-store", "Content-Type": "application/json" };
        if (process.env.NEON_LEGACY_LOGIN_ENABLED !== "1") {
          return Response.json({ error: "Authentication migration not available." }, { status: 503, headers });
        }

        const origin = request.headers.get("origin");
        const configuredOrigin = process.env.BRAVER_SITE_ORIGIN;
        const contentType = request.headers.get("content-type")?.split(";")[0]?.trim();
        const size = Number(request.headers.get("content-length") || "0");
        let trustedOrigin = false;
        try {
          trustedOrigin = Boolean(
            configuredOrigin &&
            (new URL(configuredOrigin).protocol === "https:" ||
             (process.env.BRAVER_ALLOW_LOCALHOST_TESTS === "1" &&
              new URL(configuredOrigin).origin.startsWith("http://localhost:"))) &&
            origin &&
            new URL(origin).origin === new URL(configuredOrigin).origin
          );
        } catch {
          trustedOrigin = false;
        }
        if (!trustedOrigin || contentType !== "application/json" || size > 8_192 ||
            request.headers.get("sec-fetch-site") === "cross-site") {
          return Response.json({ error: "Invalid request." }, { status: 403, headers });
        }

        let input: unknown;
        try {
          input = await request.json();
        } catch {
          return Response.json({ ok: false }, { status: 400, headers });
        }
        const parsed = Credentials.safeParse(input);
        if (!parsed.success) {
          return Response.json({ ok: false }, { status: 400, headers });
        }

        try {
          const { prepareLegacyNeonSignIn } = await import(
            "@/integrations/neon/legacy-login.server"
          );
          const upgraded = await prepareLegacyNeonSignIn({
            email: parsed.data.email,
            password: parsed.data.password,
          });
          return Response.json({ ok: upgraded }, { status: 200, headers });
        } catch {
          return Response.json(
            { error: "Sign-in is temporarily unavailable." },
            { status: 503, headers },
          );
        }
      },
    },
  },
});
