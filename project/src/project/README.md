# Plateforme éducative — Lycée Elhadji Baba Ndiongue

## Lancer le projet
1. Installe **Node.js (version LTS)** : https://nodejs.org
2. Décompresse le projet (ne lance pas depuis l'intérieur du .zip).
3. Vérifie que le fichier **.env** est présent (voir `.env.example`). Il est parfois masqué : active « Afficher les fichiers cachés ».
4. **Windows** : double-clique sur `LANCER.bat`. **Mac/Linux** : `sh lancer.sh`.
   Ou manuellement dans un terminal ouvert dans le dossier : `npm install` puis `npm run dev`.
5. Ouvre http://localhost:5173

## Commandes
- `npm run dev` : développement · `npm run build` : version de production · `npm run typecheck` : vérification TypeScript

## Assistant IA (optionnel)
Déployer la fonction : `supabase functions deploy assistant` puis `supabase secrets set ANTHROPIC_API_KEY=ta_cle`. Sans cela, l'assistant affiche un message d'indisponibilité.

## Contenu
- Classes, matières et chapitres : `src/data/catalog.ts`.
- Documents PDF : dossier `ressources/` + `npm run ressources` (voir `DEPLOIEMENT.md` et `CONFIGURATION.md`).
- Mise en ligne : `DEPLOIEMENT.md` · Configuration Supabase : `CONFIGURATION.md`.

## TD de Physique-Chimie (Terminale S1, 2024-2025)
14 séries (énoncés PDF) sont dans `src/ressources/`. Le bouton « Corrigé » envoie le PDF correspondant à l'assistant, qui rédige le corrigé.
