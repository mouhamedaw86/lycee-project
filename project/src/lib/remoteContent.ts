import { supabase } from '@/lib/supabase';
import { FILES, classes } from '@/data/catalog';

// Ajoute au catalogue les documents et chapitres publiés par les professeurs depuis le site.
export async function loadRemoteContent() {
  const [docs, chapters] = await Promise.all([
    supabase.from('documents').select('id,path'),
    supabase.from('custom_chapters').select('class_id,subject_id,n,title').order('n'),
  ]);
  (docs.data ?? []).forEach((d) => { FILES[d.id as string] = d.path as string; });
  (chapters.data ?? []).forEach((c) => {
    const subject = classes.find((x) => x.id === c.class_id)?.subjects.find((y) => y.id === c.subject_id);
    const entry = `${c.n}:${c.title}`;
    if (subject && !subject.chapters.includes(entry)) subject.chapters.push(entry);
  });
}
