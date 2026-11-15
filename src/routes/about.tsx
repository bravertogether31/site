import { usePublicSiteCopy } from "@/hooks/use-public-site-copy";
import { SITE_COPY_DEFAULTS } from "@/lib/site-copy";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, Section, Eyebrow } from "@/components/SiteLayout";
import { Target, Sparkles, GitBranch } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    links: [{ rel: "canonical", href: "https://bravertogether.site/about" }],
    meta: [
      { title: "About — BraverTogether" },
      { name: "description", content: "About Tara Vishwakarthik and the mission behind the Digital Legal Literacy Initiative." },
      { property: "og:title", content: "About BraverTogether" },
      { property: "og:description", content: "Why this initiative exists and the gap it fills." },
    ],
  }),
  component: About,
});

function About() {
  const copy = usePublicSiteCopy();
  return (
    <SiteLayout>
      <div className="bg-hero relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-50" />
        <Section className="py-24 relative">
          <Eyebrow>About</Eyebrow>
          <h1 className="mt-4 text-5xl sm:text-6xl font-bold max-w-3xl text-navy-deep">The person behind it — and why it exists.</h1>
        </Section>
      </div>

      <Section>
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 items-start">
          <div className="lg:sticky lg:top-24">
            <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-card shadow-card">
              <img
                src="/tara-founder.webp?v=20260921-2"
                alt="Tara Vishwakarthik, founder of BraverTogether"
                className="h-full w-full object-cover"
                width="819"
                height="1024"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
          <div>
            <Eyebrow>About the founder</Eyebrow>
            <h2 className="mt-4 text-4xl font-bold">Tara Vishwakarthik</h2>
            <div className="mt-6 space-y-5 text-muted-foreground leading-relaxed">
              <p>{copy["about.founder_bio_1"] ?? SITE_COPY_DEFAULTS["about.founder_bio_1"]}</p>
              <p>{copy["about.founder_bio_2"] ?? SITE_COPY_DEFAULTS["about.founder_bio_2"]}</p>
            </div>
          </div>
        </div>
      </Section>

      <div className="bg-secondary/40 border-y border-border">
        <Section>
          <Eyebrow>About the initiative</Eyebrow>
          <h2 className="mt-4 text-4xl sm:text-5xl font-bold max-w-3xl">Why This Exists</h2>

          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {[
              { icon: Target, title: "Our Mission", body: copy["about.our_mission"] ?? SITE_COPY_DEFAULTS["about.our_mission"] },
              { icon: Sparkles, title: "What We Aim to Achieve", body: copy["about.our_goal"] ?? SITE_COPY_DEFAULTS["about.our_goal"] },
              { icon: GitBranch, title: "The Gap We Fill", body: copy["about.our_gap"] ?? SITE_COPY_DEFAULTS["about.our_gap"] },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="h-10 w-10 rounded-xl bg-teal/15 text-teal flex items-center justify-center mb-4">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </SiteLayout>
  );
}
