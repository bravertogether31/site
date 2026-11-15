import { createFileRoute } from "@tanstack/react-router";

const headers = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};
export const Route = createFileRoute("/api/curriculum-file")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (process.env.BRAVER_AUTH_PROVIDER !== "neon") {
          return Response.json({ error: "Document service unavailable" }, { status: 503, headers });
        }
        const id = new URL(request.url).searchParams.get("id") || "";
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
          return Response.json({ error: "Invalid document" }, { status: 400, headers });
        }
        try {
          const { getNeonServerDatabasePool } = await import("@/integrations/neon/legacy-login.server");
          const result = await getNeonServerDatabasePool().query<{
            storage_key: string; original_filename: string;
          }>(
            `SELECT storage_key,original_filename FROM public.curriculum_documents WHERE id=$1::uuid AND published=true LIMIT 1`,
            [id]
          );
          const doc = result.rows[0];
          if (!doc) return Response.json({ error: "Document not published" }, { status: 404, headers });
          const { presignPrivateDocumentRead } = await import("@/integrations/neon/storage.server");
          const url = await presignPrivateDocumentRead("curriculums", doc.storage_key, doc.original_filename);
          return new Response(null, { status: 302, headers: { ...headers, Location: url } });
        } catch (error) {
          console.error("[Curriculums] Download error", error instanceof Error ? error.message : "unknown");
          return Response.json({ error: "This PDF is temporarily unavailable." }, { status: 503, headers });
        }
      },
    },
  },
});
