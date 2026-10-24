import { useEffect, useRef, useState } from 'react';
import { Markdown } from '@/components/Markdown';

type Doc = { title: string; text: string };
const WIDTH = 720; // largeur de la feuille en px (≈ 190 mm) ; marges de 10 mm ajoutées dans le PDF

// Génère un vrai fichier PDF téléchargé directement (formules KaTeX incluses), sans fenêtre d'impression.
export function PrintRoot() {
  const [doc, setDoc] = useState<Doc | null>(null);
  const [error, setError] = useState('');
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const on = (e: Event) => { setError(''); setDoc((e as CustomEvent<Doc>).detail); };
    window.addEventListener('print-doc', on);
    return () => window.removeEventListener('print-doc', on);
  }, []);

  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    (async () => {
      try {
        await new Promise((r) => setTimeout(r, 500));
        await document.fonts?.ready;
        const el = sheet.current;
        if (!el || cancelled) return;
        const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
        const scale = 2;
        const canvas = await html2canvas(el, { scale, backgroundColor: '#ffffff', useCORS: true, windowWidth: WIDTH });
        const top = el.getBoundingClientRect().top;
        const blocks = [el.querySelector('h1'), ...Array.from(el.querySelector('.md')?.children ?? [])].filter((b): b is Element => !!b);
        const bottoms = blocks.map((b) => b.getBoundingClientRect().bottom - top);
        const total = el.scrollHeight;
        const pageH = Math.floor(WIDTH * (277 / 190)); // hauteur utile d'une page A4 en px
        const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
        let y0 = 0; let first = true;
        while (y0 < total - 1) {
          let cut = Math.min(y0 + pageH, total);
          if (total - y0 > pageH) { const fit = bottoms.filter((b) => b > y0 + 40 && b <= y0 + pageH); if (fit.length) cut = Math.max(...fit); }
          const part = document.createElement('canvas');
          part.width = canvas.width; part.height = Math.max(1, Math.round((cut - y0) * scale));
          part.getContext('2d')?.drawImage(canvas, 0, Math.round(y0 * scale), canvas.width, part.height, 0, 0, canvas.width, part.height);
          if (!first) pdf.addPage();
          pdf.addImage(part.toDataURL('image/png'), 'PNG', 10, 10, 190, (190 * part.height) / part.width);
          first = false; y0 = cut;
        }
        if (!cancelled) pdf.save(`${doc.title.replace(/[^\p{L}\p{N}]+/gu, '_').slice(0, 60) || 'document'}.pdf`);
      } catch (e) { console.error(e); setError('Impossible de créer le PDF. Réessaie.'); }
      if (!cancelled) setDoc(null);
    })();
    return () => { cancelled = true; };
  }, [doc]);

  return (
    <>
      {doc && <div className="pdf-sheet" ref={sheet} style={{ width: WIDTH }}><h1>{doc.title}</h1><Markdown text={doc.text} /></div>}
      {doc && <div className="pdf-toast">Préparation du PDF…</div>}
      {error && <div className="pdf-toast err" onClick={() => setError('')}>{error}</div>}
    </>
  );
}
