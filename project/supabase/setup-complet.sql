-- Préparation complète d'un NOUVEAU projet Supabase (à coller en une seule fois dans « SQL Editor »).
-- Contenu : entraide (questions/réponses), progression et emploi du temps des élèves, stockage privé des PDF.

-- 1) Entraide
CREATE TABLE IF NOT EXISTS public.discussion_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 140),
  body text NOT NULL CHECK (char_length(body) BETWEEN 3 AND 5000),
  subject text NOT NULL DEFAULT 'Général',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.discussion_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.discussion_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 3000),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can read discussion posts" ON public.discussion_posts;
CREATE POLICY "Students can read discussion posts" ON public.discussion_posts FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Students can create own discussion posts" ON public.discussion_posts;
CREATE POLICY "Students can create own discussion posts" ON public.discussion_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can update own discussion posts" ON public.discussion_posts;
CREATE POLICY "Students can update own discussion posts" ON public.discussion_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can delete own discussion posts" ON public.discussion_posts;
CREATE POLICY "Students can delete own discussion posts" ON public.discussion_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can read discussion replies" ON public.discussion_replies;
CREATE POLICY "Students can read discussion replies" ON public.discussion_replies FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Students can create own discussion replies" ON public.discussion_replies;
CREATE POLICY "Students can create own discussion replies" ON public.discussion_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can update own discussion replies" ON public.discussion_replies;
CREATE POLICY "Students can update own discussion replies" ON public.discussion_replies FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can delete own discussion replies" ON public.discussion_replies;
CREATE POLICY "Students can delete own discussion replies" ON public.discussion_replies FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS discussion_posts_created_at_idx ON public.discussion_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS discussion_replies_post_id_idx ON public.discussion_replies(post_id);

-- 2) Progression et emploi du temps (une ligne par élève et par type de donnée)
CREATE TABLE IF NOT EXISTS public.user_data (
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, key)
);
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students manage own data" ON public.user_data;
CREATE POLICY "Students manage own data" ON public.user_data FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3) Stockage privé des documents PDF
INSERT INTO storage.buckets (id, name, public) VALUES ('ressources', 'ressources', false) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Eleves connectes lisent les ressources" ON storage.objects;
CREATE POLICY "Eleves connectes lisent les ressources" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'ressources');
