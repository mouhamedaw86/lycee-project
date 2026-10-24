// Serveur unique : sert le site (dossier dist/) + l'API de l'assistant IA, réservée aux élèves connectés.
import http from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const env = {};
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const get = (k, d = '') => process.env[k] || env[k] || d;
let KEY = get('ANTHROPIC_API_KEY');
let GKEY = get('GEMINI_API_KEY');
// Tolérance : une clé collée au mauvais endroit est reconnue à son préfixe (Anthropic = sk-ant-..., Google = AQ.… ou AIza…).
if (KEY && !KEY.startsWith('sk-ant-')) { if (!GKEY) GKEY = KEY; KEY = ''; }
if (GKEY.startsWith('sk-ant-')) { if (!KEY) KEY = GKEY; GKEY = ''; }
const MODEL = get('ANTHROPIC_MODEL', 'claude-sonnet-5-5');
const GMODEL = get('GEMINI_MODEL', 'gemini-flash-latest');
// Fournisseur IA : Anthropic (payant) ou Gemini (offre gratuite de Google AI Studio). AI_PROVIDER=gemini|anthropic force le choix.
const PROVIDER = get('AI_PROVIDER') || (KEY ? 'anthropic' : GKEY ? 'gemini' : '');
const READY = PROVIDER === 'gemini' ? Boolean(GKEY) : Boolean(KEY);
const SB_URL = get('VITE_SUPABASE_URL').replace(/\/$/, '');
const SB_KEY = get('VITE_SUPABASE_ANON_KEY');
const LIMIT = Number(get('AI_LIMIT_PER_HOUR', '30'));
const PORT = Number(get('PORT', '8787'));
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const SYSTEM = "Tu es l'assistant pédagogique d'un lycée sénégalais (programme officiel, classes de Seconde, Première et Terminale, séries S1 et S2). Réponds en français, avec clarté et bienveillance. Pour un support de cours : titres précédés de # et ##, objectifs, cours détaillé, exemples résolus, exercices d'application, résumé « À retenir ». Pour un exercice joint : corrige en détaillant chaque étape et explique les erreurs fréquentes. Pour un sujet ou un corrigé : donne un barème. FORMULES : écris toujours les formules en LaTeX entre $...$ (ou $$...$$ pour une ligne seule), avec des accolades pour les indices et exposants (ex. $x^{2}$, $u_{n+1}$, $\\frac{a}{b}$). CHIMIE : utilise \\ce{} ; exemples : $\\ce{C4H10}$, $\\ce{CH4 + 2O2 -> CO2 + 2H2O}$, formule générale $\\ce{C_{n}H_{2n+2}}$, formule semi-développée $\\ce{CH3-CH(CH3)-CH3}$. N'utilise JAMAIS de schémas en caractères ASCII ni de blocs de code pour dessiner des molécules ; décris-les avec \\ce{}. Unités : $12\\ \\text{g/mol}$. Utilise du Markdown (titres #, listes, tableaux). Si tu n'es pas sûr d'un point, dis-le.";
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.pdf': 'application/pdf', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };

// Convertit un message (format Anthropic) vers le format Gemini.
const toGemini = (m) => ({
  role: m.role === 'assistant' ? 'model' : 'user',
  parts: typeof m.content === 'string' ? [{ text: m.content }] : (m.content || []).map((b) => (b.type === 'text' ? { text: b.text } : { inlineData: { mimeType: b.source.media_type, data: b.source.data } })),
});

const send = (res, code, obj) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };

// Vérifie la session Supabase de l'élève (évite qu'un inconnu utilise votre clé IA).
async function userId(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || !SB_URL) return null;
  try { const r = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_KEY, authorization: `Bearer ${token}` } }); return r.ok ? (await r.json()).id : null; } catch { return null; }
}
const hits = new Map();
function allowed(id) {
  const now = Date.now(); const list = (hits.get(id) || []).filter((t) => now - t < 3600e3);
  if (list.length >= LIMIT) return false;
  list.push(now); hits.set(id, list); return true;
}

