export type SessionType = 
  | 'boxeo' 
  | 'personalizado' 
  | 'grupal' 
  | 'preparacion_fisica' 
  | 'sparring' 
  | 'tecnica' 
  | 'defensa_personal' 
  | 'examen';

export type SessionStatus = 'programada' | 'completada' | 'cancelada';
export type PaymentStatus = 'pagada' | 'pagado' | 'pendiente' | 'parcial';

export type ClientLevel = 'principiante' | 'intermedio' | 'avanzado' | 'competidor';
export type ClientGoal = 'perder_peso' | 'tecnica' | 'competencia' | 'defensa_personal' | 'condicion_fisica';

// 'tarjeta', 'bizum_zelle' y 'otro' quedan solo por compatibilidad con datos viejos
export type PaymentMethod = 'efectivo' | 'transferencia' | 'mercadopago' | 'tarjeta' | 'bizum_zelle' | 'otro';

export type EventType = 'pelea' | 'competencia' | 'seminario' | 'examen' | 'campamento' | 'personal';

export interface Client {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  level: ClientLevel;
  goal: ClientGoal;
  notes?: string;
  packageId?: string; // Optional active package
  sessionsRemaining?: number; // For package tracking
  totalSessionsCompleted?: number;
  avatarUrl?: string;
  createdAt: string;
  targetWeight?: number; // kg (peso objetivo / categoría para pesaje)
  weightClass?: string; // ej. "Welter 69 kg"
}

export interface Session {
  id: string;
  title: string;
  sessionType: SessionType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  clientId?: string;
  clientName?: string;
  location: string;
  status: SessionStatus;
  paymentStatus: PaymentStatus;
  price: number;
  paidAmount?: number;
  notes?: string;
  routineId?: string;
  reminderMinutesBefore?: number; // e.g., 15, 30, 60, 1440 (1 day)
  isRecurring?: boolean;
  recurringDays?: number[]; // 0 = Sun, 1 = Mon...
}

export interface Income {
  id: string;
  date: string; // YYYY-MM-DD
  clientId?: string;
  clientName: string;
  concept: string; // e.g. "Clase Individual", "Paquete 8 Sesiones", "Venta Guantes 14oz"
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  sessionId?: string;
  packageId?: string;
  notes?: string;
}

export interface PackageService {
  id: string;
  name: string;
  price: number;
  sessionCount: number; // e.g. 1 for single class, 8 for package
  validityDays?: number; // e.g. 30 days
  description: string;
  category: 'individual' | 'paquete' | 'mensualidad' | 'especial';
}

export interface FightEvent {
  id: string;
  title: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  participantOrClient?: string;
  notes?: string;
  isImportant?: boolean;
  cornerNotes?: string; // Táctica / Estrategia de la esquina
  rival?: Rival;
}

export type Stance = 'ortodoxo' | 'zurdo' | 'cambia';

/** Ficha de scouting del rival de una pelea */
export interface Rival {
  name: string;
  nickname?: string;
  wins?: number;
  losses?: number;
  draws?: number;
  kos?: number;
  gym?: string;
  city?: string;
  stance?: Stance;
  age?: number;
  height?: number; // cm
  level?: number; // 1 a 5: calidad estimada
  styles?: string[];
  strengths?: string;
  weaknesses?: string;
  notes?: string;
  boxrecUrl?: string;
  videoUrl?: string;
  instagram?: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  type: 'sesion' | 'pago' | 'pelea' | 'general';
  targetId?: string;
  isCompleted: boolean;
}

export interface BoxingRoutine {
  id: string;
  title: string;
  level: ClientLevel;
  durationMinutes: number;
  combos: string[]; // e.g. ["1-2-Jab-Cross", "1-2-3 Roll-2 Hook"]
  drills: string[];
  physicalPrep: string[];
  notes?: string;
}

export interface TrainerProfile {
  name: string;
  nickname?: string; // cómo lo saluda la app (ej. "Gonza")
  handle?: string;
  gymName: string;
  coTrainer?: string;
  philosophy?: string;
  sponsors?: string[];
  highlights?: string[];
  phone: string;
  email: string;
  currencySymbol: string;
  defaultSessionDurationMinutes: number;
  workStartTime: string;
  workEndTime: string;
  acceptedPaymentMethods: PaymentMethod[];
}

export type ExpenseCategory =
  | 'alquiler'
  | 'equipamiento'
  | 'transporte'
  | 'federacion'
  | 'publicidad'
  | 'servicios'
  | 'otro';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  concept: string;
  category: ExpenseCategory;
  amount: number;
  notes?: string;
}

export interface ProgressEntry {
  id: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  weight?: number; // kg
  notes?: string;
}
