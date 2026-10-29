/*
  # Stockage des documents pédagogiques (PDF)

  Bucket PRIVÉ « ressources » : seuls les élèves connectés peuvent lire (liens temporaires).
  L'envoi des fichiers se fait avec « npm run ressources » (clé service_role, qui contourne ces règles).
*/
INSERT INTO storage.buckets (id, name, public)
VALUES ('ressources', 'ressources', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Eleves connectes lisent les ressources" ON storage.objects;
CREATE POLICY "Eleves connectes lisent les ressources" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'ressources');
