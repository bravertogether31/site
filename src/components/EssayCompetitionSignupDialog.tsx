import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { listPublicCompetitions } from "@/lib/competition.functions";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const RESUME_KEY = "braver_competition_resume";

/**
 * Invite prospective essay entrants to create or use an account once per tab.
 * The submission portal, not the modal, stores the actual entrant registration.
 * Existing logged-in users are left untouched.
 */
export function EssayCompetitionSignupDialog({ slug, acceptingSubmissions }: { slug: string; acceptingSubmissions: boolean }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading || user || !acceptingSubmissions || !/^[a-z0-9-]{1,120}$/.test(slug)) return;
    const key = `braver_essay_signup_prompt:${slug}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "seen");
    setOpen(true);
  }, [loading, user, slug, acceptingSubmissions]);

  const begin = (mode: "signup" | "signin") => {
    window.sessionStorage.setItem(RESUME_KEY, slug);
    setOpen(false);
    void navigate({ to: "/auth", search: { mode } });
  };

  const browseCompetition = () => {
    setOpen(false);
    void navigate({ to: "/competitions/$slug", params: { slug } });
  };

  if (loading || user || !acceptingSubmissions) return null;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-8">
        <DialogHeader className="text-left">
          <div className="text-xs font-bold uppercase tracking-widest text-teal">Essay competition</div>
          <DialogTitle className="mt-3 text-2xl font-bold">
            Register now. Submit your essay later.
          </DialogTitle>
          <DialogDescription className="mt-3 leading-relaxed">
            Create a free BraverTogether account, save your entrant details, and return to upload your essay before the competition closes.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => begin("signup")}
            className="rounded-full bg-navy px-5 py-3 font-semibold text-white">
            Create free account
          </button>
          <button type="button" onClick={() => begin("signin")}
            className="rounded-full border border-border px-5 py-3 font-semibold">
            Already a member? Sign in
          </button>
        </div>
        <button type="button" onClick={browseCompetition}
          className="mt-3 text-sm text-muted-foreground underline underline-offset-2">
          Browse competition details first
        </button>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Show the essay invitation on the homepage, never as a surprise when a
 * visitor opens a competition's detail page. Only advertise an open essay.
 * Client-side loading keeps the homepage available if competition data fails.
 */
export function HomepageEssayCompetitionPrompt() {
  const { user, loading } = useAuth();
  const [essaySlug, setEssaySlug] = useState<string | null>(null);

  useEffect(() => {
    if (loading || user) return;

    let cancelled = false;
    void listPublicCompetitions()
      .then((competitions) => {
        if (cancelled) return;
        const openEssay = competitions.find(
          (competition) => competition.category === "essay" && competition.acceptingSubmissions,
        );
        if (openEssay) setEssaySlug(openEssay.slug);
      })
      .catch(() => {
        // Never prevent the homepage from loading if competitions are unavailable.
      });

    return () => { cancelled = true; };
  }, [loading, user]);

  if (loading || user || !essaySlug) return null;
  return <EssayCompetitionSignupDialog slug={essaySlug} acceptingSubmissions />;
}
