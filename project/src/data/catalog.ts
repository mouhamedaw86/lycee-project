export type Subject = { id: string; name: string; chapters: string[] };
export type ClassLevel = { id: string; name: string; subjects: Subject[] };
export type Resource = { id: string; group: 'TD' | 'Évaluations' | 'Concours'; title: string; ctx: string };

export const slug = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Les PDF déposés dans src/ressources/ sont reconnus automatiquement (voir files.ts) : aucun code à modifier.
 * Le NOM du fichier est l'identifiant du document, par exemple terminale-s1-physique-chimie-td4.pdf
 */
export { FILES } from './files';

const seconde = {
  'Mathématiques': 'Ensembles et nombres|Fonctions de référence|Équations et inéquations|Géométrie vectorielle',
  'Physique-Chimie': '1:Mélanges et corps purs|2:Atomes, éléments et classification périodique|3:Liaisons chimiques|4:Mole et grandeurs molaires|5:Réaction chimique et équation-bilan|6:Généralités sur le mouvement|7:Généralités sur les forces|8:La masse, le poids, relation poids et masse|9:Équilibre d’un solide soumis à des forces non parallèles|10:Équilibre d’un solide mobile autour d’un axe fixe|11:Phénomène d’électrisation|12:Généralités sur le courant électrique|13:Intensité du courant électrique|14:Tension électrique|15:Dipôles passifs|16:Dipôles actifs|17:Amplificateur opérationnel|18:Propagation rectiligne de la lumière',
  'SVT': 'La cellule|Nutrition et digestion|Reproduction|Écosystèmes',
  'Français': 'Le récit|Le théâtre|La poésie|Argumenter',
  'Histoire-Géographie': 'Les civilisations antiques|L’Afrique précoloniale|Population et peuplement|Le climat',
  'Anglais': 'Tenses review|Reported speech|Reading comprehension|Essay writing',
};
const premiere = {
  'Mathématiques': 'Second degré|Dérivation|Suites numériques|Produit scalaire',
  'Physique-Chimie': '1:Généralités sur la chimie organique|2:Les alcanes|3:Hydrocarbures insaturés : alcènes et alcynes|4:Hydrocarbures aromatiques : le benzène|5:Les composés oxygénés|6:Couple oxydant/réducteur : ion métallique/métal|7:Classification qualitative des couples redox|8:Classification quantitative des couples redox|9:Oxydoréduction en solution aqueuse et dosage redox|10:Électrolyse et bilan quantitatif|11:Oxydoréduction par voie sèche et corrosion|12:Travail et puissance d’une force|13:Énergie cinétique|14:Énergie mécanique totale|15:Calorimétrie|16:Force et champ électrostatiques|17:Travail de la force électrostatique|18:Énergie électrique dans un circuit électrique|19:Condensateurs|20:Amplificateur opérationnel|21:Propagation des signaux, ondes, interférences mécaniques',
  'SVT': 'Génétique|Immunologie|Géologie|Physiologie nerveuse',
  'Français': 'Le roman|Le théâtre classique|Le commentaire composé|La dissertation',
  'Histoire-Géographie': 'Les Lumières et révolutions|La traite négrière|Mondialisation|Urbanisation',
  'Anglais': 'Conditionals|Passive voice|Literature|Argumentative writing',
};
const terminale = {
  'Mathématiques': 'Limites et continuité|Primitives et intégrales|Nombres complexes|Probabilités et dénombrement',
  'Physique-Chimie': 'Mécanique du point|Électromagnétisme|Oscillations|Cinétique chimique',
  'SVT': 'Génétique et hérédité|Évolution|Métabolisme|Reproduction humaine',
  'Philosophie': 'La conscience|La liberté|La vérité|L’État et la justice',
  'Histoire-Géographie': 'Décolonisation|Guerre froide|Intégration africaine|Développement durable',
  'Anglais': 'Advanced grammar|Text analysis|Debate|Essay writing',
};

