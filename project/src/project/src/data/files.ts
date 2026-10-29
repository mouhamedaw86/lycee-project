import { MANIFEST } from './manifest';

// Les PDF ne sont plus dans le site : ils sont dans Supabase Storage (bucket privé « ressources »).
// FILES associe l'identifiant d'un document à son chemin de stockage ; le lien est demandé à l'ouverture (voir lib/documents.ts).
export const FILES: Record<string, string> = Object.fromEntries(MANIFEST.map((id) => [id, `${id}.pdf`]));

// Un fichier sans série (ex. terminale-physique-chimie-cours4) est partagé par S1 et S2 (ex. terminale-s1-... et terminale-s2-...).
for (const key of Object.keys(FILES)) {
  const m = key.match(/^(premiere|terminale)-(?!s[12]-)(.*)$/);
  if (!m) continue;
  for (const s of ['s1', 's2']) FILES[`${m[1]}-${s}-${m[2]}`] ??= FILES[key];
}

// Un même PDF couvrant deux chapitres (ex. « Séries 2 et 3 ») est rattaché aux deux sans être dupliqué.
const ALIAS: Record<string, string> = {
  // Le TD de barycentres de 1S1 contient ses corrigés : le bouton « Corrigé » ouvre le même document.
  'premiere-s1-mathematiques-td9-corrige': 'premiere-s1-mathematiques-td9',
  'premiere-s1-physique-chimie-td7': 'premiere-s1-physique-chimie-td6',
  'premiere-s2-physique-chimie-td7': 'premiere-s2-physique-chimie-td6',
  'seconde-physique-chimie-td8': 'seconde-physique-chimie-td7',
  'terminale-s2-physique-chimie-td14': 'terminale-s2-physique-chimie-td13',
  'terminale-s2-physique-chimie-td21': 'terminale-s2-physique-chimie-td22',
};
for (const [id, target] of Object.entries(ALIAS)) if (FILES[target]) FILES[id] ??= FILES[target];
