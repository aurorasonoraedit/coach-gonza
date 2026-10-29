import { useCallback, useEffect, useState } from 'react';

export interface NewsItem {
  title: string;
  source: string;
  link: string;
  date: string;
  tag: 'argentina' | 'mundo';
}

interface NewsFile {
  updatedAt: string;
  items: NewsItem[];
}

const CACHE_KEY = 'boxcoach_news_cache_v1';

const readCache = (): NewsFile | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return 'recién';
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return 'ayer';
  if (d < 7) return `hace ${d} días`;
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
};

// Las noticias las genera un proceso automático en el servidor (scripts/fetch-news.mjs)
// y se publican junto con la app como news.json.
export const useNews = () => {
  const [data, setData] = useState<NewsFile | null>(() => readCache());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`./news.json?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      const json: NewsFile = await res.json();
      if (!Array.isArray(json.items)) throw new Error('formato');
      setData(json);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(json)); } catch { /* sin espacio */ }
    } catch {
      setError(navigator.onLine ? 'No se pudieron cargar las noticias.' : 'Sin conexión: mostrando las últimas guardadas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items: data?.items ?? [], updatedAt: data?.updatedAt ?? null, loading, error, refresh };
};
