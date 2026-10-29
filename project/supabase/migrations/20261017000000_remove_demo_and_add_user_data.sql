/*
  # Passage en production : suppression des données de démonstration

  1. Supprime les tables de démo (cours, devoirs, progression, administrateurs) et leurs fonctions.
  2. Crée `user_data` : progression et emploi du temps de chaque élève, enregistrés dans le compte
     (visibles uniquement par l'élève concerné grâce à la sécurité par ligne).
  Les comptes et l'espace d'entraide (discussion_posts / discussion_replies) ne sont pas touchés.
*/
DROP TABLE IF EXISTS public.learning_progress CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.assignments CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP FUNCTION IF EXISTS public.claim_first_admin;
DROP FUNCTION IF EXISTS public.admin_create_course;
DROP FUNCTION IF EXISTS public.admin_update_course;
DROP FUNCTION IF EXISTS public.admin_create_assignment;
DROP FUNCTION IF EXISTS public.admin_update_assignment;
DROP FUNCTION IF EXISTS public.current_user_is_admin;

-- Pour effacer aussi vos questions de test dans l'espace entraide, décommentez :
-- DELETE FROM public.discussion_replies; DELETE FROM public.discussion_posts;

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
