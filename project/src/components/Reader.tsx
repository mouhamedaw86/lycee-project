import { ArrowLeft, FileDown } from 'lucide-react';
import { DocItem } from '@/data/docs';
import { downloadPdf } from '@/lib/pdf';
import { Markdown } from '@/components/Markdown';

export function Reader({ doc, onClose }: { doc: DocItem; onClose: () => void }) {
  return (
    <article className="reader">
      <div className="reader-bar">
        <button className="outline-button" onClick={onClose}><ArrowLeft size={15} /> Retour</button>
        <button className="primary-small" onClick={() => downloadPdf(doc.title, doc.body)}><FileDown size={14} /> Télécharger le PDF</button>
      </div>
      <Markdown text={doc.body} />
    </article>
  );
}
