/*
# Create the real learning platform foundation

1. New Tables
- `courses`: shared course library entries with subject, description, type, duration, and progress-friendly metadata.
- `assignments`: shared upcoming tests, homework, and revision sessions with due dates.
- `learning_progress`: private progress owned by the signed-in student for each course.
- `discussion_posts`: student questions and help topics visible to the school community.
- `discussion_replies`: student answers attached to community questions.

2. Security
- Row Level Security is enabled on every new table.
- Courses and assignments are intentionally readable by all visitors so the catalogue can be previewed before sign-in; only authenticated operators would normally create them, so no public write policies are added.
- Progress is private to its owner and defaults its owner to the current authenticated user.
- Discussion posts and replies are readable by authenticated users, while students can only create, update, or delete their own contributions.

3. Seed Data
- Adds the initial learning content visible in the Lycée Elhadji Baba Ndiongue dashboard.

4. Important Notes
- No existing tables or user data are altered.
- Authentication uses Supabase's built-in email/password accounts; no custom password table is created.
*/

CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL,
  description text NOT NULL DEFAULT '',
  resource_type text NOT NULL DEFAULT 'Fiche de cours',
  duration_minutes integer NOT NULL DEFAULT 45 CHECK (duration_minutes > 0),
  color text NOT NULL DEFAULT 'blue',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL,
  assignment_type text NOT NULL DEFAULT 'Devoir',
  due_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  progress_percent integer NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, user_id)
);

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

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read courses" ON public.courses;
CREATE POLICY "Public can read courses" ON public.courses FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public can read assignments" ON public.assignments;
CREATE POLICY "Public can read assignments" ON public.assignments FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Students can read own progress" ON public.learning_progress;
CREATE POLICY "Students can read own progress" ON public.learning_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can create own progress" ON public.learning_progress;
CREATE POLICY "Students can create own progress" ON public.learning_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can update own progress" ON public.learning_progress;
CREATE POLICY "Students can update own progress" ON public.learning_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Students can delete own progress" ON public.learning_progress;
CREATE POLICY "Students can delete own progress" ON public.learning_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

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

CREATE INDEX IF NOT EXISTS learning_progress_user_id_idx ON public.learning_progress(user_id);
CREATE INDEX IF NOT EXISTS discussion_posts_created_at_idx ON public.discussion_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS discussion_replies_post_id_idx ON public.discussion_replies(post_id);

INSERT INTO public.courses (title, subject, description, resource_type, duration_minutes, color)
SELECT * FROM (VALUES
  ('Les fonctions affines', 'Mathématiques', 'Comprendre les fonctions affines, leur représentation et leurs variations.', 'Fiche de cours', 45, 'coral'),
  ('La dissertation française', 'Français', 'Méthode complète pour construire une introduction et défendre une thèse.', 'Méthode', 35, 'blue'),
  ('Réactions chimiques', 'Sciences physiques', 'Identifier les réactifs, les produits et équilibrer une équation.', 'Vidéo', 12, 'mint'),
  ('La cellule et son fonctionnement', 'SVT', 'Réviser les organites et les échanges entre la cellule et son milieu.', 'Cours', 40, 'green'),
  ('English conversation basics', 'Anglais', 'Les expressions essentielles pour communiquer avec confiance.', 'Exercices', 30, 'orange')
) AS seed(title, subject, description, resource_type, duration_minutes, color)
WHERE NOT EXISTS (SELECT 1 FROM public.courses);

INSERT INTO public.assignments (title, subject, assignment_type, due_at)
SELECT * FROM (VALUES
  ('Interrogation écrite', 'Mathématiques', 'Évaluation', '2024-10-15 10:00:00+00'::timestamptz),
  ('Devoir maison à rendre', 'Français', 'Devoir', '2024-10-15 18:00:00+00'::timestamptz),
  ('Club de révision', 'Sciences', 'Révision', '2024-10-17 16:30:00+00'::timestamptz)
) AS seed(title, subject, assignment_type, due_at)
WHERE NOT EXISTS (SELECT 1 FROM public.assignments);