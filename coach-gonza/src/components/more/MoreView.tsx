import React from 'react';
import { Package, Swords, BookOpen, Settings, Newspaper, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const SECTIONS: { id: string; label: string; detail: string; icon: React.ElementType }[] = [
  { id: 'events', label: 'Peleas', detail: 'Veladas, ficha del rival y plan de esquina', icon: Swords },
  { id: 'news', label: 'Noticias', detail: 'Lo último del boxeo, se actualiza solo', icon: Newspaper },
  { id: 'packages', label: 'Paquetes', detail: 'Precios de clases, packs y mensualidades', icon: Package },
  { id: 'library', label: 'Rutinas', detail: 'Combinaciones, ejercicios y preparación física', icon: BookOpen },
  { id: 'settings', label: 'Ajustes', detail: 'Tu perfil, copia de seguridad y datos', icon: Settings }
];

export const MoreView: React.FC = () => {
  const { setActiveTab, events } = useApp();
  const today = new Date().toISOString().slice(0, 10);
  const upcomingFights = events.filter(e => e.date >= today && (e.type === 'pelea' || e.type === 'competencia')).length;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display font-extrabold uppercase text-3xl tracking-tight mb-3">Más</h1>
      <ul className="divide-y divide-zinc-800 border-y border-zinc-800">
        {SECTIONS.map(s => {
          const Icon = s.icon;
          return (
            <li key={s.id}>
              <button
                onClick={() => setActiveTab(s.id)}
                className="w-full min-h-16 py-3 flex items-center gap-4 text-left cursor-pointer group"
              >
                <span className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-300 group-hover:text-white">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="font-display font-bold uppercase text-xl tracking-wide leading-none">{s.label}</span>
                    {s.id === 'events' && upcomingFights > 0 && (
                      <span className="text-xs font-bold text-white bg-ring-red rounded-full px-2 py-0.5 tabular">
                        {upcomingFights} próxima{upcomingFights > 1 ? 's' : ''}
                      </span>
                    )}
                  </span>
                  <span className="block text-sm text-zinc-400 mt-1">{s.detail}</span>
                </span>
                <ChevronRight className="w-5 h-5 text-zinc-600 shrink-0" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
