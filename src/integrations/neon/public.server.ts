import { createInternalNeonAuth } from "@neondatabase/auth";
import { SupabaseAuthAdapter } from "@neondatabase/auth/vanilla/adapters";
import { PostgrestClient } from "@supabase/postgrest-js";

/**
 * A read-only, anonymous Neon Data API client for the public website.
 * This does not replace server-side administrative or member operations.
 *
 * The source's original anon SELECT grants and RLS policies must be restored
 * before selecting BRAVER_PUBLIC_DATA_PROVIDER=neon.
 *
 * No database passwords, service-role tokens, or legacy auth hashes are used.
 */
function validatedEndpoint(value: string | undefined, kind: "auth" | "api"): string {
  if (!value) throw new Error(`Missing ${kind === "auth" ? "NEON_AUTH_BASE_URL" : "NEON_DATA_API_URL"}.`);
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    !url.hostname.endsWith(".neon.tech") ||
    !url.hostname.includes(kind === "auth" ? ".neonauth." : ".apirest.") ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error("Invalid Neon public endpoint configuration.");
  }
  return url.toString().replace(/\/$/, "");
}

let cached: { key: string; client: PostgrestClient } | undefined;

export function publicNeonEnabled(): boolean {
  const mode = process.env.BRAVER_PUBLIC_DATA_PROVIDER ?? "supabase";
  if (mode !== "neon" && mode !== "supabase") {
    throw new Error("Unknown public data provider; refusing to query an unverified backend.");
  }
  return mode === "neon";
}

export function getNeonPublicClient(): PostgrestClient {
  if (typeof window !== "undefined") throw new Error("Server-side Neon public client only.");

  const authUrl = validatedEndpoint(process.env.NEON_AUTH_BASE_URL, "auth");
  const dataApiUrl = validatedEndpoint(process.env.NEON_DATA_API_URL, "api");
  const key = authUrl + "|" + dataApiUrl;
  if (cached?.key === key) return cached.client;

  const auth = createInternalNeonAuth(authUrl, {
    adapter: SupabaseAuthAdapter(),
    allowAnonymous: true,
  });

  const client = new PostgrestClient(dataApiUrl, {
    schema: "public",
    fetch: async (input, init) => {
      const token = await auth.getJWTToken();
      if (!token) throw new Error("Neon anonymous token not available; refusing unverified request.");
      const headers = new Headers(init?.headers);
      headers.set("Authorization", `Bearer ${token}`);
      headers.set("Cache-Control", "no-store");
      return fetch(input, { ...init, headers, redirect: "error" });
    },
  });
  cached = { key, client };
  return client;
}
