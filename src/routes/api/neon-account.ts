import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/neon-account")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const headers = {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        };
        if (process.env.BRAVER_AUTH_PROVIDER !== "neon") {
          return Response.json({ error: "Provider disabled." }, { status: 404, headers });
        }
        try {
          const { requireNeonAccountSession } = await import("@/integrations/neon/auth.server");
          const { loadAccountAccessState } = await import("@/lib/account-access.functions");
          const session = await requireNeonAccountSession();
          const bearer = request.headers.get("authorization");
          if (bearer !== null) {
            if (!bearer.startsWith("Bearer ")) throw new Error("Invalid bearer token");
            const { verifiedNeonRequest } = await import("@/integrations/neon/verified-access.server");
            const verified = await verifiedNeonRequest(bearer.slice("Bearer ".length).trim());
            if (verified.userId !== session.id) throw new Error("Session mismatch");
          }
          const account = await loadAccountAccessState(session.id);
          return Response.json({
            id: session.id,
            role: account.role,
            hasRoleConflict: account.hasRoleConflict,
          }, { headers });
        } catch {
          return Response.json({ error: "Unauthenticated." }, { status: 401, headers });
        }
      },
    },
  },
});
