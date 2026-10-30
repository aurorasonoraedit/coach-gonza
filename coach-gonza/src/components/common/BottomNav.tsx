import React from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, Calendar, Users, DollarSign, Menu } from 'lucide-react';
import { getTodayString } from '../../utils/dateUtils';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, sessions, incomes } = useApp();
  const todayStr = getTodayString();

  const todaySessionsCount = sessions.filter(s => s.date === todayStr && s.status !== 'cancelada').length;
  const pendingPaymentsCount = incomes.filter(i => i.status === 'pendiente').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Inicio',
      icon: LayoutDashboard,
      badge: todaySessionsCount > 0 ? todaySessionsCount : null
    },
    {
      id: 'calendar',
      label: 'Agenda',
      icon: Calendar,
      badge: null
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: Users,
      badge: null
    },
    {
      id: 'finances',
      label: 'Ingresos',
      icon: DollarSign,
      badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : null
    },
    {
      id: 'more',
      label: 'Más',
      icon: Menu,
      badge: null
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800 backdrop-blur-md px-2 pt-1.5 safe-bottom sm:hidden">
      <div className="flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id ||
            (item.id === 'more' && ['more', 'news', 'timer', 'packages', 'events', 'library', 'settings'].includes(activeTab));
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              id={`nav-item-${item.id}`}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-red-500 font-bold bg-zinc-900/80'
                  : 'text-zinc-400 font-medium hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-red-500' : ''} transition-transform`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-extrabold rounded-full px-1 py-0.2 min-w-[14px] text-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
