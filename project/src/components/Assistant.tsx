import { FormEvent, useEffect, useRef, useState } from 'react';
import { FileDown, Paperclip, Send, X } from 'lucide-react';
import { downloadPdf } from '@/lib/pdf';
import { getFileUrl } from '@/lib/documents';
import { Markdown } from '@/components/Markdown';
import { supabase } from '@/lib/supabase';

type Block = { type: string; [k: string]: unknown };
type Msg = { role: 'user' | 'assistant'; text: string; files?: string[] };
export type AskPrompt = { text: string; n: number; fileUrl?: string } | null;

const MAX = 4 * 1024 * 1024;
const toBase64 = (file: File) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = () => rej(r.error); r.readAsDataURL(file); });

async function toBlocks(text: string, files: File[]): Promise<Block[]> {
  const blocks: Block[] = [];
  for (const f of files) {
    if (f.type.startsWith('image/')) blocks.push({ type: 'image', source: { type: 'base64', media_type: f.type, data: await toBase64(f) } });
    else if (f.type === 'application/pdf') blocks.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: await toBase64(f) } });
    else blocks.push({ type: 'text', text: `Fichier « ${f.name} » :\n${await f.text()}` });
  }
  blocks.push({ type: 'text', text });
  return blocks;
}

export function Assistant({ prompt }: { prompt: AskPrompt }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const last = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const msgsRef = useRef<Msg[]>([]);
  msgsRef.current = msgs;

  const send = async (content: string, attached: File[] = []) => {
    if (!content.trim() && !attached.length) return;
    const question = content.trim() || 'Corrige et explique cet exercice étape par étape.';
    const history = [...msgsRef.current, { role: 'user' as const, text: question, files: attached.map((f) => f.name) }];
    setMsgs(history); setBusy(true);
    try {
      const payload = await Promise.all(history.map(async (m, i) => ({ role: m.role, content: i === history.length - 1 && attached.length ? await toBlocks(m.text, attached) : m.text })));
      const token = (await supabase.auth.getSession()).data.session?.access_token ?? '';
      const resp = await fetch('/api/assistant', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ messages: payload }) });
      const data = (await resp.json().catch(() => ({}))) as { reply?: string; error?: string };
      const reply = resp.ok && data.reply ? data.reply : `Assistant indisponible : ${data.error ?? 'le serveur IA ne répond pas (lance le projet avec LANCER.bat).'}`;
      setMsgs([...history, { role: 'assistant', text: reply }]);
    } catch { setMsgs([...history, { role: 'assistant', text: 'Une erreur est survenue. Réessaie.' }]); }
    setBusy(false);
  };

  useEffect(() => {
    if (!prompt || last.current === prompt.n) return;
    last.current = prompt.n;
    void (async () => {
      let attached: File[] = [];
      if (prompt.fileUrl) { try { const blob = await (await fetch((await getFileUrl(prompt.fileUrl)) ?? '')).blob(); attached = [new File([blob], prompt.fileUrl.split('/').pop() ?? 'document.pdf', { type: 'application/pdf' })]; } catch { /* envoi sans pièce jointe */ } }
      await send(prompt.text, attached);
    })();
  }, [prompt]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight }); }, [msgs, busy]);

  const submit = (e: FormEvent) => { e.preventDefault(); const t = text, f = files; setText(''); setFiles([]); void send(t, f); };
  const pick = (list: FileList | null) => { const ok = Array.from(list ?? []).filter((f) => f.size <= MAX); setFiles((x) => [...x, ...ok].slice(0, 4)); };

  return (
    <section className="section-block">
      <div className="section-heading"><div><p className="eyebrow">ASSISTANT IA</p><h3>Supports de cours, corrections et explications</h3></div></div>
      <div className="ai-actions" style={{ marginBottom: 12 }}>
        <button onClick={() => setText('Conçois un support de cours sur : ')}>Créer un support de cours</button>
        <button onClick={() => setText('Corrige cet exercice (voir fichier joint) et explique chaque étape.')}>Corriger un exercice</button>
        <button onClick={() => setText('Explique-moi simplement : ')}>Expliquer une notion</button>
      </div>
      <div className="chat-log" ref={logRef}>
        {!msgs.length && <p className="empty-state">Joins une photo, un PDF ou un texte d’exercice avec le trombone, ou demande un support de cours.</p>}
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.files?.length ? <small>📎 {m.files.join(', ')}</small> : null}
            {m.role === 'assistant' ? <Markdown text={m.text} /> : <div>{m.text}</div>}
            {m.role === 'assistant' && m.text.length > 200 && <button className="primary-small" onClick={() => downloadPdf((msgs[i - 1]?.text ?? 'Support de cours').slice(0, 60), m.text)}><FileDown size={14} /> Télécharger le PDF</button>}
          </div>
        ))}
        {busy && <div className="msg assistant">L’assistant rédige…</div>}
      </div>
      {files.length > 0 && <div className="chip-row">{files.map((f, i) => <span key={i} className="chip on">{f.name} <X size={12} style={{ cursor: 'pointer' }} onClick={() => setFiles(files.filter((_, j) => j !== i))} /></span>)}</div>}
      <form className="chat-form" onSubmit={submit}>
        <label className="icon-button" title="Joindre un exercice (image, PDF, texte — 4 Mo max)"><Paperclip size={18} /><input type="file" hidden multiple accept="image/*,application/pdf,text/*" onChange={(e) => { pick(e.target.files); e.target.value = ''; }} /></label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Pose ta question ou décris ce que tu veux…" rows={2} />
        <button className="primary-small" type="submit" disabled={busy}><Send size={14} /> Envoyer</button>
      </form>
    </section>
  );
}
