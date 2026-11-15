import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, Download, FileText, Search } from "lucide-react";

import { SiteLayout, Section, Eyebrow } from "@/components/SiteLayout";
import { listPublicCurriculums, type CurriculumDocument } from "@/lib/curriculums.functions";

export const Route = createFileRoute("/curriculums")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: search.tab === "cheat-sheets" ? ("cheat-sheets" as const) : undefined,
  }),
  loader: () => listPublicCurriculums(),
  head: () => ({
    links: [{ rel: "canonical", href: "https://bravertogether.site/curriculums" }],
    meta: [
      { title: "Digital Legal Literacy Curriculums & Cheat Sheets — BraverTogether" },
      { name: "description", content: "Explore country-specific digital legal literacy curriculums and concise PDF cheat sheets. Learn about online safety, privacy, digital rights and technology law." },
      { property: "og:title", content: "Digital Legal Literacy Curriculums — BraverTogether" },
      { property: "og:description", content: "Free country-specific learning guides and digital rights cheat sheets." },
    ],
  }),
  component: Curriculums,
});

function Curriculums() {
  const docs = Route.useLoaderData() as CurriculumDocument[];
  const { tab } = Route.useSearch();
  const kind: CurriculumDocument["kind"] = tab === "cheat-sheets" ? "cheat_sheet" : "curriculum";
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return docs.filter((doc) => doc.kind === kind && (!q ||
      [doc.title, doc.country, doc.description].some((part) => part.toLowerCase().includes(q))));
  }, [docs, kind, query]);
  const counts = {
    curriculum: docs.filter((doc) => doc.kind === "curriculum").length,
    cheat_sheet: docs.filter((doc) => doc.kind === "cheat_sheet").length,
  };

  return (
    <SiteLayout>
      <div className="relative overflow-hidden bg-hero">
        <Section className="relative py-20 sm:py-24">
          <Eyebrow><BookOpen className="h-3.5 w-3.5" /> Digital Legal Literacy</Eyebrow>
          <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-tight text-navy-deep sm:text-6xl">
            Curriculums for the digital world.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-deep/75">
            Practical country-specific learning materials to help young people understand
            privacy, technology law, online safety and their digital rights.
          </p>
        </Section>
      </div>
      <Section>
        <nav aria-label="Curriculum sections" className="mb-8 flex flex-wrap items-center gap-2 border-b border-border pb-5">
          <Link
            to="/curriculums"
            search={{ tab: undefined }}
            aria-current={kind === "curriculum" ? "page" : undefined}
            className={kind === "curriculum"
              ? "rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white"
              : "rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary"}
          >Full Curriculums <span className="ml-1 opacity-70">{counts.curriculum}</span></Link>
          <Link
            to="/curriculums"
            search={{ tab: "cheat-sheets" }}
            aria-current={kind === "cheat_sheet" ? "page" : undefined}
            className={kind === "cheat_sheet"
              ? "rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white"
              : "rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary"}
          >Cheat Sheets <span className="ml-1 opacity-70">{counts.cheat_sheet}</span></Link>
          <Link to="/resources" className="rounded-full px-5 py-2.5 text-sm font-semibold text-teal hover:bg-secondary">Video Lessons</Link>
        </nav>

        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold">{kind === "curriculum" ? "Country Curriculums" : "Quick-reference Cheat Sheets"}</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {kind === "curriculum"
                ? "Complete learning material organized by country and jurisdiction."
                : "Short PDF summaries for reviewing key concepts at a glance."}
            </p>
          </div>
          {docs.length > 0 && (
            <label className="relative block w-full sm:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Search curriculum PDFs</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by country or topic"
                className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-teal/30" />
            </label>
          )}
        </div>

        {matches.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((doc) => <DocumentCard doc={doc} key={doc.id} />)}
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10 text-teal">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-semibold">
              {docs.some(d => d.kind === kind) ? "No documents match that search." :
                kind === "curriculum" ? "Country curriculums are being prepared." : "Cheat sheets are being prepared."}
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              {docs.some(d => d.kind === kind) ? "Try a different country or topic." :
                "Published PDF learning materials will appear here once the BraverTogether team uploads them."}
            </p>
            {docs.some(d => d.kind === kind) ? (
              <button onClick={() => setQuery("")} className="mt-5 text-sm font-semibold text-teal hover:underline">Clear search</button>
            ) : (
              <Link to="/resources" className="mt-6 inline-flex rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary">Explore video lessons</Link>
            )}
          </div>
        )}
      </Section>
    </SiteLayout>
  );
}

function DocumentCard({ doc }: { doc: CurriculumDocument }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal">{doc.country}</span>
        <span className="text-xs text-muted-foreground">PDF</span>
      </div>
      <h3 className="mt-4 text-xl font-bold leading-snug">{doc.title}</h3>
      {doc.description && <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{doc.description}</p>}
      <a
        href={`/api/curriculum-file?id=${encodeURIComponent(doc.id)}`}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open PDF: ${doc.title}`}
      >Open PDF <Download className="h-4 w-4" /></a>
    </article>
  );
}
