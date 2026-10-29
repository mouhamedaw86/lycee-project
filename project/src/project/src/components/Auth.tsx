import { FormEvent, useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Brain, Eye, EyeOff, GraduationCap, KeyRound, Loader2, Lock, Mail, User, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { classes } from '@/data/catalog';

const QUOTES = ['Apprendre, c’est grandir un peu chaque jour.', 'La réussite appartient à ceux qui persévèrent.', 'Un bon élève pose des questions, un grand élève cherche les réponses.', 'Chaque exercice résolu te rapproche de ton objectif.'];
const TOTAL = classes.reduce((n, c) => n + c.subjects.reduce((m, s) => m + s.chapters.length, 0), 0);
const SUBJECTS = classes.reduce((n, c) => n + c.subjects.length, 0);

function useCount(to: number, ms = 1500) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => { const p = Math.min((t - t0) / ms, 1); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return v;
}

// Les boutons n'apparaissent que si le fournisseur est activé : VITE_OAUTH_PROVIDERS=google,facebook (dans .env)
const ENABLED = String(import.meta.env.VITE_OAUTH_PROVIDERS ?? '').split(',').map((s) => s.trim());
const strength = (p: string) => [p.length >= 8, /[A-Z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
type Provider = 'google' | 'facebook';
const GoogleIcon = () => <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.2 5.5-4.7 7.2l7.6 5.9c4.4-4.1 6.9-10.1 6.9-17.6z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>;
const FacebookIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/></svg>;

export function AuthScreen({ teacher = false }: { teacher?: boolean } = {}) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [method, setMethod] = useState<'password' | 'code'>('password');
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [verifyType, setVerifyType] = useState<'signup' | 'email'>('signup');
  const [fullName, setFullName] = useState('');
  const [level, setLevel] = useState(classes[0].name);
  const [email, setEmail] = useState(() => { try { return localStorage.getItem('last-email') ?? ''; } catch { return ''; } });
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [q, setQ] = useState(0);
  const cClasses = useCount(classes.length), cSubjects = useCount(SUBJECTS), cCourses = useCount(TOTAL);
  useEffect(() => { const t = setInterval(() => setQ((x) => (x + 1) % QUOTES.length), 4500); return () => clearInterval(t); }, []);
  useEffect(() => { if (wait <= 0) return; const t = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(t); }, [wait]);

  const reset = (m: typeof mode) => { setMode(m); setMethod('password'); setStep('form'); setError(''); setMessage(''); setCode(''); };
  const score = strength(password);
  const nice = (m: string) => /invalid login/i.test(m) ? 'Email ou mot de passe incorrect.' : /rate limit|too many|seconds/i.test(m) ? 'Trop de tentatives : attends une minute puis réessaie.' : /not allowed|not found|signups/i.test(m) ? 'Aucun compte avec cet email. Inscris-toi d’abord.' : /token|expired|invalid/i.test(m) ? 'Code invalide ou expiré.' : m;
  const goVerify = (type: 'signup' | 'email') => { setVerifyType(type); setStep('verify'); setCode(''); setWait(60); setMessage(`Un code a été envoyé à ${email}. Vérifie aussi tes courriers indésirables.`); };

  const sendLoginCode = async () => {
    const { error: err } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    if (err) setError(nice(err.message)); else goVerify('email');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setError(''); setMessage('');
    try { localStorage.setItem('last-email', email); } catch { /* ignoré */ }
    if (mode === 'signup') {
      const { data, error: err } = await supabase.auth.signUp({ email, password, options: { data: teacher ? { full_name: fullName } : { full_name: fullName, class_level: level } } });
      if (err) setError(nice(err.message));
      else if (data.user && data.user.identities?.length === 0) setError('Cet email a déjà un compte : connecte-toi.');
      else if (!data.session) goVerify('signup');
    } else if (method === 'code') {
      await sendLoginCode();
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err && /not confirmed/i.test(err.message)) { await supabase.auth.resend({ type: 'signup', email }); goVerify('signup'); }
      else if (err) setError(nice(err.message));
    }
    setBusy(false);
  };

  const verify = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setError('');
    const { error: err } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: verifyType });
    if (err) setError(nice(err.message));
    setBusy(false);
  };

  const resend = async () => {
    setError(''); setWait(60);
    const { error: err } = verifyType === 'signup' ? await supabase.auth.resend({ type: 'signup', email }) : await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    if (err) setError(nice(err.message)); else setMessage('Nouveau code envoyé.');
  };

  const oauth = async (provider: Provider) => {
    setError('');
    const { error: err } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
    if (err) setError(/not enabled|unsupported/i.test(err.message) ? 'Cette connexion n’est pas encore activée (voir CONFIGURATION.md).' : err.message);
  };

  return (
    <main className={`a-screen${teacher ? ' teacher' : ''}`}>
      <section className="a-hero">
        <span className="orb o1" /><span className="orb o2" /><span className="orb o3" />
        <div className="a-brand"><div className="brand-mark"><GraduationCap size={24} /></div><div><strong>ELHADJI BABA NDIONGUE</strong><span>{teacher ? 'Espace professeur' : 'Plateforme éducative'}</span></div></div>
        <div className="a-copy">
          {teacher ? <h1>Espace<br /><em>professeur</em></h1> : <h1>Apprends mieux.<br /><em>Réussis ensemble.</em></h1>}
          {teacher ? <p className="a-quote">Publiez vos cours, TD, devoirs et corrigés : vos élèves les retrouvent aussitôt sur la plateforme.</p> : <p key={q} className="a-quote">« {QUOTES[q]} »</p>}
          <div className="a-dots" style={{ display: teacher ? 'none' : undefined }}>{QUOTES.map((_, i) => <i key={i} className={i === q ? 'on' : ''} onClick={() => setQ(i)} />)}</div>
        </div>
        <div className="a-stats" style={{ display: teacher ? 'none' : undefined }}>
          <div><BookOpen size={18} /><strong>{cCourses}</strong><span>cours</span></div>
          <div><Users size={18} /><strong>{cClasses}</strong><span>classes</span></div>
          <div><GraduationCap size={18} /><strong>{cSubjects}</strong><span>matières</span></div>
          <div><Brain size={18} /><strong>IA</strong><span>assistant</span></div>
        </div>
      </section>

      <section className="a-panel">
        <div className="a-card">
          {step === 'form' ? <>
            <div className="a-tabs"><button className={mode === 'login' ? 'on' : ''} onClick={() => reset('login')}>Connexion</button><button className={mode === 'signup' ? 'on' : ''} onClick={() => reset('signup')}>Inscription</button><span style={{ transform: `translateX(${mode === 'login' ? 0 : 100}%)` }} /></div>
            <h2>{teacher ? (mode === 'login' ? 'Connexion professeur' : 'Créer un compte professeur') : mode === 'login' ? 'Content de te revoir 👋' : 'Rejoins ta classe'}</h2>
            <p className="a-sub">{mode === 'signup' ? 'Tu recevras un code de validation par email.' : 'Accède à tes cours, TD, corrigés et à ton assistant IA.'}</p>
            {ENABLED.some((p) => p === 'google' || p === 'facebook') && <>
              <div className="a-oauth" style={{ gridTemplateColumns: ENABLED.includes('google') && ENABLED.includes('facebook') ? '1.6fr 1fr' : '1fr' }}>
                {ENABLED.includes('google') && <button type="button" onClick={() => oauth('google')}><GoogleIcon /> Continuer avec Google</button>}
                {ENABLED.includes('facebook') && <button type="button" onClick={() => oauth('facebook')}><FacebookIcon /> Facebook</button>}
              </div>
              <div className="a-sep"><span>ou avec ton email</span></div>
            </>}
            <form onSubmit={submit} key={`${mode}-${method}`} className="a-form">
              {mode === 'signup' && <>
                <label className="a-field"><User size={17} /><input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nom complet" required autoComplete="name" /></label>
                <div className="a-levels" style={{ display: teacher ? 'none' : undefined }}>{classes.map((c) => <button type="button" key={c.id} className={level === c.name ? 'on' : ''} onClick={() => setLevel(c.name)}>{c.name}</button>)}</div>
              </>}
              <label className="a-field"><Mail size={17} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Adresse email" required autoComplete="email" /></label>
              {(mode === 'signup' || method === 'password') && <label className="a-field"><Lock size={17} /><input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" minLength={6} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                <button type="button" className="a-eye" onClick={() => setShow(!show)} aria-label="Afficher le mot de passe">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></label>}
              {mode === 'signup' && password && <div className="a-meter"><span className={`s${score}`} /><small>{['Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent'][score]}</small></div>}
              {error && <p className="form-error">{error}</p>}{message && <p className="form-success">{message}</p>}
              <button className="a-submit" disabled={busy}>{busy ? <Loader2 size={18} className="spin" /> : <>{mode === 'signup' ? 'Créer mon compte' : method === 'code' ? 'Recevoir mon code' : 'Ouvrir mon espace'} <ArrowRight size={18} /></>}</button>
            </form>
            {teacher ? <a className="a-switch-link" href="/">← Retour au site des élèves</a> : <a className="a-switch-link" href="/professeur">Vous êtes professeur ? Accéder à l’espace professeur →</a>}
            {mode === 'login' && <div className="a-links"><button onClick={() => { setMethod(method === 'password' ? 'code' : 'password'); setError(''); }}><KeyRound size={14} /> {method === 'password' ? 'Mot de passe oublié ? Connexion par code email' : 'Utiliser mon mot de passe'}</button></div>}
          </> : <>
            <div className="a-mail"><Mail size={30} /></div>
            <h2>Vérifie ta boîte email</h2>
            <p className="a-sub">Entre le code reçu à <b>{email}</b>.</p>
            <form onSubmit={verify} className="a-form">
              <input className="a-code" inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={8} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="• • • • • •" required />
              {error && <p className="form-error">{error}</p>}{message && <p className="form-success">{message}</p>}
              <button className="a-submit" disabled={busy || code.length < 6}>{busy ? <Loader2 size={18} className="spin" /> : <>Valider le code <ArrowRight size={18} /></>}</button>
            </form>
            <div className="a-links"><button disabled={wait > 0} onClick={resend}>{wait > 0 ? `Renvoyer le code dans ${wait} s` : 'Renvoyer le code'}</button><br /><button onClick={() => reset(mode)}>← Changer d’email</button></div>
          </>}
        </div>
      </section>
    </main>
  );
}
