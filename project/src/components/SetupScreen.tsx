export function SetupScreen() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ maxWidth: 520, lineHeight: 1.6 }}>
        <h1>Configuration manquante</h1>
        <p>Le fichier <code>.env</code> est introuvable ou incomplet. À la racine du projet, crée-le (copie <code>.env.example</code>) avec :</p>
        <pre style={{ background: '#f3f4f6', padding: 12, borderRadius: 8, overflowX: 'auto' }}>{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=ta_cle_anon`}</pre>
        <p>Puis arrête le serveur (Ctrl + C) et relance <code>npm run dev</code>.</p>
      </section>
    </main>
  );
}
