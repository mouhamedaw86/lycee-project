import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, BookOpen, BrainCircuit, CalendarDays, GraduationCap, LayoutDashboard, LibraryBig, LogOut, MessageCircle, Moon, Send, Sun, Trophy } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useLocal, useRemote } from '@/lib/storage';
import { FILES, classes } from '@/data/catalog';
import { Catalog } from '@/components/Catalog';
import { Schedule } from '@/components/Schedule';
import { AuthScreen } from '@/components/Auth';
import { DOCS } from '@/data/docs';
import { PrintRoot } from '@/components/PrintRoot';
import { Assistant, AskPrompt } from '@/components/Assistant';

type Post = { id: string; title: string; body: string; subject: string; created_at: string };
const NAV = [
  { label: 'Vue d’ensemble', icon: LayoutDashboard }, { label: 'Mes cours', icon: BookOpen }, { label: 'Ressources', icon: LibraryBig },
  { label: 'Emploi du temps', icon: CalendarDays }, { label: 'Assistant IA', icon: BrainCircuit }, { label: 'Espace entraide', icon: MessageCircle },
];
const SHORT: Record<string, string> = { 'Vue d’ensemble': 'Accueil', 'Mes cours': 'Cours', 'Ressources': 'Ressources', 'Emploi du temps': 'Planning', 'Assistant IA': 'Assistant', 'Espace entraide': 'Entraide' };
const TOTAL = classes.reduce((n, c) => n + c.subjects.reduce((m, s) => m + s.chapters.length, 0), 0);

