import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookPlus, Copy, FileUp, LogOut, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { chapterInfo, classes, resourcesFor } from '@/data/catalog';
import { loadRemoteContent } from '@/lib/remoteContent';
import { openDocument } from '@/lib/documents';

type Me = { teacher: boolean; id: string; email: string; configured: boolean };
type Row = { id: string; path: string; title: string | null; kind: string | null; uploaded_by_email: string | null; created_at: string };
type Option = { value: string; label: string };

const TYPES = [
  { value: 'cours', label: 'Cours', target: 'chapter' },
  { value: 'td', label: 'TD ou exercices (énoncé)', target: 'chapter' },
  { value: 'td-corrige', label: 'Corrigé d’un TD', target: 'chapter' },
  { value: 'eval', label: 'Devoir surveillé ou composition (énoncé)', target: 'eval' },
  { value: 'eval-corrige', label: 'Corrigé d’un devoir ou d’une composition', target: 'eval' },
  { value: 'concours', label: 'Épreuve de concours (énoncé)', target: 'concours' },
  { value: 'concours-corrige', label: 'Corrigé d’une épreuve de concours', target: 'concours' },
] as const;
type TypeValue = (typeof TYPES)[number]['value'];

async function api<T>(url: string, method = 'GET', body?: unknown): Promise<T> {
  const token = (await supabase.auth.getSession()).data.session?.access_token ?? '';
  const r = await fetch(url, { method, headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const data = (await r.json().catch(() => ({}))) as { error?: string };
  if (!r.ok) throw new Error(data.error ?? 'Erreur du serveur');
  return data as T;
}

export function TeacherPortal() {
  const [me, setMe] = useState<Me | null>(null);
  const [ver, setVer] = useState(0);
  const [classId, setClassId] = useState(classes[0].id);
  const [subjectId, setSubjectId] = useState(classes[0].subjects[0].id);
  const [type, setType] = useState<TypeValue>('cours');
  const [target, setTarget] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [chapterTitle, setChapterTitle] = useState('');

  const cls = classes.find((c) => c.id === classId) ?? classes[0];
  const sub = cls.subjects.find((s) => s.id === subjectId) ?? cls.subjects[0];
  const typeDef = TYPES.find((t) => t.value === type) ?? TYPES[0];

  const options: Option[] = useMemo(() => {
    void ver;
    if (typeDef.target === 'chapter') {
      return sub.chapters.map((_, i) => { const { n, title } = chapterInfo(sub, i); return { value: String(n), label: `${n}. ${title}` }; });
    }
    const group = typeDef.target === 'eval' ? 'Évaluations' : 'Concours';
    return resourcesFor(cls, sub).filter((r) => r.group === group).map((r) => ({ value: r.id, label: r.title }));
  }, [cls, sub, typeDef, ver]);

  useEffect(() => { if (!cls.subjects.some((s) => s.id === subjectId)) setSubjectId(cls.subjects[0].id); }, [cls, subjectId]);
  useEffect(() => { setTarget(options[0]?.value ?? ''); }, [options]);

  const reload = useCallback(async () => {
    await loadRemoteContent();
    setVer((v) => v + 1);
    const { data } = await supabase.from('documents').select('id,path,title,kind,uploaded_by_email,created_at').order('created_at', { ascending: false }).limit(200);
    setRows((data ?? []) as Row[]);
  }, []);

  useEffect(() => {
    api<Me>('/api/teacher/me').then(setMe).catch(() => setMe({ teacher: false, id: '', email: '', configured: false }));
    void reload();
  }, [reload]);

  const buildId = () => {
    if (typeDef.target === 'chapter') {
      const base = `${cls.id}-${sub.id}-${type === 'cours' ? 'cours' : 'td'}${target}`;
      return type === 'td-corrige' ? `${base}-corrige` : base;
    }
    return type.endsWith('-corrige') ? `${target}-corrige` : target;
  };

  const publish = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !target) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) { setMsg({ ok: false, text: 'Le fichier doit être un PDF.' }); return; }
    if (file.size > 50 * 1024 * 1024) { setMsg({ ok: false, text: 'Fichier trop lourd (50 Mo maximum).' }); return; }
    setBusy(true); setMsg(null);
    try {
      const id = buildId();
      const path = `${id}.pdf`;
      const { token } = await api<{ token: string }>('/api/teacher/sign-upload', 'POST', { path });
      const { error } = await supabase.storage.from('ressources').uploadToSignedUrl(path, token, file, { contentType: 'application/pdf' });
      if (error) throw new Error(error.message);
      await api('/api/teacher/documents', 'POST', { items: [{ id, path, title: options.find((o) => o.value === target)?.label ?? id, kind: type }] });
      setMsg({ ok: true, text: 'Document publié : les élèves le voient tout de suite.' });
      setFile(null);
      await reload();
    } catch (err) { setMsg({ ok: false, text: err instanceof Error ? err.message : 'Échec de la publication.' }); }
    setBusy(false);
  };

  const addChapter = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api('/api/teacher/chapters', 'POST', { class_id: cls.id, subject_id: sub.id, title: chapterTitle });
      setChapterTitle('');
      setMsg({ ok: true, text: 'Chapitre ajouté.' });
      await reload();
    } catch (err) { setMsg({ ok: false, text: err instanceof Error ? err.message : 'Échec.' }); }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Supprimer ce document pour tous les élèves ?')) return;
    try { await api(`/api/teacher/documents?id=${encodeURIComponent(id)}`, 'DELETE'); await reload(); }
    catch (err) { setMsg({ ok: false, text: err instanceof Error ? err.message : 'Échec de la suppression.' }); }
  };

  return (
    <div className="tp">
      <header className="tp-top">
        <a className="outline-button" href="/"><ArrowLeft size={15} /> Retour au site élèves</a>
        <h1>Espace professeur</h1>
        <button className="outline-button" onClick={() => supabase.auth.signOut()}><LogOut size={15} /> Déconnexion</button>
      </header>

      {!me && <p>Vérification de votre accès…</p>}
      {me && !me.teacher && (
        <section className="tp-card">
          <h2>Accès réservé aux professeurs</h2>
          <p>Ce compte n’est pas encore autorisé. Envoyez votre identifiant à l’administrateur du site, qui l’ajoutera à la liste des professeurs :</p>
          <p className="tp-id"><code>{me.id || 'identifiant indisponible'}</code>{me.id && <button className="outline-button" onClick={() => void navigator.clipboard?.writeText(me.id)}><Copy size={14} /> Copier</button>}</p>
          {!me.configured && <p className="form-error">Le serveur n’est pas encore configuré pour l’espace professeur (clé manquante).</p>}
        </section>
      )}

      {me?.teacher && <>
        <section className="tp-card">
          <h2><FileUp size={20} /> Publier un document</h2>
          <form onSubmit={publish} className="tp-form">
            <label>Classe<select value={classId} onChange={(e) => setClassId(e.target.value)}>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <label>Matière<select value={sub.id} onChange={(e) => setSubjectId(e.target.value)}>{cls.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
            <label>Type de document<select value={type} onChange={(e) => setType(e.target.value as TypeValue)}>{TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
            <label>{typeDef.target === 'chapter' ? 'Chapitre' : typeDef.target === 'eval' ? 'Évaluation' : 'Concours'}<select value={target} onChange={(e) => setTarget(e.target.value)}>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
            <label className="tp-wide">Fichier PDF (50 Mo maximum)<input type="file" accept="application/pdf,.pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
            <button className="primary-small tp-wide" type="submit" disabled={busy || !file || !target}>{busy ? 'Envoi en cours…' : 'Publier'}</button>
          </form>
          <p className="tp-note">Un document déjà présent à cet emplacement est remplacé. Pour S1 et S2, publiez dans chaque série.</p>
        </section>

        <section className="tp-card">
          <h2><BookPlus size={20} /> Ajouter un chapitre à {sub.name} ({cls.name})</h2>
          <form onSubmit={addChapter} className="tp-inline">
            <input value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} placeholder="Titre du nouveau chapitre" minLength={3} maxLength={140} required />
            <button className="primary-small" type="submit">Ajouter</button>
          </form>
        </section>

        {msg && <p className={msg.ok ? 'form-success' : 'form-error'}>{msg.text}</p>}

        <section className="tp-card">
          <h2>Documents publiés depuis le site ({rows.length})</h2>
          {!rows.length && <p className="tp-note">Aucun document publié pour l’instant.</p>}
          <div className="tp-list">{rows.map((r) => (
            <div key={r.id} className="tp-row">
              <div><strong>{r.title || r.id}</strong><small>{r.id} · {r.uploaded_by_email ?? ''} · {new Date(r.created_at).toLocaleDateString('fr-FR')}</small></div>
              <button className="outline-button" onClick={() => void openDocument(r.path)}>Ouvrir</button>
              <button className="outline-button" onClick={() => void remove(r.id)} aria-label="Supprimer"><Trash2 size={14} /></button>
            </div>
          ))}</div>
        </section>
      </>}
    </div>
  );
}
