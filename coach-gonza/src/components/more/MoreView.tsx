import React, { useState } from 'react';
import { Package, Swords, BookOpen, Settings, Newspaper } from 'lucide-react';
import { PackagesView } from '../packages/PackagesView';
import { EventsView } from '../events/EventsView';
import { BoxingLibraryView } from '../library/BoxingLibraryView';
import { SettingsView } from '../settings/SettingsView';
import { NewsView } from '../news/NewsView';

type SubTab = 'news' | 'packages' | 'events' | 'library' | 'settings';

const TABS: { id: SubTab; label: string; icon: React.ElementType }[] = [
  { id: 'news', label: 'Noticias', icon: Newspaper },
  { id: 'packages', label: 'Paquetes', icon: Package },
  { id: 'events', label: 'Peleas', icon: Swords },
  { id: 'library', label: 'Rutinas', icon: BookOpen },
  { id: 'settings', label: 'Ajustes', icon: Settings }
];

export const MoreView: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('news');

  return (
    <div className="space-y-5 pt-1 max-w-7xl mx-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5 grid grid-cols-5 gap-1 shadow-lg">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`py-2 px-0.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                active ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-bold leading-none">{t.label}</span>
            </button>
          );
        })}
      </div>

      {subTab === 'news' && <NewsView />}
      {subTab === 'packages' && <PackagesView />}
      {subTab === 'events' && <EventsView />}
      {subTab === 'library' && <BoxingLibraryView />}
      {subTab === 'settings' && <SettingsView />}
    </div>
  );
};
