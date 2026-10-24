# Configuration réelle (à faire une seule fois dans Supabase)

## 1. Base de données
Supabase > SQL Editor : coller et exécuter `supabase/migrations/20261017000000_remove_demo_and_add_user_data.sql`
(supprime les données de démo et crée le stockage de la progression et de l'emploi du temps).

## 2. Code de validation reçu par email
1. Authentication > Sign In / Providers > Email : activer **Confirm email**.
2. Authentication > Emails > Templates : pour **Confirm signup** et **Magic Link**, coller le contenu de
   `supabase/email-templates/confirmation.html` et `magic-link.html` (ils affichent le code `{{ .Token }}`).
3. Authentication > SMTP Settings : activer un **SMTP personnalisé** (Brevo, Resend, Gmail avec mot de passe d'application...).
   Sans cela, Supabase limite fortement le nombre d'emails envoyés (insuffisant pour de vrais élèves).

## 3. Connexion avec Google
1. Google Cloud Console > APIs & Services > Credentials > Create OAuth client ID (Web application).
2. URI de redirection autorisé : `https://<ton-projet>.supabase.co/auth/v1/callback`.
3. Supabase > Authentication > Providers > Google : activer et coller Client ID et Client Secret.
(Facebook : même principe ; le bouton est déjà dans la page.)

## 4. Adresses du site
Authentication > URL Configuration : **Site URL** = l'adresse du site en ligne, et ajouter dans **Redirect URLs** :
`http://localhost:5173` ainsi que l'adresse du site en ligne.

## 5. Assistant IA gratuit (Gemini) ou payant (Anthropic)
- **Gratuit** : aistudio.google.com > Get API key > Create API key (sans carte bancaire). Collez-la après `GEMINI_API_KEY=` dans `.env`, enregistrez, relancez.
  Limites : quelques dizaines de demandes par minute/jour selon Google (voir aistudio.google.com/rate-limit). Sur l'offre gratuite, Google peut utiliser les échanges pour améliorer ses produits : n'envoyez pas de données personnelles d'élèves.
- **Payant** (qualité maximale) : `ANTHROPIC_API_KEY=` (console.anthropic.com). Si les deux clés sont présentes, Anthropic est utilisée ; `AI_PROVIDER=gemini` force Gemini.

## 6. Documents PDF (Supabase Storage)
1. SQL Editor : exécuter `supabase/migrations/20261018000000_storage_ressources.sql` (crée le bucket privé « ressources »).
2. Project Settings > API : copier la clé **service_role** (secrète) dans `.env` : `SUPABASE_SERVICE_ROLE_KEY=...` (ne jamais la partager ni la mettre sur GitHub).
3. Dans le dossier du projet : `npm run ressources` (envoie tous les PDF du dossier `ressources/`).
