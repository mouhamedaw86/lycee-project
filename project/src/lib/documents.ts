import { supabase } from '@/lib/supabase';

const BUCKET = 'ressources';
const cache = new Map<string, { url: string; exp: number }>();

// Lien temporaire (1 h) vers un document du bucket privé : seuls les élèves connectés peuvent en obtenir un.
export async function getFileUrl(path: string): Promise<string | null> {
  const hit = cache.get(path);
  if (hit && hit.exp > Date.now()) return hit.url;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (!error && data?.signedUrl) {
    cache.set(path, { url: data.signedUrl, exp: Date.now() + 50 * 60_000 });
    return data.signedUrl;
  }
  // Repli : PDF du dossier local « ressources/ » servi par le serveur du projet (avant la mise en place de Supabase Storage).
  try {
    const local = `/ressources/${path}`;
    const head = await fetch(local, { method: 'HEAD' });
    if (head.ok && (head.headers.get('content-type') ?? '').includes('pdf')) return local;
  } catch { /* indisponible */ }
  return null;
}

export async function openDocument(path: string) {
  const tab = window.open('', '_blank'); // ouvert tout de suite pour ne pas être bloqué sur téléphone
  const url = await getFileUrl(path);
  if (url) { if (tab) tab.location.href = url; else window.location.href = url; return; }
  tab?.close();
  window.alert('Ce document n’est pas encore disponible. Réessaie plus tard ou préviens ton professeur.');
}
