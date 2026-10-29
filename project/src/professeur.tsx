import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Session } from '@supabase/supabase-js';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SetupScreen } from '@/components/SetupScreen';
import { AuthScreen } from '@/components/Auth';
import { TeacherPortal } from '@/components/TeacherPortal';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import './index.css';
import './theme.css';

// Page indépendante « Espace professeur » : son propre écran de connexion, son propre lien (/professeur).
function TeacherApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, []);
  if (loading) return <div className="loading-screen"><p>Chargement de l’espace professeur…</p></div>;
  return session ? <TeacherPortal key={session.user.id} /> : <AuthScreen teacher />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><ErrorBoundary>{isSupabaseConfigured ? <TeacherApp /> : <SetupScreen />}</ErrorBoundary></StrictMode>,
);
