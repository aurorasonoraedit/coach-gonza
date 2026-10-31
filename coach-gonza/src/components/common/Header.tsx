import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Check, LayoutGrid } from 'lucide-react';
import { formatShortDate } from '../../utils/dateUtils';

const MORE_TABS = ['more', 'news', 'packages', 'events', 'library', 'settings'];

export const Header: React.FC = () => {
  const { profile, reminders, toggleReminder, activeTab, setActiveTab } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const pendingReminders = reminders.filter(r => !r.isCompleted);
  const onMore = MORE_TABS.includes(activeTab);

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 text-white px-4 pb-2.5 safe-top">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer"
          aria-label="Ir al inicio"
        >
          <img src="./icon-192.png" alt="" width={40} height={40} className="w-10 h-10 rounded-xl shrink-0" />
          <div className="min-w-0 text-left">
            <span className="block font-display font-extrabold uppercase text-[22px] leading-none tracking-tight">
              Coach <span className="text-ring-red">Gonza</span>
            </span>
            <span className="block text-xs text-zinc-500 font-medium truncate mt-0.5">{profile.gymName}</span>
          </div>
        </button>

        <div className="flex items-center gap-1.5">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              id="header-notifications-btn"
              aria-label={`Recordatorios: ${pendingReminders.length} pendientes`}
              aria-expanded={showNotifications}
              className="w-11 h-11 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center justify-center relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {pendingReminders.length > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-ring-red text-white text-[11px] font-bold rounded-full flex items-center justify-center tabular">
                  {pendingReminders.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.6)] p-3 z-50 text-sm">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
                  <span className="font-display font-bold uppercase text-base tracking-wide">Recordatorios</span>
                  <span className="text-xs text-zinc-400 tabular">{pendingReminders.length} pendientes</span>
                </div>

                {pendingReminders.length === 0 ? (
                  <p className="text-zinc-400 py-3 text-center">No tenés recordatorios pendientes</p>
                ) : (
                  <ul className="max-h-72 overflow-y-auto divide-y divide-zinc-800">
                    {pendingReminders.map(rem => (
                      <li key={rem.id} className="py-2 flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white">{rem.title}</p>
                          {rem.description && <p className="text-zinc-400 text-[13px] mt-0.5 line-clamp-2">{rem.description}</p>}
                          <p className="text-xs text-zinc-400 mt-1 tabular">
                            {formatShortDate(rem.dueDate)} {rem.dueTime ? `· ${rem.dueTime}` : ''}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleReminder(rem.id)}
                          aria-label={`Marcar como hecho: ${rem.title}`}
                          className="w-11 h-11 shrink-0 rounded-xl bg-zinc-800 hover:bg-green-600 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('more')}
            aria-label="Más secciones: noticias, peleas, paquetes, rutinas y ajustes"
            aria-current={onMore ? 'page' : undefined}
            className={`h-11 px-3 rounded-xl flex items-center gap-1.5 text-sm font-semibold cursor-pointer ${
              onMore ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span>Más</span>
          </button>
        </div>
      </div>
    </header>
  );
};
