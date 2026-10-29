// Contenus complets (cours, TD et corrigés). Format : "# titre", "## section", "- puce", texte.
export type DocItem = { title: string; body: string };

export const DOCS: Record<string, DocItem> = {
  'seconde-mathematiques-cours3': { title: 'Équations et inéquations — Seconde', body: `# Équations et inéquations
## 1. Équations du premier degré
Une équation ax + b = 0 avec a ≠ 0 admet une unique solution : x = -b/a.
Si a = 0 : aucune solution quand b ≠ 0, et tous les réels sont solutions quand b = 0.
Exemple : 3x - 6 = 0 donne 3x = 6, donc x = 2.
## 2. Équation produit
Un produit de facteurs est nul si et seulement si l'un des facteurs est nul : A(x) × B(x) = 0 équivaut à A(x) = 0 ou B(x) = 0.
Exemple : (x - 1)(2x + 4) = 0 donne x = 1 ou x = -2.
## 3. Inéquations du premier degré
- On peut ajouter ou soustraire un même nombre aux deux membres.
- On peut multiplier ou diviser par un nombre strictement positif sans changer le sens.
- Si on multiplie ou divise par un nombre strictement négatif, le sens de l'inégalité change.
Exemple : -2x + 4 > 0 équivaut à -2x > -4, donc x < 2. Ensemble des solutions : ]-∞ ; 2[.
## 4. Tableau de signes
Pour résoudre (x - 1)(2x + 4) ≥ 0, on étudie le signe de chaque facteur : x - 1 s'annule en 1 et 2x + 4 s'annule en -2.
Le produit est positif ou nul à l'extérieur des racines : S = ]-∞ ; -2] ou [1 ; +∞[.
## À retenir
- Équation produit : on annule chaque facteur.
- Inéquation : attention au changement de sens quand on multiplie par un nombre négatif.
- Un tableau de signes permet de résoudre produits et quotients.` },
  'seconde-mathematiques-td3': { title: 'TD 3 — Équations et inéquations (énoncé)', body: `# TD 3 : Équations et inéquations
## Exercice 1
Résoudre dans l'ensemble des réels :
- a) 5x - 7 = 3x + 1
- b) (x + 3)(4x - 8) = 0
- c) 2x - 5 < 7 - x
## Exercice 2
Résoudre l'inéquation (x - 2)(x + 5) > 0 à l'aide d'un tableau de signes.
## Exercice 3 (problème)
Un taxi facture une prise en charge de 500 F plus 300 F par kilomètre. Awa dispose de 3 200 F. Jusqu'à combien de kilomètres peut-elle aller ?` },
  'seconde-mathematiques-td3-corrige': { title: 'TD 3 — Équations et inéquations (corrigé)', body: `# Corrigé du TD 3
## Exercice 1
- a) 5x - 3x = 1 + 7, donc 2x = 8 et x = 4.
- b) x + 3 = 0 donne x = -3 ; 4x - 8 = 0 donne x = 2. Solutions : -3 et 2.
- c) 2x + x < 7 + 5, donc 3x < 12 et x < 4. S = ]-∞ ; 4[.
## Exercice 2
Les facteurs s'annulent en 2 et en -5. Le produit est positif à l'extérieur des racines : x < -5 ou x > 2.
## Exercice 3
Le prix pour x km est 500 + 300x. On veut 500 + 300x ≤ 3 200, donc 300x ≤ 2 700 et x ≤ 9.
Awa peut parcourir 9 km au maximum.` },

  'premiere-mathematiques-cours1': { title: 'Le second degré — Première', body: `# Le second degré
## 1. Trinôme et discriminant
Un trinôme du second degré est f(x) = ax² + bx + c avec a ≠ 0. Son discriminant est Δ = b² - 4ac.
## 2. Résolution de ax² + bx + c = 0
- Si Δ > 0 : deux solutions x1 = (-b - √Δ)/(2a) et x2 = (-b + √Δ)/(2a).
- Si Δ = 0 : une solution double x0 = -b/(2a).
- Si Δ < 0 : aucune solution réelle.
Exemple : x² - 5x + 6 = 0. Δ = 25 - 24 = 1, donc x = (5 - 1)/2 = 2 ou x = (5 + 1)/2 = 3.
## 3. Signe du trinôme
- Si Δ > 0 : du signe de a à l'extérieur des racines, du signe contraire entre les racines.
- Si Δ = 0 : du signe de a, et nul en x0.
- Si Δ < 0 : du signe de a pour tout réel x.
## 4. Somme et produit des racines
Si Δ ≥ 0 : x1 + x2 = -b/a et x1 × x2 = c/a.
## 5. Forme canonique
f(x) = a(x - α)² + β avec α = -b/(2a) et β = f(α) = -Δ/(4a).
## À retenir
- Calculer Δ en premier.
- Le signe de a donne l'allure de la parabole (ouverte vers le haut si a > 0).
- Somme et produit permettent de vérifier ses racines.` },
  'premiere-mathematiques-td1': { title: 'TD 1 — Le second degré (énoncé)', body: `# TD 1 : Le second degré
## Exercice 1
Résoudre dans les réels :
- a) x² - 5x + 6 = 0
- b) 2x² + 3x + 5 = 0
- c) 4x² - 12x + 9 = 0
## Exercice 2
Résoudre l'inéquation x² - x - 6 ≤ 0.
## Exercice 3
Déterminer les valeurs de m pour que x² - 2x + m = 0 admette deux solutions distinctes.
## Exercice 4 (problème)
Un champ rectangulaire a un périmètre de 40 m et une aire de 96 m². Trouver ses dimensions.` },
  'premiere-mathematiques-td1-corrige': { title: 'TD 1 — Le second degré (corrigé)', body: `# Corrigé du TD 1
## Exercice 1
- a) Δ = 25 - 24 = 1 > 0. x = (5 - 1)/2 = 2 ou x = (5 + 1)/2 = 3.
- b) Δ = 9 - 40 = -31 < 0. Aucune solution réelle.
- c) Δ = 144 - 144 = 0. Solution double x = 12/8 = 3/2.
## Exercice 2
Δ = 1 + 24 = 25. Racines : (1 - 5)/2 = -2 et (1 + 5)/2 = 3. Comme a = 1 > 0, le trinôme est négatif entre les racines : S = [-2 ; 3].
## Exercice 3
Δ = 4 - 4m. Deux solutions distinctes si Δ > 0, c'est-à-dire m < 1.
## Exercice 4
Le demi-périmètre vaut 20 : L + l = 20 et L × l = 96. L et l sont solutions de x² - 20x + 96 = 0.
Δ = 400 - 384 = 16, donc x = (20 - 4)/2 = 8 ou x = (20 + 4)/2 = 12.
Le champ mesure 12 m sur 8 m.` },

  'terminale-mathematiques-cours1': { title: 'Limites et continuité — Terminale', body: `# Limites et continuité
## 1. Limites usuelles
- En +∞ : 1/xⁿ tend vers 0 (n ≥ 1) et √x tend vers +∞.
- En 0 : 1/x tend vers +∞ quand x tend vers 0 par valeurs positives, et vers -∞ par valeurs négatives.
## 2. Opérations sur les limites
Somme, produit et quotient se calculent à partir des limites de chaque fonction. Les formes indéterminées sont : ∞ - ∞, 0 × ∞, ∞/∞ et 0/0. Il faut alors transformer l'expression.
## 3. Limites en l'infini
- Un polynôme a la même limite que son terme de plus haut degré.
- Une fraction rationnelle a la même limite que le quotient de ses termes de plus haut degré.
Exemple : (3x² + x - 1)/(x² + 5) tend vers 3 en +∞.
## 4. Asymptotes
- Si f(x) tend vers l en +∞ ou -∞, la droite y = l est asymptote horizontale.
- Si f(x) tend vers +∞ ou -∞ quand x tend vers a, la droite x = a est asymptote verticale.
## 5. Continuité
f est continue en a si la limite de f(x) en a est f(a). Les polynômes, les fractions rationnelles (sur leur domaine) et la racine carrée sont continus.
## 6. Théorème des valeurs intermédiaires
Si f est continue sur [a ; b] et k est compris entre f(a) et f(b), alors f(x) = k admet au moins une solution dans [a ; b]. Si f est de plus strictement monotone, cette solution est unique.
## À retenir
- Lever une forme indéterminée : factoriser, ou multiplier par la quantité conjuguée.
- Le TVI prouve l'existence d'une solution, la monotonie prouve son unicité.` },
  'terminale-mathematiques-td1': { title: 'TD 1 — Limites et continuité (énoncé)', body: `# TD 1 : Limites et continuité
## Exercice 1
Calculer les limites suivantes :
- a) limite en +∞ de 2x³ - 5x + 1
- b) limite en +∞ de (3x² + x - 1)/(x² + 5)
- c) limite en 2 par valeurs supérieures de 1/(x - 2)
- d) limite en +∞ de √(x + 1) - √x
## Exercice 2
Soit f(x) = (2x + 1)/(x - 3). Déterminer son ensemble de définition, ses limites aux bornes et ses asymptotes.
## Exercice 3
Montrer que l'équation x³ + x - 1 = 0 admet une unique solution dans [0 ; 1].` },
  'terminale-mathematiques-td1-corrige': { title: 'TD 1 — Limites et continuité (corrigé)', body: `# Corrigé du TD 1
## Exercice 1
- a) Terme de plus haut degré : 2x³, donc la limite est +∞.
- b) Quotient des termes de plus haut degré : 3x²/x² = 3. La limite est 3.
- c) Quand x tend vers 2 par valeurs supérieures, x - 2 tend vers 0 par valeurs positives. La limite est +∞.
- d) Forme indéterminée ∞ - ∞. En multipliant par la quantité conjuguée : √(x + 1) - √x = 1/(√(x + 1) + √x). Le dénominateur tend vers +∞, la limite est 0.
## Exercice 2
- Ensemble de définition : tous les réels sauf 3.
- En +∞ et en -∞ : f(x) tend vers 2. La droite y = 2 est asymptote horizontale.
- En 3 par valeurs supérieures : le numérateur tend vers 7 et le dénominateur vers 0 par valeurs positives, donc f tend vers +∞. Par valeurs inférieures, f tend vers -∞. La droite x = 3 est asymptote verticale.
## Exercice 3
Soit f(x) = x³ + x - 1. f est continue (polynôme). f'(x) = 3x² + 1 > 0, donc f est strictement croissante.
f(0) = -1 < 0 et f(1) = 1 > 0. D'après le théorème des valeurs intermédiaires (cas strictement monotone), l'équation f(x) = 0 admet une unique solution α dans [0 ; 1] (α vaut environ 0,68).` },
};

