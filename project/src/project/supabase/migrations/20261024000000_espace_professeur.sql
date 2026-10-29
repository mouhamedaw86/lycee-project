/*
  # Espace professeur : documents et chapitres ajoutés depuis le site
  - documents : un document publié (identifiant = emplacement dans le catalogue, path = fichier dans le bucket « ressources »)
  - custom_chapters : chapitres ajoutés par les professeurs (numéros à partir de 101)
  Lecture : élèves connectés. Écriture : uniquement via le serveur du site (clé service_role), réservé aux professeurs.
*/
CREATE TABLE IF NOT EXISTS public.documents (
  id text PRIMARY KEY CHECK (id ~ '^[a-z0-9-]{3,160}$'),
  path text NOT NULL,
  title text,
  kind text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_by_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Eleves connectes lisent les documents" ON public.documents;
CREATE POLICY "Eleves connectes lisent les documents" ON public.documents FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.custom_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id text NOT NULL,
  subject_id text NOT NULL,
  n integer NOT NULL,
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 140),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (class_id, subject_id, n)
);
ALTER TABLE public.custom_chapters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Eleves connectes lisent les chapitres" ON public.custom_chapters;
CREATE POLICY "Eleves connectes lisent les chapitres" ON public.custom_chapters FOR SELECT TO authenticated USING (true);