function Workspace({ session }: { session: Session }) {
  const [nav, setNav] = useState('Vue d’ensemble');
  const [ask, setAsk] = useState<AskPrompt>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const uid = session.user.id;
  const [theme, setTheme] = useLocal<'light' | 'dark'>('theme', 'light');
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  const [done, setDone] = useRemote<string[]>(uid, 'done', []);

  useEffect(() => {
    if (!session) return;
    supabase.from('discussion_posts').select('id,title,body,subject,created_at').order('created_at', { ascending: false }).limit(20).then(({ data }) => setPosts(data ?? []));
  }, [session]);

  const toggleDone = (id: string) => setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  const askAssistant = (text: string, fileUrl?: string) => { setAsk({ text, n: Date.now(), fileUrl }); setNav('Assistant IA'); };
  const submitPost = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const { data, error } = await supabase.from('discussion_posts').insert({ title: title.trim(), body: body.trim() }).select('id,title,body,subject,created_at').maybeSingle();
    if (!error && data) { setPosts((p) => [data, ...p]); setTitle(''); setBody(''); setShowForm(false); }
  };

  const name = session?.user.user_metadata.full_name?.split(' ')[0] || session?.user.email?.split('@')[0] || 'élève';
  const level = (session?.user.user_metadata.class_level as string | undefined) ?? '';
  const percent = useMemo(() => Math.round((done.length / TOTAL) * 100), [done]);
  useEffect(() => { document.title = `${nav} — Lycée Elhadji Baba Ndiongue`; }, [nav]);


  return (
    <><PrintRoot />
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><GraduationCap size={25} /></div><div><strong>ELHADJI BABA</strong><span>NDIONGUE</span></div></div>
        <nav className="main-nav"><p className="nav-caption">Mon espace</p>
          {NAV.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${nav === label ? 'active' : ''}`} onClick={() => setNav(label)}><Icon size={19} /><span className="nav-full">{label}</span><span className="nav-short">{SHORT[label]}</span></button>)}
        </nav>
        <div className="nav-divider" /><p className="nav-caption">Ma progression</p>
        <div className="progress-card"><div className="progress-top"><span>Cours terminés</span><strong>{percent}%</strong></div><div className="progress-track"><span style={{ width: `${percent}%` }} /></div><p>{done.length} sur {TOTAL} cours.</p></div>
        <div className="sidebar-bottom"><div className="profile-mini"><div className="avatar">{name.slice(0, 2).toUpperCase()}</div><div><strong>{name}</strong><span>Élève connecté</span></div>
          <button className="logout-button" onClick={() => supabase.auth.signOut()} aria-label="Se déconnecter"><LogOut size={16} /></button></div></div>
      </aside>
      <main className="main-content">
        <header className="topbar"><div className="breadcrumbs"><span>Mon espace</span><span className="slash">/</span><strong>{nav}</strong></div><div className="top-actions">{level && <span className="level-tag">{level}</span>}<button className="icon-button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Changer de thème">{theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}</button><div className="top-avatar">{name.slice(0, 2).toUpperCase()}</div><button className="icon-button" onClick={() => supabase.auth.signOut()} aria-label="Se déconnecter"><LogOut size={19} /></button></div></header>
        <div className="page-content">
          {nav === 'Vue d’ensemble' && <>
            <section className="welcome-row"><div><p className="eyebrow">ESPACE ÉLÈVE</p><h1>Bonjour {name}, <em>prêt à apprendre ?</em></h1><p className="welcome-copy">Choisis ta classe, étudie tes cours, entraîne-toi avec les TD et prépare tes examens.</p></div></section>
            <section className="stats-grid"><div className="stat-card"><div className="stat-icon green-bg"><Trophy size={20} /></div><div><span>Cours terminés</span><strong>{done.length} <small>/ {TOTAL}</small></strong></div></div><div className="stat-card"><div className="stat-icon blue-bg"><BookOpen size={20} /></div><div><span>Cours rédigés en entier</span><strong>{Object.keys(DOCS).filter((k) => k.includes('-cours')).length} <small>avec TD et corrigés</small></strong></div></div><div className="stat-card"><div className="stat-icon orange-bg"><LibraryBig size={20} /></div><div><span>Documents disponibles</span><strong>{Object.keys(FILES).length + Object.keys(DOCS).length} <small>PDF et cours</small></strong></div></div></section>
            <section className="pick-grid">{NAV.slice(1).map(({ label, icon: Icon }) => <button key={label} className="resource-card pick" onClick={() => setNav(label)}><Icon size={26} /><h4>{label}</h4><span>Ouvrir <ArrowUpRight size={13} /></span></button>)}</section>
          </>}
          {nav === 'Mes cours' && <Catalog defaultClass={level} mode="cours" done={done} toggleDone={toggleDone} onAsk={askAssistant} />}
          {nav === 'Ressources' && <Catalog defaultClass={level} mode="ressources" done={done} toggleDone={toggleDone} onAsk={askAssistant} />}
          {nav === 'Emploi du temps' && <Schedule uid={uid} />}
          <div style={{ display: nav === 'Assistant IA' ? 'block' : 'none' }}><Assistant prompt={ask} /></div>
          {nav === 'Espace entraide' && <section className="feature-panel">
            <div className="section-heading"><div><p className="eyebrow">COMMUNAUTÉ DU LYCÉE</p><h3>Questions et entraide</h3></div><button className="primary-small" onClick={() => setShowForm(!showForm)}><MessageCircle size={15} /> Poser une question</button></div>
            {showForm && <form className="post-form" onSubmit={submitPost}><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de ta question" required /><textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Explique ce qui te bloque..." required /><button className="primary-small" type="submit"><Send size={14} /> Publier</button></form>}
            <div className="post-list">{posts.length ? posts.map((p) => <article className="post-item" key={p.id}><div className="post-avatar">{p.title.slice(0, 1).toUpperCase()}</div><div><strong>{p.title}</strong><p>{p.body}</p><span>{new Date(p.created_at).toLocaleDateString('fr-FR')} • {p.subject}</span></div></article>) : <div className="empty-state">Aucune question pour le moment.</div>}</div>
          </section>}
        </div>
      </main>
    </div></>
  );
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, []);
  if (loading) return <div className="loading-screen"><div className="brand-mark"><GraduationCap size={25} /></div><p>Préparation de ton espace...</p></div>;
  return session ? <Workspace key={session.user.id} session={session} /> : <AuthScreen />;
}

export default App;
