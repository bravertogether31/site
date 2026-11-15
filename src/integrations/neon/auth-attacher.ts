import { createMiddleware } from "@tanstack/react-start";
import { hasRecentAnonymousNeonSession } from "./session-status.browser";

/**
 * A server function never gets a bearer merely because a browser claims to be
 * signed in. Protected functions still verify their bearer and the live server
 * session. This only avoids redundant same-origin token requests, especially
 * for anonymous users moving among public pages.
 */
type TokenCache = { value: string | null; expiresAt: number };
let cache: TokenCache | undefined;
let pending: Promise<string | null> | undefined;
let version = 0;
let listenersInstalled = false;

function invalidate() {
  ++version;
  cache = undefined;
  pending = undefined;
}

function installInvalidation() {
  if (listenersInstalled || typeof window === "undefined") return;
  listenersInstalled = true;
  window.addEventListener("braver-neon-auth-change", invalidate);
  window.addEventListener("focus", invalidate);
}

function maxTokenCacheExpiry(token: string): number {
  const max = Date.now() + 10_000;
  try {
    const claims = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof claims?.exp === "number" && Number.isFinite(claims.exp)) {
      return Math.min(max, claims.exp * 1000 - 30_000);
    }
  } catch {
    // The server authorizes the token; malformed expiry is not cached.
  }
  return 0;
}

async function bearerForServerFunction(): Promise<string | null> {
  installInvalidation();
  if (cache && cache.expiresAt > Date.now()) return cache.value;
  if (hasRecentAnonymousNeonSession()) return null;
  if (pending) return pending;

  const requestVersion = version;
  const request = fetch("/api/neon-auth/token", {
    credentials: "same-origin",
    cache: "no-store",
  }).then(async (response): Promise<string | null> => {
    if (response.status === 401) {
      if (version === requestVersion) {
        cache = { value: null, expiresAt: Date.now() + 20_000 };
      }
      return null;
    }
    if (!response.ok) return null; // Transient failures must not be cached.

    const result: unknown = await response.json();
    const object = result && typeof result === "object" ? result as Record<string, unknown> : {};
    const data = object.data && typeof object.data === "object"
      ? object.data as Record<string, unknown> : {};
    const value = object.token ?? data.token;
    if (typeof value !== "string" || value.length > 8192 ||
      value.split(".").length !== 3) return null;

    const expiresAt = maxTokenCacheExpiry(value);
    if (version === requestVersion && expiresAt > Date.now()) {
      cache = { value, expiresAt };
    }
    return value;
  }).catch(() => null).finally(() => {
    if (pending === request) pending = undefined;
  });

  pending = request;
  return request;
}

export const attachNeonAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const token = await bearerForServerFunction();
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
