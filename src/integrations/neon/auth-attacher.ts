import { createMiddleware } from "@tanstack/react-start";

export const attachNeonAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    let token: string | null = null;
    try {
      const response = await fetch("/api/neon-auth/token", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (response.ok) {
        const value = await response.json();
        const candidate = value?.token ?? value?.data?.token;
        if (typeof candidate === "string" &&
            candidate.length <= 8192 &&
            candidate.split(".").length === 3) token = candidate;
      }
    } catch {
      // Public server functions may continue anonymously. Protected
      // functions independently verify bearer token + managed session.
    }
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
