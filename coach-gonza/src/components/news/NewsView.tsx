import React, { useState } from 'react';
import { Newspaper, RefreshCw, ExternalLink, WifiOff } from 'lucide-react';
import { useNews, timeAgo, NewsItem } from '../../utils/news';

type Filter = 'todas' | 'argentina' | 'mundo';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'argentina', label: '🇦🇷 Argentina' },
  { id: 'mundo', label: '🌎 Mundo' }
];

export const NewsCard: React.FC<{ item: NewsItem; compact?: boolean }> = ({ item, compact }) => (
  <a
    href={item.link}
    target="_blank"
    rel="noopener noreferrer"
    className={`block bg-zinc-900 border border-zinc-800 hover:border-red-800/70 active:scale-[0.99] rounded-2xl ${compact ? 'p-3' : 'p-4'} transition-all`}
  >
    <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-400">
      <span className="text-red-400 truncate max-w-[60%]">{item.source}</span>
      <span className="text-zinc-600">•</span>
      <span className="shrink-0">{timeAgo(item.date)}</span>
      {item.tag === 'argentina' && (
        <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wider bg-sky-950/70 text-sky-300 border border-sky-800/60 px-1.5 py-0.5 rounded">
          ARG
        </span>
      )}
    </div>
    <p className={`mt-1.5 font-bold text-white leading-snug ${compact ? 'text-[13px] line-clamp-2' : 'text-sm'}`}>
      {item.title}
    </p>
  </a>
);

export const NewsView: React.FC = () => {
  const { items, updatedAt, loading, error, refresh } = useNews();
  const [filter, setFilter] = useState<Filter>('todas');

  const visible = filter === 'todas' ? items : items.filter(i => i.tag === filter);

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-red-500" /> Noticias del Box
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Lo último del boxeo en castellano, de medios argentinos y del mundo.
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            aria-label="Actualizar noticias"
            className="shrink-0 p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 hover:bg-zinc-700 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-none">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                filter === f.id
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-zinc-800/70 border-zinc-700 text-zinc-300 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {updatedAt && (
          <p className="text-[10px] text-zinc-500 mt-3">Actualizado {timeAgo(updatedAt)} · se renueva solo cada 3 horas</p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-900/60 rounded-xl px-3 py-2">
          <WifiOff className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {loading && items.length === 0 && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && visible.length === 0 && (
        <div className="text-center text-sm text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          Todavía no hay noticias para mostrar.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {visible.map(item => (
          <NewsCard key={item.link} item={item} />
        ))}
      </div>

      {visible.length > 0 && (
        <p className="text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1">
          <ExternalLink className="w-3 h-3" /> Tocá una noticia para leerla en el medio original. Fuente: Google Noticias.
        </p>
      )}
    </div>
  );
};
