-- BraverTogether essay competition: independent registration before essay submission.
-- Additive migration: preserves all existing submissions and source data.
-- Run only after verifying against isolated Neon staging; apply once to production.
CREATE TABLE IF NOT EXISTS public.competition_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES public.competitions(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  participant_name text NOT NULL CHECK (length(btrim(participant_name)) BETWEEN 2 AND 100),
  participant_age integer NOT NULL CHECK (participant_age BETWEEN 0 AND 120),
  country text NOT NULL CHECK (length(btrim(country)) BETWEEN 2 AND 100),
  school_name text,
  registered_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT competition_registrations_unique_entrant UNIQUE(competition_id,user_id)
);
ALTER TABLE public.competition_registrations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.competition_registrations FROM PUBLIC,anon,authenticated;
COMMENT ON TABLE public.competition_registrations IS
  'Authenticated contest registration precedes optional essay upload; the existing essay_submissions table is unchanged.';
CREATE INDEX IF NOT EXISTS competition_registrations_user_idx
  ON public.competition_registrations(user_id);

-- Count historical essay submitters as registered, without modifying their essays.
INSERT INTO public.competition_registrations
  (competition_id,user_id,participant_name,participant_age,country,school_name,registered_at,updated_at)
SELECT s.competition_id,s.user_id,s.participant_name,s.participant_age,s.country,
       s.school_name,s.created_at,s.updated_at
FROM public.essay_submissions s
WHERE length(btrim(s.participant_name)) BETWEEN 2 AND 100
  AND s.participant_age BETWEEN 0 AND 120
  AND length(btrim(s.country)) BETWEEN 2 AND 100
ON CONFLICT (competition_id,user_id) DO NOTHING;
