/**
 * Shared first-party, short-lived session-status request for Neon browser paths.
 *
 * /api/neon-signup validates the live managed session and the mirrored
 * signup_completed flag in ONE server roundtrip. The old client requested
 * /api/neon-auth/get-session and then /api/neon-signup serially, while the
 * navigation hook independently fetched the session again.
 *
 * No browser response is ever used to authorize a server action; all protected
 * routes continue verifying live Neon sessions and account-role rows.
 */
export type NeonSessionStatus = {
  id: string;
  email: string;
  name: string | null;
  signup_completed: boolean;
};

const TTL_MS = 4_000;
let cached: { at: number; value: NeonSessionStatus | null } | undefined;
let pending: Promise<NeonSessionStatus | null> | undefined;
let generation = 0;

export function clearNeonSessionStatus(): void {
  generation += 1;
  cached = undefined;
  pending = undefined;
}

export function loadNeonSessionStatus(fresh = false): Promise<NeonSessionStatus | null> {
  const current = Date.now();
  if (pending) return pending;
  if (!fresh && cached && current - cached.at < TTL_MS) return Promise.resolve(cached.value);
  const startedGeneration = generation;
  const request = fetch("/api/neon-signup", { credentials: "same-origin", cache: "no-store" })
    .then(async (response): Promise<NeonSessionStatus | null> => {
      if (response.status === 401) return null;
      if (!response.ok) throw new Error("Neon session status temporarily unavailable");
      const state: unknown = await response.json();
      if (!state || typeof state !== "object") throw new Error("Unexpected Neon session status");
      const object = state as Record<string, unknown>;
      if (typeof object.id !== "string" || typeof object.email !== "string" ||
          typeof object.signup_completed !== "boolean") {
        throw new Error("Incomplete Neon session status");
      }
      return {
        id: object.id,
        email: object.email,
        name: typeof object.name === "string" ? object.name : null,
        signup_completed: object.signup_completed,
      };
    })
    .then(value => {
      if (generation === startedGeneration) cached = { at: Date.now(), value };
      return value;
    })
    .finally(() => {
      if (pending === request) pending = undefined;
    });
  pending = request;
  return request;
}
