-- Public-facing country curricula and quick reference cheat sheets.
-- RLS deliberately has no client policies: reads/writes go through the
-- role-checked first-party server, never through a public SQL endpoint.
CREATE TABLE IF NOT EXISTS public.curriculum_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 180),
  country text NOT NULL CHECK (char_length(country) BETWEEN 2 AND 120),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 1200),
  kind text NOT NULL CHECK (kind IN ('curriculum', 'cheat_sheet')),
  storage_key text NOT NULL UNIQUE CHECK (char_length(storage_key) BETWEEN 10 AND 500),
  original_filename text NOT NULL CHECK (char_length(original_filename) <= 200),
  file_size_bytes bigint NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 10485760),
  file_sha256 text NOT NULL CHECK (file_sha256 ~ '^[0-9a-f]{64}$'),
  published boolean NOT NULL DEFAULT false,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS curriculum_documents_public_kind_country_idx
  ON public.curriculum_documents(kind, country, title)
  WHERE published;
CREATE INDEX IF NOT EXISTS curriculum_documents_uploaded_idx
  ON public.curriculum_documents(created_at DESC);
ALTER TABLE public.curriculum_documents ENABLE ROW LEVEL SECURITY;
