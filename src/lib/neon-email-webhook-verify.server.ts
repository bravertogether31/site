import { createPublicKey, verify as verifyEd25519, type JsonWebKey } from "node:crypto";

const MAX_BODY_BYTES = 20_000;
const MAX_SKEW_MS = 5 * 60_000;
const JWKS_CACHE_MS = 5 * 60_000;

type NeonEmailEvent = {
  event_id: string;
  event_type: "send.otp" | "send.magic_link";
  user: { email?: string; name?: string };
  event_data: {
    otp_code?: string;
    otp_type?: string;
    link_url?: string;
    link_type?: string;
  };
};

let jwksCache: { endpoint: string; keys: JsonWebKey[]; until: number } | undefined;

function jwksEndpoint(authBase: string): string {
  const parsed = new URL(authBase);
  if (parsed.protocol !== "https:" ||
      !parsed.hostname.endsWith(".neon.tech") ||
      !parsed.hostname.includes(".neonauth.") ||
      !parsed.pathname.endsWith("/auth") ||
      parsed.search || parsed.hash || parsed.username || parsed.password) {
    throw new Error("Unexpected Neon Auth source");
  }
  return authBase.replace(/\/$/, "") + "/.well-known/jwks.json";
}

async function getKeys(endpoint: string, refresh = false): Promise<JsonWebKey[]> {
  if (!refresh && jwksCache?.endpoint === endpoint && jwksCache.until > Date.now()) {
    return jwksCache.keys;
  }
  const response = await fetch(endpoint, { redirect: "error", signal: AbortSignal.timeout(1_500) });
  if (!response.ok) throw new Error("Neon signing keys unavailable");
  const parsed: unknown = await response.json();
  if (!parsed || typeof parsed !== "object" ||
      !("keys" in parsed) || !Array.isArray(parsed.keys) || parsed.keys.length > 32) {
    throw new Error("Invalid Neon signing key list");
  }
  const keys = parsed.keys as JsonWebKey[];
  jwksCache = { endpoint, keys, until: Date.now() + JWKS_CACHE_MS };
  return keys;
}

/**
 * Verify Neon's timestamp-bound, detached Ed25519 JWS before reading an
 * email address, one-time code or reset link. All fields remain server-only.
 */
export async function verifyNeonEmailWebhook(
  rawBody: string,
  headers: Headers,
  authBase: string,
): Promise<NeonEmailEvent> {
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) throw new Error("Oversized webhook");
  const detached = headers.get("x-neon-signature") || "";
  const kid = headers.get("x-neon-signature-kid") || "";
  const timestamp = headers.get("x-neon-timestamp") || "";
  const eventId = headers.get("x-neon-event-id") || "";
  const eventType = headers.get("x-neon-event-type") || "";
  if (!/^\d{13}$/.test(timestamp) ||
      Math.abs(Date.now() - Number(timestamp)) > MAX_SKEW_MS ||
      !/^[0-9a-f-]{36}$/i.test(eventId) ||
      !["send.otp","send.magic_link"].includes(eventType)) {
    throw new Error("Invalid webhook metadata");
  }
  const pieces = detached.split(".");
  if (pieces.length !== 3 || pieces[1] !== "" || !pieces[0] || !pieces[2] ||
      pieces[0].length > 2048 || pieces[2].length > 2048) {
    throw new Error("Expected detached JWS");
  }
  let header: { alg?: string; kid?: string; typ?: string; crit?: unknown };
  try { header = JSON.parse(Buffer.from(pieces[0],"base64url").toString("utf8")); }
  catch { throw new Error("Invalid signed header"); }
  if (header.alg !== "EdDSA" || header.kid !== kid || header.crit) {
    throw new Error("Unexpected JWS algorithm or signer");
  }
  const endpoint = jwksEndpoint(authBase);
  const keys = await getKeys(endpoint);
  let key = keys.find(item => item.kid === kid && item.kty === "OKP" && item.crv === "Ed25519");
  if (!key) {
    const latest = await getKeys(endpoint,true);
    key = latest.find(item => item.kid === kid && item.kty === "OKP" && item.crv === "Ed25519");
  }
  if (!key) throw new Error("Webhook signing key not found");
  const payloadB64 = Buffer.from(rawBody,"utf8").toString("base64url");
  const signedPayloadB64 = Buffer.from(`${timestamp}.${payloadB64}`,"utf8").toString("base64url");
  const signingInput = Buffer.from(pieces[0] + "." + signedPayloadB64,"utf8");
  if (!verifyEd25519(null,signingInput,createPublicKey({key,format:"jwk"}),Buffer.from(pieces[2],"base64url"))) {
    throw new Error("Invalid webhook signature");
  }

  let body: NeonEmailEvent;
  try { body = JSON.parse(rawBody) as NeonEmailEvent; }
  catch { throw new Error("Invalid webhook JSON"); }
  if (body.event_id !== eventId || body.event_type !== eventType ||
      !body.user || !body.event_data || typeof body.user.email !== "string" ||
      body.user.email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.user.email)) {
    throw new Error("Invalid webhook event");
  }
  if (body.event_type === "send.otp" &&
      (!/^\d{6}$/.test(body.event_data.otp_code ?? "") ||
       !["email-verification","sign-in","forget-password"].includes(body.event_data.otp_type ?? ""))) {
    throw new Error("Invalid OTP payload");
  }
  if (body.event_type === "send.magic_link") {
    const link = new URL(body.event_data.link_url || "");
    if (link.protocol !== "https:" || link.username || link.password ||
        !["sign-in","email-verification","forget-password"].includes(body.event_data.link_type ?? "")) {
      throw new Error("Invalid reset link payload");
    }
    // The signed payload comes from Neon Auth. Never trust an unrelated host.
    const issuer = new URL(authBase).hostname;
    if (link.hostname !== issuer && link.hostname !== "bravertogether.site" &&
        link.hostname !== "www.bravertogether.site" &&
        link.hostname !== "braver-neon-staging-20261107.onrender.com") {
      throw new Error("Unexpected reset link target");
    }
  }
  return body;
}