// Programme de Physique-Chimie de Terminale (identique en S1 et S2). Les numéros suivent les séries de TD d'origine ; 16 et plus = chapitres sans série de TD.
// Mathématiques de Seconde et de Première (chapitres d'après les séries de TD fournies) et de Terminale.
const MATHS_SECONDE = '1:Calcul dans IR|2:Intervalles et calcul approché|3:Polynômes et fractions rationnelles|4:Équations, inéquations et systèmes|5:Équations et inéquations du second degré|6:Fonctions numériques|7:Repérage du plan|8:Vecteurs du plan|9:Produit scalaire|10:Transformations|11:Géométrie dans l’espace';
const MATHS_1S1 = '1:Polynômes|2:Équations, inéquations et systèmes|3:Généralités sur les fonctions numériques|4:Limite et continuité|5:Suites numériques|6:Primitives|7:Trigonométrie|8:Compléments sur le calcul vectoriel|9:Barycentres|10:Produit scalaire et lignes de niveau|11:Transformations ponctuelles et isométries|12:Géométrie dans l’espace';
const MATHS_1S2 = '1:Polynômes|2:Équations, inéquations et systèmes|3:Généralités sur les fonctions|4:Étude de fonctions|5:Limites et continuité|6:Suites numériques|7:Trigonométrie|8:Barycentres|9:Produit scalaire|10:Outil des transformations';
// Mathématiques de Terminale : programmes différents en S1 et en S2 (numéros = ordre du cours).
const MATHS_TS1 = '1:Fonctions numériques|2:Suites numériques|3:Fonction logarithme népérien|4:Fonction exponentielle|5:Intégrale d’une fonction continue|6:Équations différentielles|7:Courbes paramétrées|8:Nombres complexes|9:Arithmétique|10:Algèbre linéaire|11:Angles orientés|12:Transformations planes|13:Isométries du plan|14:Homothéties|15:Statistique|16:Dénombrements|17:Probabilités|18:Barycentres|19:Coniques|20:Calcul vectoriel et géométrie de l’espace|21:Similitudes|22:Transformations de l’espace';
const MATHS_TS2 = '1:Trigonométrie|2:Nombres complexes|3:Calcul de limites et continuité|4:Dérivation et notion de primitives|5:Fonctions logarithme népérien et exponentielle|6:Calcul intégral et équations différentielles|7:Suites numériques|8:Courbes paramétrées du plan|9:Probabilités|10:Statistiques à deux variables|11:Géométrie dans l’espace|12:Le Résoutout : questions types de cours|13:Problèmes classiques résolus';
const PC_TERMINALE = '1:Les alcools|2:Les amines|3:Acides carboxyliques et dérivés|16:Cinétique chimique|17:pH d’une solution aqueuse, autoprotolyse de l’eau|18:Acide fort, base forte et dosage|7:Acides et bases faibles : couples acide/base et constante d’acidité|19:Acide faible et base forte, effet tampon|9:Acides α-aminés|20:Cinématique du point|21:Bases de la dynamique|22:Applications des bases de la dynamique|4:Gravitation universelle|11:Oscillations mécaniques libres|5:Champs magnétiques : généralités et champs des courants|6:Mouvement d’une particule chargée dans un champ magnétique uniforme|23:Loi de Laplace|8:Induction électromagnétique et dipôle (R, L)|24:Condensateur et dipôle RC|10:Oscillations électriques libres et forcées|12:Interférences lumineuses|13:Effet photoélectrique|14:Niveaux d’énergie de l’atome|15:Réactions nucléaires';

// Chaque série (S1, S2) a ses propres chapitres et ses propres documents.
const raw: Record<string, Record<string, string>> = {
  Seconde: { ...seconde, 'Mathématiques': MATHS_SECONDE },
  'Première S1': { ...premiere, 'Mathématiques': MATHS_1S1 },
  'Première S2': { ...premiere, 'Mathématiques': MATHS_1S2 },
  'Terminale S1': { ...terminale, 'Mathématiques': MATHS_TS1, 'Physique-Chimie': PC_TERMINALE },
  'Terminale S2': { ...terminale, 'Mathématiques': MATHS_TS2, 'Physique-Chimie': PC_TERMINALE },
};

export const classes: ClassLevel[] = Object.entries(raw).map(([cname, subs]) => ({
  id: slug(cname), name: cname,
  subjects: Object.entries(subs).map(([sname, ch]) => ({ id: slug(sname), name: sname, chapters: ch.split('|') })),
}));

const concours: Record<string, string[]> = {
  seconde: ['Concours général'],
  premiere: ['Concours général', 'Concours Prytanée militaire'],
  terminale: ['Concours général', 'Concours ESP', 'Concours ENSA', 'Concours FASTEF'],
};

// Un chapitre peut porter un numéro explicite ("4:Titre") pour rester aligné avec les séries de TD d'origine.
export const chapterInfo = (s: Subject, i: number) => { const m = s.chapters[i].match(/^(\d+):(.*)$/); return m ? { n: +m[1], title: m[2] } : { n: i + 1, title: s.chapters[i] }; };
export const courseId = (c: ClassLevel, s: Subject, i: number) => `${c.id}-${s.id}-cours${chapterInfo(s, i).n}`;

export function resourcesFor(c: ClassLevel, s: Subject): Resource[] {
  const base = `${s.name} — ${c.name}`;
  const out: Resource[] = s.chapters.map((_, i) => { const { n, title } = chapterInfo(s, i); return { id: `${c.id}-${s.id}-td${n}`, group: 'TD' as const, title: `TD n°${n} : ${title}`, ctx: `TD sur « ${title} » (${base})` }; });
  ['Devoir surveillé n°1', 'Devoir surveillé n°2', 'Composition du 1er semestre', 'Composition du 2e semestre'].forEach((e) =>
    out.push({ id: `${c.id}-${s.id}-${slug(e)}`, group: 'Évaluations', title: e, ctx: `${e} (${base})` }));
  (concours[c.id.split('-')[0]] ?? []).forEach((k) => out.push({ id: `${c.id}-${s.id}-${slug(k)}`, group: 'Concours', title: `Épreuve — ${k}`, ctx: `épreuve type du ${k} (${base})` }));
  return out;
}
