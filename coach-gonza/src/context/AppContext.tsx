import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Client,
  Session,
  Income,
  PackageService,
  FightEvent,
  Reminder,
  BoxingRoutine,
  TrainerProfile,
  PaymentMethod
} from '../types';
import {
  initialTrainerProfile,
  initialClients,
  initialSessions,
  initialIncomes,
  initialPackages,
  initialEvents,
  initialReminders,
  initialRoutines
} from '../data/initialData';
import { getTodayString } from '../utils/dateUtils';

interface AppContextType {
  profile: TrainerProfile;
  updateProfile: (profile: TrainerProfile) => void;
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, clientData: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  sessions: Session[];
  addSession: (sessionData: Omit<Session, 'id'>) => Session;
  updateSession: (id: string, sessionData: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  duplicateSession: (session: Session) => void;
  markSessionStatus: (id: string, status: Session['status']) => void;
  markSessionPaid: (id: string, paymentMethod?: PaymentMethod) => void;
  incomes: Income[];
  addIncome: (incomeData: Omit<Income, 'id'>) => Income;
  updateIncome: (id: string, incomeData: Partial<Income>) => void;
  deleteIncome: (id: string) => void;
  packages: PackageService[];
  addPackage: (packageData: Omit<PackageService, 'id'>) => PackageService;
  updatePackage: (id: string, packageData: Partial<PackageService>) => void;
  deletePackage: (id: string) => void;
  events: FightEvent[];
  addEvent: (eventData: Omit<FightEvent, 'id'>) => FightEvent;
  updateEvent: (id: string, eventData: Partial<FightEvent>) => void;
  deleteEvent: (id: string) => void;
  reminders: Reminder[];
  addReminder: (reminderData: Omit<Reminder, 'id' | 'isCompleted'>) => Reminder;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  routines: BoxingRoutine[];
  addRoutine: (routineData: Omit<BoxingRoutine, 'id'>) => BoxingRoutine;
  updateRoutine: (id: string, routineData: Partial<BoxingRoutine>) => void;
  deleteRoutine: (id: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  resetToInitialData: () => void;
  clearAllData: () => void;
  restoreBackup: (data: any) => boolean;
  buildBackup: () => object;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  quickAddModalOpen: boolean;
  setQuickAddModalOpen: (open: boolean) => void;
  quickAddDefaultType: 'session' | 'client' | 'income' | 'event' | null;
  openQuickAdd: (type?: 'session' | 'client' | 'income' | 'event') => void;
  closeQuickAdd: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const load = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

// Ingresos: el estado "pagado" es el único válido (versiones viejas guardaban "pagada")
const normalizeIncomes = (list: Income[]): Income[] =>
  list.map(i => (i.status === 'pagada' ? { ...i, status: 'pagado' } : i));

// Perfil real con el que arranca la app (sin datos inventados)
const startProfile: TrainerProfile = {
  ...initialTrainerProfile,
  phone: '',
  email: ''
};

const STORAGE_KEYS = {
  PROFILE: 'boxcoach_profile_v1',
  CLIENTS: 'boxcoach_clients_v1',
  SESSIONS: 'boxcoach_sessions_v1',
  INCOMES: 'boxcoach_incomes_v1',
  PACKAGES: 'boxcoach_packages_v1',
  EVENTS: 'boxcoach_events_v1',
  REMINDERS: 'boxcoach_reminders_v1',
  ROUTINES: 'boxcoach_routines_v1',
  THEME: 'boxcoach_theme_v1'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from localStorage or defaults
  const [profile, setProfileState] = useState<TrainerProfile>(() => load(STORAGE_KEYS.PROFILE, startProfile as TrainerProfile));

  const [clients, setClients] = useState<Client[]>(() => load(STORAGE_KEYS.CLIENTS, [] as Client[]));

  const [sessions, setSessions] = useState<Session[]>(() => load(STORAGE_KEYS.SESSIONS, [] as Session[]));

  const [incomes, setIncomes] = useState<Income[]>(() => normalizeIncomes(load(STORAGE_KEYS.INCOMES, [] as Income[])));

  const [packages, setPackages] = useState<PackageService[]>(() => load(STORAGE_KEYS.PACKAGES, initialPackages as PackageService[]));

  const [events, setEvents] = useState<FightEvent[]>(() => load(STORAGE_KEYS.EVENTS, [] as FightEvent[]));

  const [reminders, setReminders] = useState<Reminder[]>(() => load(STORAGE_KEYS.REMINDERS, [] as Reminder[]));

  const [routines, setRoutines] = useState<BoxingRoutine[]>(() => load(STORAGE_KEYS.ROUTINES, initialRoutines as BoxingRoutine[]));

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return (saved as 'dark' | 'light') || 'dark';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [quickAddModalOpen, setQuickAddModalOpen] = useState<boolean>(false);
  const [quickAddDefaultType, setQuickAddDefaultType] = useState<'session' | 'client' | 'income' | 'event' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3000);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const updateProfile = (newProfile: TrainerProfile) => {
    setProfileState(newProfile);
    showToast('Perfil de entrenador actualizado');
  };

  // Client actions
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: `c-${Date.now()}`,
      createdAt: getTodayString(),
      totalSessionsCompleted: clientData.totalSessionsCompleted || 0
    };
    setClients(prev => [newClient, ...prev]);
    showToast(`Cliente ${newClient.name} agregado`);
    return newClient;
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...clientData } : c));
    showToast('Datos del cliente actualizados');
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    showToast('Cliente eliminado');
  };

  // Session actions
  const addSession = (sessionData: Omit<Session, 'id'>): Session => {
    const newSession: Session = {
      ...sessionData,
      id: `s-${Date.now()}`
    };

    setSessions(prev => [newSession, ...prev]);

    // If paid, create income record automatically
    if (newSession.paymentStatus === 'pagada' && newSession.price > 0) {
      const newIncome: Income = {
        id: `inc-${Date.now()}`,
        date: newSession.date,
        clientId: newSession.clientId,
        clientName: newSession.clientName || 'Cliente',
        concept: `Sesión: ${newSession.title}`,
        amount: newSession.price,
        paymentMethod: 'efectivo',
        status: 'pagado',
        sessionId: newSession.id
      };
      setIncomes(prev => [newIncome, ...prev]);
    } else if (newSession.paymentStatus === 'pendiente' && newSession.price > 0) {
      // Create pending income entry
      const newIncome: Income = {
        id: `inc-${Date.now()}`,
        date: newSession.date,
        clientId: newSession.clientId,
        clientName: newSession.clientName || 'Cliente',
        concept: `Sesión: ${newSession.title}`,
        amount: newSession.price,
        paymentMethod: 'efectivo',
        status: 'pendiente',
        sessionId: newSession.id
      };
      setIncomes(prev => [newIncome, ...prev]);

      // Add payment reminder
      const newRem: Reminder = {
        id: `rem-${Date.now()}`,
        title: `Cobrar a ${newSession.clientName || 'Cliente'} (${profile.currencySymbol}${newSession.price})`,
        description: `Sesión ${newSession.title} del ${newSession.date}`,
        dueDate: newSession.date,
        dueTime: newSession.startTime,
        type: 'pago',
        targetId: newSession.id,
        isCompleted: false
      };
      setReminders(prev => [newRem, ...prev]);
    }

    showToast('Sesión agendada exitosamente');
    return newSession;
  };

  const updateSession = (id: string, sessionData: Partial<Session>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...sessionData } : s));
    showToast('Sesión actualizada');
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    // Also remove linked pending income if any
    setIncomes(prev => prev.filter(inc => inc.sessionId !== id || inc.status === 'pagado'));
    showToast('Sesión eliminada');
  };

  const duplicateSession = (session: Session) => {
    // Add 7 days to date by default
    const [year, month, day] = session.date.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + 7);
    const nextDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    addSession({
      ...session,
      date: nextDateStr,
      status: 'programada',
      paymentStatus: 'pendiente',
      paidAmount: 0
    });
    showToast(`Sesión duplicada para el ${nextDateStr}`);
  };

  const markSessionStatus = (id: string, status: Session['status']) => {
    const s = sessions.find(x => x.id === id);
    if (!s) return;

    // Solo descuenta del paquete la primera vez que se completa
    if (status === 'completada' && s.status !== 'completada' && s.clientId) {
      setClients(prevClients => prevClients.map(c => {
        if (c.id !== s.clientId) return c;
        return {
          ...c,
          totalSessionsCompleted: (c.totalSessionsCompleted || 0) + 1,
          sessionsRemaining: c.sessionsRemaining && c.sessionsRemaining > 0 ? c.sessionsRemaining - 1 : 0
        };
      }));
    }
    setSessions(prev => prev.map(x => (x.id === id ? { ...x, status } : x)));
    showToast(`Sesión marcada como ${status}`);
  };

  const markSessionPaid = (id: string, paymentMethod: PaymentMethod = 'efectivo') => {
    const s = sessions.find(x => x.id === id);
    if (!s) return;

    setIncomes(prevIncomes => {
      const existing = prevIncomes.find(inc => inc.sessionId === id);
      if (existing) {
        return prevIncomes.map(inc => inc.sessionId === id ? { ...inc, status: 'pagado', paymentMethod } : inc);
      }
      return [{
        id: `inc-${Date.now()}`,
        date: s.date,
        clientId: s.clientId,
        clientName: s.clientName || 'Cliente',
        concept: `Sesión: ${s.title}`,
        amount: s.price,
        paymentMethod,
        status: 'pagado',
        sessionId: id
      }, ...prevIncomes];
    });
    setReminders(prevRem => prevRem.map(r => r.targetId === id ? { ...r, isCompleted: true } : r));
    setSessions(prev => prev.map(x => (x.id === id ? { ...x, paymentStatus: 'pagada', paidAmount: x.price } : x)));
    showToast('Pago registrado correctamente');
  };

  // Income actions
  const addIncome = (incomeData: Omit<Income, 'id'>): Income => {
    const newIncome: Income = {
      ...incomeData,
      id: `inc-${Date.now()}`
    };
    setIncomes(prev => [newIncome, ...prev]);
    showToast('Ingreso registrado');
    return newIncome;
  };

  const updateIncome = (id: string, incomeData: Partial<Income>) => {
    setIncomes(prev => prev.map(inc => inc.id === id ? { ...inc, ...incomeData } : inc));
    showToast('Ingreso actualizado');
  };

  const deleteIncome = (id: string) => {
    setIncomes(prev => prev.filter(inc => inc.id !== id));
    showToast('Registro de ingreso eliminado');
  };

  // Packages actions
  const addPackage = (packageData: Omit<PackageService, 'id'>): PackageService => {
    const newPkg: PackageService = {
      ...packageData,
      id: `pkg-${Date.now()}`
    };
    setPackages(prev => [newPkg, ...prev]);
    showToast(`Paquete ${newPkg.name} creado`);
    return newPkg;
  };

  const updatePackage = (id: string, packageData: Partial<PackageService>) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, ...packageData } : p));
    showToast('Paquete actualizado');
  };

  const deletePackage = (id: string) => {
    setPackages(prev => prev.filter(p => p.id !== id));
    showToast('Paquete eliminado');
  };

  // Events actions
  const addEvent = (eventData: Omit<FightEvent, 'id'>): FightEvent => {
    const newEvent: FightEvent = {
      ...eventData,
      id: `evt-${Date.now()}`
    };
    setEvents(prev => [newEvent, ...prev]);

    // Create a reminder if date is set
    const newRem: Reminder = {
      id: `rem-${Date.now()}`,
      title: `Evento: ${newEvent.title}`,
      description: `${newEvent.location} - ${newEvent.time}`,
      dueDate: newEvent.date,
      dueTime: newEvent.time,
      type: 'pelea',
      targetId: newEvent.id,
      isCompleted: false
    };
    setReminders(prev => [newRem, ...prev]);

    showToast('Evento agendado');
    return newEvent;
  };

  const updateEvent = (id: string, eventData: Partial<FightEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...eventData } : e));
    showToast('Evento actualizado');
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    showToast('Evento eliminado');
  };

  // Reminder actions
  const addReminder = (reminderData: Omit<Reminder, 'id' | 'isCompleted'>): Reminder => {
    const newRem: Reminder = {
      ...reminderData,
      id: `rem-${Date.now()}`,
      isCompleted: false
    };
    setReminders(prev => [newRem, ...prev]);
    showToast('Recordatorio creado');
    return newRem;
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, isCompleted: !r.isCompleted } : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    showToast('Recordatorio eliminado');
  };

  // Routine actions
  const addRoutine = (routineData: Omit<BoxingRoutine, 'id'>): BoxingRoutine => {
    const newRot: BoxingRoutine = {
      ...routineData,
      id: `rot-${Date.now()}`
    };
    setRoutines(prev => [newRot, ...prev]);
    showToast('Rutina creada');
    return newRot;
  };

  const updateRoutine = (id: string, routineData: Partial<BoxingRoutine>) => {
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...routineData } : r));
    showToast('Rutina actualizada');
  };

  const deleteRoutine = (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    showToast('Rutina eliminada');
  };

  // Reset to initial demo data
  const resetToInitialData = () => {
    setProfileState(initialTrainerProfile);
    setClients(initialClients);
    setSessions(initialSessions);
    setIncomes(initialIncomes);
    setPackages(initialPackages);
    setEvents(initialEvents);
    setReminders(initialReminders);
    setRoutines(initialRoutines);
    showToast('Datos de ejemplo cargados');
  };

  const clearAllData = () => {
    setClients([]);
    setSessions([]);
    setIncomes([]);
    setEvents([]);
    setReminders([]);
    showToast('Datos borrados. ¡A empezar de cero!');
  };

  const buildBackup = () => ({
    app: 'BoxCoach',
    version: 2,
    exportDate: new Date().toISOString(),
    profile, clients, sessions, incomes, packages, events, reminders, routines
  });

  const restoreBackup = (data: any): boolean => {
    if (!data || typeof data !== 'object' || !Array.isArray(data.sessions) || !Array.isArray(data.clients)) {
      return false;
    }
    if (data.profile) setProfileState(data.profile);
    setClients(data.clients);
    setSessions(data.sessions);
    if (Array.isArray(data.incomes)) setIncomes(normalizeIncomes(data.incomes));
    if (Array.isArray(data.packages)) setPackages(data.packages);
    if (Array.isArray(data.events)) setEvents(data.events);
    if (Array.isArray(data.reminders)) setReminders(data.reminders);
    if (Array.isArray(data.routines)) setRoutines(data.routines);
    showToast('Copia de seguridad restaurada');
    return true;
  };

  const openQuickAdd = (type?: 'session' | 'client' | 'income' | 'event') => {
    setQuickAddDefaultType(type || 'session');
    setQuickAddModalOpen(true);
  };

  const closeQuickAdd = () => {
    setQuickAddModalOpen(false);
    setQuickAddDefaultType(null);
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        updateProfile,
        clients,
        addClient,
        updateClient,
        deleteClient,
        sessions,
        addSession,
        updateSession,
        deleteSession,
        duplicateSession,
        markSessionStatus,
        markSessionPaid,
        incomes,
        addIncome,
        updateIncome,
        deleteIncome,
        packages,
        addPackage,
        updatePackage,
        deletePackage,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        reminders,
        addReminder,
        toggleReminder,
        deleteReminder,
        routines,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        theme,
        toggleTheme,
        resetToInitialData,
        clearAllData,
        restoreBackup,
        buildBackup,
        activeTab,
        setActiveTab,
        quickAddModalOpen,
        setQuickAddModalOpen,
        quickAddDefaultType,
        openQuickAdd,
        closeQuickAdd,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
