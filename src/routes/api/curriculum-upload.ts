import { createFileRoute } from "@tanstack/react-router";
import { createHash, randomUUID } from "node:crypto";
import { validateDocument } from "@/lib/document-validation";

const MAX_PDF_BYTES = 10 * 1024 * 1024;
const HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

function safeOrigin(request: Request) {
  const allowed = process.env.BRAVER_SITE_ORIGIN;
  if (!allowed || request.headers.get("sec-fetch-site") === "cross-site") return false;
  try {
    return new URL(request.headers.get("origin") || "").origin === new URL(allowed).origin;
  } catch { return false; }
}

export const Route = createFileRoute("/api/curriculum-upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (process.env.BRAVER_AUTH_PROVIDER !== "neon") {
          return Response.json({ error: "Upload service is not configured." }, { status: 503, headers: HEADERS });
        }
        if (!safeOrigin(request) || Number(request.headers.get("content-length") || "0") > MAX_PDF_BYTES + 65536) {
          return Response.json({ error: "Invalid or oversized upload request." }, { status: 403, headers: HEADERS });
        }
        try {
          const { requireNeonAccountSession } = await import("@/integrations/neon/auth.server");
          const { loadAccountAccessState } = await import("@/lib/account-access.functions");
          const { id: adminId } = await requireNeonAccountSession();
          if ((await loadAccountAccessState(adminId)).role !== "administrator") {
            return Response.json({ error: "Administrator access is required." }, { status: 403, headers: HEADERS });
          }

          const data = await request.formData();
          const get = (name: string) => String(data.get(name) || "").trim();
          const title = get("title");
          const country = get("country");
          const description = get("description");
          const kind = get("kind");
          const file = data.get("file");
          if (title.length < 3 || title.length > 180 ||
              country.length < 2 || country.length > 120 ||
              description.length > 1200 ||
              !["curriculum", "cheat_sheet"].includes(kind) ||
              !(file instanceof File) ||
              file.size === 0 || file.size > MAX_PDF_BYTES ||
              !/\.pdf$/i.test(file.name) || file.name.length > 200) {
            return Response.json({ error: "Enter a title, country, category, and a PDF no larger than 10 MB." }, { status: 400, headers: HEADERS });
          }
          const bytes = new Uint8Array(await file.arrayBuffer());
          validateDocument(bytes, "application/pdf");

          const documentId = randomUUID();
          const objectKey = `${adminId}/${documentId}.pdf`;
          const sha = createHash("sha256").update(bytes).digest("hex");
          const { uploadPrivatePdf, deletePrivateDocument } = await import("@/integrations/neon/storage.server");
          const { getNeonServerDatabasePool } = await import("@/integrations/neon/legacy-login.server");
          await uploadPrivatePdf("curriculums", objectKey, bytes);
          try {
            await getNeonServerDatabasePool().query(
              `INSERT INTO public.curriculum_documents
                (id,title,country,description,kind,storage_key,original_filename,file_size_bytes,file_sha256,published,uploaded_by)
               VALUES ($1::uuid,$2,$3,$4,$5,$6,$7,$8,$9,false,$10::uuid)`,
              [documentId,title,country,description,kind,objectKey,file.name,file.size,sha,adminId]
            );
          } catch (error) {
            try { await deletePrivateDocument("curriculums", objectKey); } catch (cleanupError) {
              console.warn("[Curriculums] Could not remove an orphaned upload", cleanupError instanceof Error ? cleanupError.name : "unknown");
            }
            throw error;
          }
          return Response.json({ ok: true, id: documentId, published: false }, { status: 201, headers: HEADERS });
        } catch (error) {
          console.error("[Curriculums] Upload error", error instanceof Error ? error.message : "unknown");
          return Response.json({ error: "The PDF could not be uploaded. Check the document and retry." }, { status: 500, headers: HEADERS });
        }
      },
    },
  },
});