// Ces contenus de Maths valent pour les deux séries : on les déclare pour S1 et S2.
for (const k of Object.keys(DOCS)) {
  const m = k.match(/^(premiere|terminale)-(.*)$/);
  if (!m) continue;
  for (const s of ['s1', 's2']) DOCS[`${m[1]}-${s}-${m[2]}`] = DOCS[k];
  delete DOCS[k];
}

// Mes anciens contenus de Maths de Terminale (limites et continuité) : les vrais cours PDF les remplacent ;
// le TD et son corrigé restent, placés au bon chapitre (S1 : chapitre 1, S2 : chapitre 3).
delete DOCS['terminale-s1-mathematiques-cours1'];
delete DOCS['terminale-s2-mathematiques-cours1'];
for (const suffix of ['', '-corrige']) {
  DOCS[`terminale-s2-mathematiques-td3${suffix}`] = DOCS[`terminale-s2-mathematiques-td1${suffix}`];
  delete DOCS[`terminale-s2-mathematiques-td1${suffix}`];
}

// Maths : mes anciens contenus rangés au bon chapitre ; ceux qui doublonnent un vrai TD sont retirés.
const rekey = (from: string, to: string) => { if (DOCS[from]) { DOCS[to] = DOCS[from]; delete DOCS[from]; } };
rekey('seconde-mathematiques-cours3', 'seconde-mathematiques-cours4');
for (const k of ['seconde-mathematiques-td3', 'seconde-mathematiques-td3-corrige']) delete DOCS[k];
for (const s of ['s1', 's2']) {
  rekey(`premiere-${s}-mathematiques-cours1`, `premiere-${s}-mathematiques-cours2`);
  delete DOCS[`premiere-${s}-mathematiques-td1`];
  delete DOCS[`premiere-${s}-mathematiques-td1-corrige`];
}
for (const k of ['terminale-s1-mathematiques-td1', 'terminale-s1-mathematiques-td1-corrige']) delete DOCS[k];
