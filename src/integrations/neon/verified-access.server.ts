import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { PostgrestClient } from "@supabase/postgrest-js";
import type { JwtPayload } from "@supabase/supabase-js";
import { requireNeonAccountSession } from "@/integrations/neon/auth.server";

let verifier: {
  base: string;
  jwks: ReturnType<typeof createRemoteJWKSet>;
} | undefined;

function origin(): string {
  const configured = process.env.NEON_AUTH_BASE_URL;
  if (!configured) throw new Error("Neon auth verifier is not configured.");
  const url = new URL(configured);
  if (url.protocol !== "https:" ||
      !url.hostname.endsWith(".neon.tech") ||
      !url.hostname.includes(".neonauth.") ||
      url.username || url.password || url.search || url.hash ||
      !url.pathname.endsWith("/auth")) {
    throw new Error("Unexpected Neon JWT issuer.");
  }
  return url.origin;
}

function apiUrl(): string {
  const configured = process.env.NEON_DATA_API_URL;
  if (!configured) throw new Error("Neon Data API is not configured.");
  const url = new URL(configured);
  if (url.protocol !== "https:" ||
      !url.hostname.endsWith(".neon.tech") ||
      !url.hostname.includes(".apirest.") ||
      url.username || url.password || url.search || url.hash ||
      !url.pathname.endsWith("/rest/v1")) {
    throw new Error("Unexpected Neon Data API endpoint.");
  }
  return configured;
}

export async function verifiedNeonRequest(token: string): Promise<{
  userId: string;
  claims: JwtPayload;
  client: PostgrestClient;
}> {
  if (process.env.BRAVER_AUTH_PROVIDER !== "neon") {
    throw new Error("Neon is not the selected authentication provider.");
  }
  if (token.length > 8192 || token.split(".").length !== 3) {
    throw new Error("Unauthorized: Invalid bearer token.");
  }

  const issuer = origin();
  if (!verifier || verifier.base !== issuer) {
    const configured = process.env.NEON_AUTH_BASE_URL!;
    verifier = {
      base: issuer,
      jwks: createRemoteJWKSet(
        new URL(configured.replace(/\/$/, "") + "/.well-known/jwks.json")
      ),
    };
  }
  const { payload } = await jwtVerify(token, verifier.jwks, {
    issuer,
    audience: issuer,
    algorithms: ["EdDSA"],
    clockTolerance: "5s",
  });
  if (
    payload.role !== "authenticated" ||
    typeof payload.sub !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.sub) ||
    payload.emailVerified !== true ||
    payload.banned === true ||
    typeof payload.exp !== "number" || typeof payload.iat !== "number" ||
    payload.aud !== issuer || payload.iss !== issuer
  ) {
    throw new Error("Unauthorized: Invalid user identity.");
  }
  // A valid JWT alone is not enough: require a live first-party Neon session.
  // This detects revoked sign-in sessions and blocks bearer tokens stolen
  // from another browser context.
  const live = await requireNeonAccountSession();
  if (live.id !== payload.sub ||
      (typeof payload.email === "string" &&
       live.email !== payload.email.toLowerCase())) {
    throw new Error("Unauthorized: Token/session mismatch.");
  }

  return {
    userId: live.id,
    claims: {
      ...payload,
      iss: issuer, aud: issuer, sub: live.id,
      iat: payload.iat!, exp: payload.exp!,
      role: "authenticated",
      aal: "aal1",
      session_id: live.sessionId,
    },
    client: new PostgrestClient(apiUrl(), {
      headers: { Authorization: `Bearer ${token}` },
    }),
  };
}
