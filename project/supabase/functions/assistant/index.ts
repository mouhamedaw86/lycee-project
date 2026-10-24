// Edge Function Supabase : assistant pédagogique (clé API gardée côté serveur).
// Déploiement : supabase functions deploy assistant && supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'content-type': 'application/json' } });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { messages } = await req.json();
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-5-5',
        max_tokens: 4000,
        system: "Tu es l'assistant pédagogique d'un lycée sénégalais. Réponds en français, de façon claire, courte et bienveillante. Tu conçois des supports de cours structurés (titres précédés de #, objectifs, cours, exemples, exercices, résumé), tu corriges les exercices joints en détaillant chaque étape, et tu expliques les notions simplement. Écris les formules en texte clair.",
        messages: (messages ?? []).slice(-12),
      }),
    });
    const data = await res.json();
    if (!res.ok) return json({ error: data?.error?.message ?? 'Erreur API' }, 500);
    return json({ reply: (data.content ?? []).map((c: { text?: string }) => c.text ?? '').join('') });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
