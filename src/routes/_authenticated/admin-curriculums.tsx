import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { FilePlus2, FileText, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout, Section, Eyebrow } from "@/components/SiteLayout";
import {
  listAdminCurriculums, updateCurriculumDocument,
  type CurriculumDocument,
} from "@/lib/curriculums.functions";

export const Route = createFileRoute("/_authenticated/admin-curriculums")({
  head: () => ({ meta: [
    { title: "Curriculum Editor — BraverTogether" },
    { name: "robots", content: "noindex,nofollow" },
  ] }),
  component: CurriculumEditor,
});

function CurriculumEditor() {
  const listDocs = useServerFn(listAdminCurriculums);
  const saveDoc = useServerFn(updateCurriculumDocument);
  const [rows, setRows] = useState<CurriculumDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<"curriculum" | "cheat_sheet">("curriculum");

  const reload = useCallback(async () => {
    try {
      const result = await listDocs();
      setRows(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Administrator access is required.");
    } finally { setLoading(false); }
  }, [listDocs]);
  useEffect(() => { void reload(); }, [reload]);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading) return;
    setUploading(true);
    try {
      const form = event.currentTarget;
      const payload = new FormData(form);
      payload.set("kind", kind);
      const response = await fetch("/api/curriculum-upload", {
        method: "POST", credentials: "same-origin", body: payload,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Upload failed.");
      toast.success("PDF uploaded as a draft. Publish it below when ready.");
      form.reset();
      setKind("curriculum");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "The PDF could not be uploaded.");
    } finally { setUploading(false); }
  }

  async function save(doc: CurriculumDocument) {
    try {
      await saveDoc({ data: {
        id: doc.id, title: doc.title, country: doc.country,
        description: doc.description, published: Boolean(doc.published),
      } });
      toast.success(doc.published ? "Document published." : "Document saved as a draft.");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save this document.");
    }
  }

  function change(id: string, changes: Partial<CurriculumDocument>) {
    setRows(current => current.map(row => row.id === id ? { ...row, ...changes } : row));
  }

  return (
    <SiteLayout>
      <div className="bg-hero">
        <Section className="py-16">
          <Eyebrow>Administrator</Eyebrow>
          <h1 className="mt-4 text-4xl font-bold">Curriculum Editor</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Upload country-specific digital legal literacy PDF curriculums and cheat sheets.
            New PDFs stay private until you explicitly publish them.
          </p>
          <Link to="/curriculums" search={{ tab: undefined }} className="mt-4 inline-flex text-sm font-semibold text-teal hover:underline">View the public library</Link>
        </Section>
      </div>
      <Section className="max-w-5xl">
        {error ? (
          <p role="alert" className="rounded-xl border border-destructive/30 p-5 text-sm text-destructive">{error}</p>
        ) : (
          <>
            <form onSubmit={upload} className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-2xl font-bold"><FilePlus2 className="h-6 w-6 text-teal" /> Upload a PDF</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold">Title
                  <input name="title" required minLength={3} maxLength={180} className="rounded-xl border border-border bg-background px-4 py-3 font-normal" placeholder="Digital Rights — UAE" /></label>
                <label className="grid gap-2 text-sm font-semibold">Country or jurisdiction
                  <input name="country" required minLength={2} maxLength={120} className="rounded-xl border border-border bg-background px-4 py-3 font-normal" placeholder="United Arab Emirates" /></label>
                <label className="grid gap-2 text-sm font-semibold">Document type
                  <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className="rounded-xl border border-border bg-background px-4 py-3 font-normal">
                    <option value="curriculum">Full Curriculum</option>
                    <option value="cheat_sheet">Cheat Sheet</option>
                  </select></label>
                <label className="grid gap-2 text-sm font-semibold">PDF (up to 10 MB)
                  <input name="file" type="file" accept=".pdf,application/pdf" required className="min-w-0 rounded-xl border border-border bg-background p-3 font-normal" /></label>
                <label className="grid gap-2 text-sm font-semibold sm:col-span-2">Short description (optional)
                  <textarea name="description" maxLength={1200} rows={3} className="rounded-xl border border-border bg-background px-4 py-3 font-normal" placeholder="Topics covered in this material" /></label>
              </div>
              <button disabled={uploading} type="submit" className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}
                {uploading ? "Uploading…" : "Upload as draft"}
              </button>
            </form>

            <div className="mt-12">
              <h2 className="text-2xl font-bold">Manage documents</h2>
              <p className="mt-2 text-sm text-muted-foreground">Edit titles and countries, then save to publish or unpublish. PDF contents cannot be changed without uploading a new version.</p>
              {loading ? <p role="status" className="mt-6 text-sm text-muted-foreground">Loading documents…</p> :
               rows.length === 0 ? (
                <p className="mt-6 rounded-2xl border border-dashed border-border p-8 text-sm text-muted-foreground">No PDFs have been uploaded yet.</p>
               ) : (
                <div className="mt-6 space-y-5">
                  {rows.map(doc => (
                    <article key={doc.id} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-teal">
                          <FileText className="h-4 w-4" />
                          {doc.kind === "curriculum" ? "Curriculum" : "Cheat Sheet"}
                        </div>
                        <span className={doc.published ? "text-xs font-semibold text-teal" : "text-xs font-semibold text-muted-foreground"}>
                          {doc.published ? "Published" : "Draft"}
                        </span>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="grid gap-1.5 text-xs font-semibold">Title
                          <input value={doc.title} onChange={e => change(doc.id,{title:e.target.value})} className="rounded-lg border border-border bg-background p-3 text-sm font-normal" /></label>
                        <label className="grid gap-1.5 text-xs font-semibold">Country
                          <input value={doc.country} onChange={e => change(doc.id,{country:e.target.value})} className="rounded-lg border border-border bg-background p-3 text-sm font-normal" /></label>
                        <label className="grid gap-1.5 text-xs font-semibold sm:col-span-2">Description
                          <textarea value={doc.description} onChange={e => change(doc.id,{description:e.target.value})} className="rounded-lg border border-border bg-background p-3 text-sm font-normal" rows={2} /></label>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                        <label className="flex items-center gap-2 text-sm font-medium">
                          <input type="checkbox" checked={Boolean(doc.published)} onChange={e=>change(doc.id,{published:e.target.checked})} />
                          Published to public library
                        </label>
                        <button onClick={() => void save(doc)} type="button" className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white"><Save className="h-4 w-4" /> Save changes</button>
                      </div>
                    </article>
                  ))}
                </div>
               )}
            </div>
          </>
        )}
      </Section>
    </SiteLayout>
  );
}
