import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useLocal<T>(key: string, init: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => { try { const r = localStorage.getItem(key); return r ? (JSON.parse(r) as T) : init; } catch { return init; } });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* stockage indisponible */ } }, [key, value]);
  return [value, setValue];
}

// Comme useLocal, mais synchronisé avec le compte de l'élève (table user_data) : il retrouve ses données sur tout appareil.
export function useRemote<T>(uid: string, key: string, init: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useLocal<T>(`${key}-${uid}`, init);
  const ready = useRef(false);
  const latest = useRef(value);
  latest.current = value;
  useEffect(() => {
    ready.current = false;
    supabase.from('user_data').select('value').eq('key', key).maybeSingle().then(({ data, error }) => {
      if (error) return;
      if (data) setValue(data.value as T); else void supabase.from('user_data').upsert({ user_id: uid, key, value: latest.current });
      ready.current = true;
    });
  }, [uid, key, setValue]);
  useEffect(() => {
    if (!ready.current) return;
    const t = setTimeout(() => { void supabase.from('user_data').upsert({ user_id: uid, key, value }); }, 600);
    return () => clearTimeout(t);
  }, [value, uid, key]);
  return [value, setValue];
}
