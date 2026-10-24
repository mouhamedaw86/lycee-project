import { useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, FileDown, GraduationCap, Sparkles } from 'lucide-react';
import { DOCS } from '@/data/docs';
import { openDocument } from '@/lib/documents';
import { Reader } from '@/components/Reader';
import { ClassLevel, FILES, Subject, chapterInfo, courseId, resourcesFor } from '@/data/catalog';

type Props = { defaultClass?: string; mode: 'cours' | 'ressources'; done: string[]; toggleDone: (id: string) => void; onAsk: (prompt: string, attach?: string) => void };
const TABS = ['TD', 'Évaluations', 'Concours'] as const;

function Doc({ id, label, prompt, onAsk, onRead, attach }: { id: string; label: string; prompt: string; onAsk: (p: string, a?: string) => void; onRead: (id: string) => void; attach?: string }) {
  const url = FILES[id];
  if (DOCS[id]) return <button className="primary-small ok" onClick={() => onRead(id)}><BookOpen size={14} /> {label === 'Support de cours' ? 'Lire le cours' : `${label} (complet)`}</button>;
  return url
    ? <button className="primary-small" onClick={() => void openDocument(url)}><FileDown size={14} /> {label === 'Support de cours' ? 'Cours (PDF)' : label}</button>
    : <button className="primary-small" onClick={() => onAsk(prompt, attach)}><Sparkles size={14} /> {label}</button>;
}

export function Catalog({ defaultClass, mode, done, toggleDone, onAsk }: Props) {
  const [reading, setReading] = useState<string | null>(null);
  const [cls, setCls] = useState<ClassLevel | null>(() => classes_().find((x) => x.name === defaultClass) ?? null);
  const [sub, setSub] = useState<Subject | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>('TD');
  const back = () => (sub ? setSub(null) : setCls(null));
  if (reading && DOCS[reading]) return <section className="section-block"><Reader doc={DOCS[reading]} onClose={() => setReading(null)} /></section>;
  const base = cls && sub ? `${sub.name} — ${cls.name}` : '';

  return (
    <section className="section-block">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{mode === 'cours' ? 'MES COURS' : 'RESSOURCES'}</p>
          <h3>{!cls ? 'Choisis ta classe' : !sub ? `${cls.name} — choisis une matière` : `${sub.name} • ${cls.name}`}</h3>
        </div>
        {cls && <button className="outline-button" onClick={back}><ArrowLeft size={15} /> Retour</button>}
      </div>

      {!cls && <div className="pick-grid">{classes_().map((c) => (
        <button key={c.id} className="resource-card pick" onClick={() => setCls(c)}><GraduationCap size={26} /><h4>{c.name}</h4><span>{c.subjects.length} matières</span></button>
      ))}</div>}

      {cls && !sub && <div className="pick-grid">{cls.subjects.map((s) => {
        const seen = s.chapters.filter((_, i) => done.includes(courseId(cls, s, i))).length;
        return <button key={s.id} className="resource-card pick" onClick={() => { setSub(s); setTab('TD'); }}><BookOpen size={26} /><h4>{s.name}</h4><span>{mode === 'cours' ? `${seen}/${s.chapters.length} cours vus` : `${s.chapters.length} TD • évaluations • concours`}</span></button>;
      })}</div>}

      {cls && sub && mode === 'cours' && <div className="resource-list">{sub.chapters.map((_, i) => {
        const id = courseId(cls, sub, i); const ok = done.includes(id); const info = chapterInfo(sub, i);
        return (
          <article className="resource-card" key={id}>
            <input type="checkbox" checked={ok} onChange={() => toggleDone(id)} aria-label={`Cours vu : ${info.title}`} style={{ width: 20, height: 20 }} />
            <div className="resource-info"><span>Chapitre {info.n}</span><h4>{info.title}</h4>{ok && <p><CheckCircle2 size={13} /> Cours terminé</p>}</div>
            <Doc onRead={setReading} id={id} label="Support de cours" onAsk={onAsk} prompt={`Conçois un support de cours complet sur « ${info.title} » (${base}), programme sénégalais : objectifs, cours détaillé avec définitions et propriétés, exemples résolus, exercices d'application et résumé.`} />
          </article>
        );
      })}</div>}

      {cls && sub && mode === 'ressources' && <>
        <div className="chip-row">{TABS.map((t) => <button key={t} className={`chip ${t === tab ? 'on' : ''}`} onClick={() => setTab(t)}>{t === 'TD' ? 'TD par cours' : t === 'Évaluations' ? 'Devoirs et compositions' : 'Épreuves de concours'}</button>)}</div>
        <div className="resource-list">{resourcesFor(cls, sub).filter((r) => r.group === tab).map((r) => (
          <article className="resource-card" key={r.id}>
            <div className="resource-info"><span>{r.group}</span><h4>{r.title}</h4></div>
            <Doc onRead={setReading} id={r.id} label="Énoncé" onAsk={onAsk} prompt={`Rédige l'énoncé complet, avec barème, du ${r.ctx}.`} />
            <Doc onRead={setReading} id={`${r.id}-corrige`} label="Corrigé" onAsk={onAsk} attach={FILES[r.id]} prompt={FILES[r.id] ? 'Rédige le corrigé détaillé et rédigé de ce TD (document joint), exercice par exercice, avec toutes les étapes de calcul et les unités.' : `Rédige l'énoncé puis le corrigé détaillé et rédigé du ${r.ctx}.`} />
          </article>
        ))}</div>
      </>}
    </section>
  );
}
import { classes } from '@/data/catalog';
const classes_ = () => classes;
