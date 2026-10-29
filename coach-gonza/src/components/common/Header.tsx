import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Sun, Moon, Plus, Dumbbell, ShieldAlert, Check } from 'lucide-react';
import { formatShortDate } from '../../utils/dateUtils';

export const Header: React.FC = () => {
  const { profile, theme, toggleTheme, reminders, openQuickAdd, toggleReminder } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const pendingReminders = reminders.filter(r => !r.isCompleted);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-red-900/40 text-white px-4 pb-3 safe-top">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Trainer Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-650 via-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-950/50 border border-red-500/30">
            <Dumbbell className="w-5 h-5 text-white transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-lg tracking-tight text-white leading-none">
                Coach <span className="text-red-500">Gonza</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-400 border border-red-800/60 px-1.5 py-0.5 rounded">
                PRO
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-400 font-semibold tracking-wide truncate max-w-[200px] sm:max-w-xs mt-0.5 uppercase">
              {profile.gymName}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          
          {/* Quick Create Button */}
          <button
            onClick={() => openQuickAdd()}
            id="header-quick-add-btn"
            className="flex items-center space-x-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-md transition-all active:scale-95 cursor-pointer border border-red-500/30"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            id="header-theme-toggle-btn"
            className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-700/50"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-300" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              id="header-notifications-btn"
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-700/50 relative"
              title="Recordatorios y Notificaciones"
            >
              <Bell className="w-4 h-4" />
              {pendingReminders.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {pendingReminders.length}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl p-3 z-50 text-xs">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-500" /> Recordatorios Pendientes
                  </span>
                  <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                    {pendingReminders.length}
                  </span>
                </div>

                {pendingReminders.length === 0 ? (
                  <p className="text-zinc-400 py-3 text-center italic">No tienes recordatorios pendientes</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {pendingReminders.map(rem => (
                      <div
                        key={rem.id}
                        className="bg-zinc-800/70 border border-zinc-700/50 rounded-lg p-2.5 flex items-start justify-between gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{rem.title}</p>
                          {rem.description && (
                            <p className="text-zinc-400 text-[11px] line-clamp-2 mt-0.5">{rem.description}</p>
                          )}
                          <p className="text-[10px] text-red-400 font-medium mt-1">
                            📅 {formatShortDate(rem.dueDate)} {rem.dueTime ? `• ${rem.dueTime}` : ''}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleReminder(rem.id)}
                          className="p-1 rounded bg-zinc-700 hover:bg-green-600 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title="Marcar como listo"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
