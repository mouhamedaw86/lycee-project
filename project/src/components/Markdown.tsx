import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import 'katex/contrib/mhchem';

// Corrige les écritures de formules les plus fréquentes des IA : C_4H_10 -> C4H10, H_(2n+2) -> H_{2n+2}, \( \) -> $ $.
function fixMath(m: string) {
  let s = m.trim();
  s = s.replace(/_\(([^()]*)\)/g, '_{$1}').replace(/\^\(([^()]*)\)/g, '^{$1}').replace(/([_^])(\d{2,})/g, '$1{$2}');
  if (s.includes('_') && /^(?:[A-Z][a-z]?(?:_\{?\d+\}?)?)+$/.test(s)) return `\\ce{${s.replace(/[_{}]/g, '')}}`;
  return s;
}
export function normalize(t: string) {
  const text = t.replace(/\\\[([\s\S]*?)\\\]/g, (_, m: string) => `$$${m}$$`).replace(/\\\(([\s\S]*?)\\\)/g, (_, m: string) => `$${m}$`);
  return text.replace(/\$\$([\s\S]*?)\$\$|\$([^$\n]+)\$/g, (_, d: string | undefined, i: string | undefined) => (d !== undefined ? `$$${fixMath(d)}$$` : `$${fixMath(i ?? '')}$`));
}

export function Markdown({ text }: { text: string }) {
  return <div className="md"><ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{normalize(text)}</ReactMarkdown></div>;
}