// Mode local : sert les PDF du dossier ressources/ (utile avant la mise en place de Supabase Storage).
const RES_DIR = fileURLToPath(new URL('../ressources/', import.meta.url));
function serveLocalPdf(req, res) {
  const name = decodeURIComponent((req.url || '').split('?')[0].replace(/^\/ressources\//, ''));
  const file = join(RES_DIR, name);
  if (!/^[a-z0-9\-]+\.pdf$/i.test(name) || !file.startsWith(RES_DIR) || !existsSync(file)) return send(res, 404, { error: 'Document introuvable' });
  res.writeHead(200, { 'content-type': 'application/pdf', 'cache-control': 'no-cache' });
  if (req.method === 'HEAD') return res.end();
  createReadStream(file).pipe(res);
}

function serveStatic(req, res) {
  if (!existsSync(DIST)) return send(res, 404, { error: 'Site non compilé : lance « npm run build ».' });
  const rel = normalize(decodeURIComponent((req.url || '/').split('?')[0])).replace(/^([/\\]*\.\.)+/, '');
  let file = join(DIST, rel);
  if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html');
  const immutable = /[/\\]assets[/\\]/.test(file);
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream', 'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache' });
  createReadStream(file).pipe(res);
}

http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/api/health') return send(res, 200, { ok: true, ai: READY, provider: PROVIDER });
  if (req.url === '/api/assistant') {
    if (req.method !== 'POST') return send(res, 405, { error: 'Méthode non autorisée' });
    if (!READY) return send(res, 503, { error: 'Aucune clé IA : colle ta clé après GEMINI_API_KEY= (gratuit) ou ANTHROPIC_API_KEY= dans le fichier .env, enregistre, puis relance LANCER.bat.' });
    const id = await userId(req);
    if (!id) return send(res, 401, { error: 'Connecte-toi pour utiliser l’assistant.' });
    if (!allowed(id)) return send(res, 429, { error: `Limite atteinte (${LIMIT} demandes par heure). Réessaie plus tard.` });
    try {
      const chunks = []; let size = 0;
      for await (const c of req) { size += c.length; if (size > 25e6) return send(res, 413, { error: 'Fichier trop volumineux.' }); chunks.push(c); }
      const { messages } = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      const list = (messages || []).slice(-12);
      if (PROVIDER === 'gemini') {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GMODEL}:generateContent`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-goog-api-key': GKEY },
          body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM }] }, contents: list.map(toGemini), generationConfig: { maxOutputTokens: 4000 } }),
        });
        const data = await r.json();
        if (!r.ok) return send(res, r.status === 429 ? 429 : 502, { error: r.status === 429 ? 'Limite gratuite de l’IA atteinte pour le moment : réessaie dans une minute.' : data?.error?.message || 'Erreur du service IA.' });
        const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
        return send(res, 200, { reply: text || 'Je n’ai pas pu répondre à cette demande. Reformule-la.' });
      }
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: MODEL, max_tokens: 4000, system: SYSTEM, messages: list }),
      });
      const data = await r.json();
      if (!r.ok) return send(res, 502, { error: data?.error?.message || 'Erreur du service IA.' });
      return send(res, 200, { reply: (data.content || []).map((c) => c.text || '').join('') });
    } catch (e) { return send(res, 500, { error: String(e) }); }
  }
  if ((req.method === 'GET' || req.method === 'HEAD') && (req.url || '').startsWith('/ressources/')) return serveLocalPdf(req, res);
  if (req.method === 'GET' || req.method === 'HEAD') return serveStatic(req, res);
  send(res, 404, { error: 'Introuvable' });
}).listen(PORT, () => console.log(`Serveur prêt : http://localhost:${PORT} ${READY ? `(IA : ${PROVIDER})` : '(CLÉ IA MANQUANTE)'}`));
