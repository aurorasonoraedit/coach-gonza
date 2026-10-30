import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { QuickAddModal } from './components/common/QuickAddModal';
import { Toast } from './components/common/Toast';
import { PayMethodModal } from './components/common/PayMethodModal';

import { DashboardView } from './components/dashboard/DashboardView';
import { CalendarView } from './components/calendar/CalendarView';
import { ClientsView } from './components/clients/ClientsView';
import { FinancesView } from './components/finances/FinancesView';
import { PackagesView } from './components/packages/PackagesView';
import { EventsView } from './components/events/EventsView';
import { BoxingLibraryView } from './components/library/BoxingLibraryView';
import { SettingsView } from './components/settings/SettingsView';
import { MoreView } from './components/more/MoreView';
import { NewsView } from './components/news/NewsView';
import { RoundTimerView } from './components/timer/RoundTimerView';

import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  Package,
  Swords,
  BookOpen,
  Settings,
  Menu,
  Newspaper,
  Timer
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, theme } = useApp();

  const desktopNavItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'calendar', label: 'Agenda', icon: Calendar },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'finances', label: 'Ingresos', icon: DollarSign },
    { id: 'packages', label: 'Paquetes', icon: Package },
    { id: 'events', label: 'Combates', icon: Swords },
    { id: 'timer', label: 'Timer', icon: Timer },
    { id: 'library', label: 'Biblioteca', icon: BookOpen },
    { id: 'news', label: 'Noticias', icon: Newspaper },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'calendar':
        return <CalendarView />;
      case 'clients':
        return <ClientsView />;
      case 'finances':
        return <FinancesView />;
      case 'packages':
        return <PackagesView />;
      case 'events':
        return <EventsView />;
      case 'library':
        return <BoxingLibraryView />;
      case 'settings':
        return <SettingsView />;
      case 'timer':
        return <RoundTimerView />;
      case 'news':
        return <NewsView />;
      case 'more':
        return <MoreView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-[#0A0A0B] text-zinc-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans transition-colors duration-200 selection:bg-red-500 selection:text-white pb-nav sm:pb-8`}>
      {/* Header */}
      <Header />

      {/* Desktop Navigation Sub-Header */}
      <div className="hidden sm:block bg-zinc-900/90 dark:bg-zinc-950/90 border-b border-zinc-800/80 sticky top-[57px] z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-1 overflow-x-auto py-1.5 scrollbar-none">
          {desktopNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                id={`desktop-nav-${item.id}`}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-950/40 border border-red-500/40'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {renderView()}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Quick Add Modal */}
      <QuickAddModal />

      {/* Toast Notification */}
      <PayMethodModal />

      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
