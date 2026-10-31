import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { QuickAddModal } from './components/common/QuickAddModal';
import { Toast } from './components/common/Toast';
import { PayMethodModal } from './components/common/PayMethodModal';
import { ConfirmDialog } from './components/common/ConfirmDialog';

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
import { CornerView } from './components/events/CornerView';
import { RivalModal } from './components/events/RivalModal';

import {
  Home,
  CalendarDays,
  Users,
  Wallet,
  Package,
  Swords,
  BookOpen,
  Settings,
  Newspaper,
  Timer,
  ChevronLeft
} from 'lucide-react';

// Secciones que viven dentro de "Más": muestran un "volver a Más" arriba
const MORE_SECTIONS: Record<string, string> = {
  news: 'Noticias',
  events: 'Peleas',
  packages: 'Paquetes',
  library: 'Rutinas',
  settings: 'Ajustes'
};

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, events, cornerEventId, setCornerEventId, rivalEditEventId, setRivalEditEventId } = useApp();
  const cornerEvent = events.find(e => e.id === cornerEventId);
  useEffect(() => { window.scrollTo(0, 0); }, [activeTab]);
  const rivalEvent = events.find(e => e.id === rivalEditEventId);

  const desktopNavItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'calendar', label: 'Agenda', icon: CalendarDays },
    { id: 'timer', label: 'Timer', icon: Timer },
    { id: 'clients', label: 'Alumnos', icon: Users },
    { id: 'finances', label: 'Plata', icon: Wallet },
    { id: 'events', label: 'Peleas', icon: Swords },
    { id: 'packages', label: 'Paquetes', icon: Package },
    { id: 'library', label: 'Rutinas', icon: BookOpen },
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
    <div className="min-h-screen dark bg-zinc-950 text-zinc-100 flex flex-col font-sans pb-nav sm:pb-8">
      {/* Header */}
      <Header />

      {/* Desktop Navigation Sub-Header */}
      <div className="hidden sm:block bg-zinc-950/95 border-b border-zinc-800 sticky top-[64px] z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-1 overflow-x-auto py-1.5 scrollbar-none">
          {desktopNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                id={`desktop-nav-${item.id}`}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center space-x-2 px-3.5 h-11 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  isActive ? 'bg-ring-red text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {MORE_SECTIONS[activeTab] && (
          <button
            onClick={() => setActiveTab('more')}
            className="sm:hidden -ml-2 mb-2 h-11 pr-3 pl-1 rounded-xl flex items-center gap-1 text-sm font-semibold text-zinc-400 hover:text-white cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" /> Más
          </button>
        )}
        {renderView()}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Quick Add Modal */}
      <QuickAddModal />

      {/* Toast Notification */}
      <PayMethodModal />

      {cornerEvent && (
        <CornerView
          event={cornerEvent}
          onClose={() => setCornerEventId(null)}
          onEditRival={() => setRivalEditEventId(cornerEvent.id)}
        />
      )}

      {rivalEvent && <RivalModal event={rivalEvent} onClose={() => setRivalEditEventId(null)} />}

      <ConfirmDialog />

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
