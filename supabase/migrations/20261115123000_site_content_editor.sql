-- The organization mailbox may edit designated site copy and PDFs, not user accounts,
-- roles, advisor applications, private messages, or competition adjudication.
CREATE TABLE IF NOT EXISTS public.site_content_editors (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_content_editors ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.site_copy (
  key text PRIMARY KEY CHECK (key IN (
    'home.hero_description',
    'home.platform_paragraph_1','home.platform_paragraph_2','home.platform_paragraph_3',
    'about.founder_bio_1','about.founder_bio_2',
    'about.our_mission','about.our_goal','about.our_gap',
    'curriculums.intro'
  )),
  value text NOT NULL CHECK (char_length(value) BETWEEN 1 AND 2000),
  edited_by uuid NOT NULL REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_copy ENABLE ROW LEVEL SECURITY;

INSERT INTO public.site_content_editors(user_id)
SELECT id FROM auth.users WHERE lower(email) = 'bravertogether31@gmail.com'
ON CONFLICT (user_id) DO NOTHING;
