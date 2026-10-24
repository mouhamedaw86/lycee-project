import { FormEvent, useState } from 'react';
import { FileDown, Plus, Trash2 } from 'lucide-react';
import { useRemote } from '@/lib/storage';
import { downloadPdf } from '@/lib/pdf';
import { classes } from '@/data/catalog';

type Slot = { id: string; day: number; start: string; end: string; subject: string; room: string; color: string };
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const COLORS = ['#2563eb', '#16a34a', '#ea580c', '#9333ea', '#db2777', '#0891b2'];
const SUBJECTS = Array.from(new Set(classes.flatMap((c) => c.subjects.map((s) => s.name))));

export function Schedule({ uid }: { uid: string }) {
  const [slots, setSlots] = useRemote<Slot[]>(uid, 'schedule', []);
  const [f, setF] = useState({ day: 0, start: '08:00', end: '10:00', subject: '', room: '', color: COLORS[0] });
  const add = (e: FormEvent) => {
    e.preventDefault();
    if (!f.subject.trim() || f.end <= f.start) return;
    setSlots((s) => [...s, { ...f, subject: f.subject.trim(), id: crypto.randomUUID() }]);
    setF({ ...f, subject: '', room: '' });
  };
  const exportPdf = () => downloadPdf('Mon emploi du temps', DAYS.map((d, i) => `# ${d}\n` + (slots.filter((s) => s.day === i).sort((a, b) => a.start.localeCompare(b.start)).map((s) => `- ${s.start} - ${s.end} : ${s.subject}${s.room ? ` (${s.room})` : ''}`).join('\n') || '_Aucun cours_')).join('\n\n'));

  return (
    <section className="section-block">
      <div className="section-heading"><div><p className="eyebrow">MON EMPLOI DU TEMPS</p><h3>Construis ton planning</h3></div>
        <button className="outline-button" onClick={exportPdf} disabled={!slots.length}><FileDown size={15} /> PDF</button></div>
      <form className="post-form sched-form" onSubmit={add}>
        <select value={f.day} onChange={(e) => setF({ ...f, day: +e.target.value })}>{DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}</select>
        <input type="time" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} />
        <input type="time" value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} />
        <input list="subjects" placeholder="Matière ou activité" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} required />
        <datalist id="subjects">{SUBJECTS.map((s) => <option key={s} value={s} />)}</datalist>
        <input placeholder="Salle (facultatif)" value={f.room} onChange={(e) => setF({ ...f, room: e.target.value })} />
        <div className="color-row">{COLORS.map((c) => <button type="button" key={c} aria-label={`Couleur ${c}`} className={f.color === c ? 'sel' : ''} style={{ background: c }} onClick={() => setF({ ...f, color: c })} />)}</div>
        <button className="primary-small" type="submit"><Plus size={14} /> Ajouter</button>
      </form>
      <div className="week-grid">{DAYS.map((d, i) => (
        <div key={d} className="day-col"><strong>{d}</strong>
          {slots.filter((s) => s.day === i).sort((a, b) => a.start.localeCompare(b.start)).map((s) => (
            <div key={s.id} className="slot" style={{ borderLeftColor: s.color, background: `${s.color}14` }}>
              <b>{s.subject}</b><span>{s.start} – {s.end}{s.room ? ` • ${s.room}` : ''}</span>
              <button aria-label="Supprimer" onClick={() => setSlots((x) => x.filter((y) => y.id !== s.id))}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      ))}</div>
    </section>
  );
}
