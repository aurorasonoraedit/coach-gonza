import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, CalendarDays, Users, Wallet, Timer } from 'lucide-react';

type Item = { id: string; label: string; icon: React.ElementType; badge?: number | null };

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, incomes } = useApp();
  const pendingPaymentsCount = incomes.filter(i => i.status === 'pendiente').length;

  const left: Item[] = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'calendar', label: 'Agenda', icon: CalendarDays }
  ];
  const right: Item[] = [
    { id: 'clients', label: 'Alumnos', icon: Users },
    { id: 'finances', label: 'Plata', icon: Wallet, badge: pendingPaymentsCount || null }
  ];

  const Tab: React.FC<{ item: Item }> = ({ item }) => {
    const Icon = item.icon;
    const active = activeTab === item.id;
    return (
      <button
        onClick={() => setActiveTab(item.id)}
        id={`nav-item-${item.id}`}
        aria-current={active ? 'page' : undefined}
        className={`flex-1 h-14 flex flex-col items-center justify-center gap-1 cursor-pointer relative ${
          active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <span className="relative">
          <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.4 : 2} />
          {item.badge ? (
            <span
              className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center tabular"
              aria-label={`${item.badge} cobros pendientes`}
            >
              {item.badge}
            </span>
          ) : null}
        </span>
        <span className={`text-[11px] leading-none ${active ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
        {active && <span className="absolute top-0 inset-x-5 h-[3px] rounded-b bg-ring-red" />}
      </button>
    );
  };

  const timerActive = activeTab === 'timer';

  return (
    <nav
      aria-label="Secciones principales"
      className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800 backdrop-blur-md px-1 safe-bottom sm:hidden"
    >
      <div className="flex items-end">
        {left.map(i => <Tab key={i.id} item={i} />)}
        <div className="flex-1 flex justify-center">
          <button
            onClick={() => setActiveTab('timer')}
            id="nav-item-timer"
            aria-label="Timer de rounds"
            aria-current={timerActive ? 'page' : undefined}
            className={`-mt-5 w-[60px] h-[60px] rounded-full flex flex-col items-center justify-center gap-0.5 text-white cursor-pointer active:scale-95 transition-transform shadow-[0_6px_18px_rgba(229,32,46,0.35)] border-4 border-zinc-950 ${
              timerActive ? 'bg-ring-red-deep' : 'bg-ring-red'
            }`}
          >
            <Timer className="w-6 h-6" strokeWidth={2.4} />
            <span className="text-[10px] font-bold leading-none uppercase tracking-wide">Timer</span>
          </button>
        </div>
        {right.map(i => <Tab key={i.id} item={i} />)}
      </div>
    </nav>
  );
};
