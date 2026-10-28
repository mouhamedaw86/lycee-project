# Mise en ligne (Supabase + GitHub + Render)
1. **Supabase** (supabase.com) : créer un projet ; dans SQL Editor, coller et lancer `supabase/setup-complet.sql`.
2. Copier dans `.env` : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` (Project Settings > API).
3. Envoyer les PDF : mettre le dossier `ressources/` dans le projet puis `npm install` et `npm run ressources`.
4. **GitHub** : créer un dépôt privé et y envoyer les fichiers de `plateforme-github.zip` (sans `.env`, ni `ressources/`).
5. **Render** (render.com) : New > Blueprint > choisir le dépôt ; renseigner `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`.
6. **Supabase** > Authentication > URL Configuration : mettre l'adresse Render dans *Site URL* et *Redirect URLs*.
7. Emails : voir `CONFIGURATION.md` (SMTP personnalisé) ; pour démarrer, désactiver « Confirm email ».
8. **Espace professeur** : voir `CONFIGURATION.md`, section 7 (`SUPABASE_SERVICE_ROLE_KEY` et `TEACHER_IDS` sur Render).
Test : ouvrir `/api/health` sur l'adresse Render (doit afficher `"ai":true`).

Remarque : sur l'offre gratuite, Render met le site en veille après un temps d'inactivité (premier chargement lent) et Supabase met en pause un projet inactif pendant une semaine.

# Documents (PDF) : stockés dans Supabase Storage, pas dans le site
1. Placez les PDF dans le dossier `ressources/` (ce dossier n'est PAS envoyé sur GitHub). Le NOM du fichier est l'identifiant du document :
   - Cours : `terminale-s1-mathematiques-cours1.pdf` — TD : `...-td3.pdf` — corrigé : `...-td3-corrige.pdf`
   - Évaluations : `...-devoir-surveille-n-1.pdf`, `...-composition-du-1er-semestre.pdf` (+ `-corrige`)
   - Concours : `...-concours-general.pdf`, `...-concours-esp.pdf` (+ `-corrige`)
   - Format : `<classe>-<serie>-<matiere>-...` avec classe = seconde, premiere-s1, premiere-s2, terminale-s1, terminale-s2 et matiere = mathematiques, physique-chimie, svt, francais, histoire-geographie, anglais, philosophie.
   - Document commun à S1 et S2 : omettez la série (`terminale-physique-chimie-cours4.pdf`).
2. Lancez `npm run ressources` : les PDF sont envoyés dans Supabase et la liste `src/data/manifest.ts` est mise à jour.
3. Republiez le site (git push) pour que la nouvelle liste soit prise en compte.
