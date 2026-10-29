// « npm run ressources » : envoie les PDF du dossier ressources/ dans Supabase Storage (bucket privé « ressources »)
// et régénère la liste src/data/manifest.ts. Nécessite SUPABASE_SERVICE_ROLE_KEY dans .env (clé SECRÈTE, jamais dans le site).
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const env = {};
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const get = (k) => process.env[k] || env[k] || '';
const url = get('VITE_SUPABASE_URL');
const key = get('SUPABASE_SERVICE_ROLE_KEY');
const BUCKET = 'ressources';
const DIR = 'ressources';

if (!existsSync(DIR)) { console.error(`Dossier « ${DIR} » introuvable : placez-y vos PDF.`); process.exit(1); }
const files = readdirSync(DIR).filter((f) => /\.pdf$/i.test(f)).sort();

// 1) Liste des documents disponibles (toujours régénérée)
writeFileSync('src/data/manifest.ts',
  "// Généré par « npm run ressources » : liste des documents envoyés dans Supabase Storage.\nexport const MANIFEST: string[] = [\n" +
  files.map((f) => `  '${f.replace(/\.pdf$/i, '')}',\n`).join('') + '];\n');
console.log(`${files.length} documents listés dans src/data/manifest.ts`);

if (!url || !key) {
  console.error('\nIl manque VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY dans le fichier .env : envoi impossible.');
  console.error('La clé « service_role » se trouve dans Supabase > Project Settings > API (clé secrète).');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });
const { data: bucket } = await sb.storage.getBucket(BUCKET);
if (!bucket) {
  const { error } = await sb.storage.createBucket(BUCKET, { public: false });
  if (error) { console.error('Création du bucket impossible :', error.message); process.exit(1); }
  console.log('Bucket privé « ressources » créé.');
}

// Fichiers déjà présents (on saute ceux de même taille)
const existing = new Map();
for (let offset = 0; ; offset += 1000) {
  const { data } = await sb.storage.from(BUCKET).list('', { limit: 1000, offset });
  if (!data?.length) break;
  data.forEach((o) => existing.set(o.name, o.metadata?.size));
  if (data.length < 1000) break;
}

let sent = 0, skipped = 0, failed = 0;
for (const f of files) {
  const path = join(DIR, f);
  if (existing.get(f) === statSync(path).size) { skipped++; continue; }
  const { error } = await sb.storage.from(BUCKET).upload(f, readFileSync(path), { contentType: 'application/pdf', upsert: true });
  if (error) { failed++; console.error(`ÉCHEC ${f} : ${error.message}`); } else { sent++; console.log(`envoyé ${f}`); }
}
console.log(`\nTerminé : ${sent} envoyés, ${skipped} déjà à jour, ${failed} échecs.`);
if (failed) process.exit(1);
