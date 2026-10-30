import { Client, Session, Income, PackageService, FightEvent, Reminder, BoxingRoutine, TrainerProfile, Expense, ProgressEntry } from '../types';

// Fecha "de hoy" de los datos de ejemplo: al cargarlos se corren para que coincidan con el día actual
export const DEMO_TODAY = '2026-08-05';

export const initialTrainerProfile: TrainerProfile = {
  name: "Gonzalo Palma Oviedo",
  nickname: "Gonza",
  handle: "@palma_gon",
  gymName: "Entrenador de boxeo",
  coTrainer: "",
  philosophy: "Reforzando la muralla: Disciplina, Sparring, Acondicionamiento Riguroso y Técnica de Combate",
  sponsors: ["Huracán Premium"],
  highlights: [
    "Entrenador de boxeo independiente: clases personalizadas y grupales",
    "Exhibición especial de difusión de boxeo en Canal Olga (Streaming)",
    "Formación integral de boxeadores recreativos y salto al circuito amateur",
    "Partner de equipamiento técnico Huracán Premium"
  ],
  phone: "+54 11 4791-0000",
  email: "",
  currencySymbol: "$",
  defaultSessionDurationMinutes: 60,
  workStartTime: "08:00",
  workEndTime: "21:30",
  acceptedPaymentMethods: ["efectivo", "transferencia", "mercadopago"]
};

export const initialPackages: PackageService[] = [
  {
    id: "pkg-1",
    name: "Clase Individual 1-a-1",
    price: 3500,
    sessionCount: 1,
    validityDays: 7,
    description: "Sesión personal de 60 min (Técnica de combate, Manoplas y trabajo táctico con Gonzalo Palma)",
    category: "individual"
  },
  {
    id: "pkg-2",
    name: "Bono 8 Sesiones Sparring & Técnica",
    price: 24000,
    sessionCount: 8,
    validityDays: 45,
    description: "8 clases personalizadas con corrección técnica 'Reforzando la Muralla' + acondicionamiento riguroso",
    category: "paquete"
  },
  {
    id: "pkg-3",
    name: "Mensualidad Recreativos",
    price: 12000,
    sessionCount: 12,
    validityDays: 30,
    description: "Acceso a clases de boxeo recreativo y acondicionamiento físico riguroso (3 clases por semana)",
    category: "mensualidad"
  },
  {
    id: "pkg-4",
    name: "Campamento Amateur",
    price: 45000,
    sessionCount: 16,
    validityDays: 30,
    description: "Preparación intensiva para el salto al circuito amateur: sparring guiado, rincón táctico y pesaje con Gonza Palma",
    category: "especial"
  }
];

export const initialClients: Client[] = [
  {
    id: "c-1",
    name: "Mateo 'El Calamar' Rossi",
    targetWeight: 64,
    weightClass: "Superligero 63,5 kg",
    phone: "+54 11 5544 3322",
    whatsapp: "541155443322",
    email: "mateo.rossi@ejemplo.com",
    level: "competidor",
    goal: "competencia",
    notes: "Pelea amateur en 2 semanas. Trabajar alcance con jab, postura cerrada ('Reforzando la muralla') y pivote de izquierda.",
    packageId: "pkg-4",
    sessionsRemaining: 10,
    totalSessionsCompleted: 14,
    createdAt: "2026-06-10"
  },
  {
    id: "c-2",
    name: "Valentina 'Valu' Benítez",
    phone: "+54 11 8765 4321",
    whatsapp: "541187654321",
    email: "valu.benitez@gmail.com",
    level: "intermedio",
    goal: "condicion_fisica",
    notes: "Excelente resistencia aeróbica. Le gusta trabajo de saco pesado con guantes Huracán Premium y combinaciones 1-2-3.",
    packageId: "pkg-2",
    sessionsRemaining: 4,
    totalSessionsCompleted: 12,
    createdAt: "2026-07-01"
  },
  {
    id: "c-3",
    name: "Joaquín 'Juaco' Peralta",
    phone: "+54 11 4455 6677",
    whatsapp: "541144556677",
    level: "competidor",
    goal: "competencia",
    notes: "Preparando salto al circuito amateur. Ajustar guardia alta y respuesta tras contragolpe.",
    packageId: "pkg-4",
    sessionsRemaining: 6,
    totalSessionsCompleted: 18,
    createdAt: "2026-05-20"
  },
  {
    id: "c-4",
    name: "Grupo Recreativos (Turno Tarde)",
    phone: "+54 11 9988 7766",
    level: "intermedio",
    goal: "condicion_fisica",
    notes: "Clase grupal en el gimnasio. Acondicionamiento físico riguroso, escuela de combate y manoplas.",
    packageId: "pkg-3",
    sessionsRemaining: 6,
    totalSessionsCompleted: 18,
    createdAt: "2026-05-15"
  },
  {
    id: "c-5",
    name: "Luciano 'Lucho' Ferrari",
    phone: "+54 11 3322 1100",
    whatsapp: "541133221100",
    level: "principiante",
    goal: "tecnica",
    notes: "Iniciándose en boxeo recreativo. Enfocado en postura, desplazamiento de pies y guardia alta.",
    packageId: "pkg-1",
    sessionsRemaining: 1,
    totalSessionsCompleted: 3,
    createdAt: "2026-07-20"
  }
];

export const initialSessions: Session[] = [
  {
    id: "s-1",
    title: "Sparring & Escuela de Combate - Mateo Rossi",
    sessionType: "sparring",
    date: "2026-08-05", // Today
    startTime: "08:00",
    endTime: "09:00",
    clientId: "c-1",
    clientName: "Mateo 'El Calamar' Rossi",
    location: "Ring Principal",
    status: "completada",
    paymentStatus: "pagada",
    price: 3500,
    paidAmount: 3500,
    notes: "Excelente trabajo de sparring defensivo 'Reforzando la muralla' y pivote al salir del encordonado.",
    reminderMinutesBefore: 30
  },
  {
    id: "s-2",
    title: "Entrenamiento Personalizado - Valu Benítez",
    sessionType: "personalizado",
    date: "2026-08-05", // Today
    startTime: "10:30",
    endTime: "11:30",
    clientId: "c-2",
    clientName: "Valentina 'Valu' Benítez",
    location: "Gimnasio",
    status: "programada",
    paymentStatus: "pagada",
    price: 3000,
    paidAmount: 3000,
    notes: "Circuito de manoplas Huracán Premium, saco pesado y 15 min de acondicionamiento de zona media.",
    reminderMinutesBefore: 15
  },
  {
    id: "s-3",
    title: "Clase Grupal Recreativos",
    sessionType: "grupal",
    date: "2026-08-05", // Today
    startTime: "18:00",
    endTime: "19:00",
    clientId: "c-4",
    clientName: "Grupo Recreativos (Turno Tarde)",
    location: "Gimnasio",
    status: "programada",
    paymentStatus: "pagada",
    price: 6000,
    paidAmount: 6000,
    notes: "Tabata 20s/10s + 6 rounds de combinación táctica.",
    reminderMinutesBefore: 60
  },
  {
    id: "s-4",
    title: "Técnica de Guardia y Desplazamiento - Lucho Ferrari",
    sessionType: "tecnica",
    date: "2026-08-06", // Tomorrow
    startTime: "09:00",
    endTime: "10:00",
    clientId: "c-5",
    clientName: "Luciano 'Lucho' Ferrari",
    location: "Gimnasio",
    status: "programada",
    paymentStatus: "pendiente",
    price: 3500,
    paidAmount: 0,
    notes: "Cobro pendiente de sesión individual al finalizar.",
    reminderMinutesBefore: 30
  },
  {
    id: "s-5",
    title: "Estrategia Rincón Amateur - Joaquín Peralta",
    sessionType: "tecnica",
    date: "2026-08-06", // Tomorrow
    startTime: "16:30",
    endTime: "17:30",
    clientId: "c-3",
    clientName: "Joaquín 'Juaco' Peralta",
    location: "Ring Principal",
    status: "programada",
    paymentStatus: "pagada",
    price: 3500,
    paidAmount: 3500,
    notes: "Análisis técnico de rivales para el circuito amateur (Gonza Palma).",
    reminderMinutesBefore: 60
  },
  {
    id: "s-6",
    title: "Manopleo Pro e Intensidad - Valu Benítez",
    sessionType: "personalizado",
    date: "2026-08-07",
    startTime: "11:00",
    endTime: "12:00",
    clientId: "c-2",
    clientName: "Valentina 'Valu' Benítez",
    location: "Gimnasio",
    status: "programada",
    paymentStatus: "pagada",
    price: 3000,
    paidAmount: 3000,
    reminderMinutesBefore: 15
  },
  {
    id: "s-7",
    title: "Sesión Técnica de Pasos de Costado y Contragolpe",
    sessionType: "tecnica",
    date: "2026-08-04", // Yesterday
    startTime: "08:00",
    endTime: "09:00",
    clientId: "c-1",
    clientName: "Mateo 'El Calamar' Rossi",
    location: "el gimnasio",
    status: "completada",
    paymentStatus: "pagada",
    price: 3500,
    paidAmount: 3500,
    notes: "Completada sin inconvenientes con corrección en rincón."
  }
];

export const initialIncomes: Income[] = [
  {
    id: "inc-1",
    date: "2026-08-05",
    clientId: "c-1",
    clientName: "Mateo 'El Calamar' Rossi",
    concept: "Sesión Sparring & Manoplas",
    amount: 3500,
    paymentMethod: "efectivo",
    status: "pagado",
    sessionId: "s-1",
    notes: "Pago recibido en efectivo en el gimnasio"
  },
  {
    id: "inc-2",
    date: "2026-08-05",
    clientId: "c-2",
    clientName: "Valentina 'Valu' Benítez",
    concept: "Sesión Personalizada (Bono 8)",
    amount: 3000,
    paymentMethod: "mercadopago",
    status: "pagado",
    sessionId: "s-2",
    notes: "Transferencia bancaria al alias del club"
  },
  {
    id: "inc-3",
    date: "2026-08-04",
    clientId: "c-3",
    clientName: "Joaquín 'Juaco' Peralta",
    concept: "Renovación Campamento Amateur",
    amount: 45000,
    paymentMethod: "transferencia",
    status: "pagado",
    packageId: "pkg-4",
    notes: "Pago del mes de preparación para el circuito amateur"
  },
  {
    id: "inc-4",
    date: "2026-08-02",
    clientId: "c-4",
    clientName: "Grupo Recreativos (Turno Tarde)",
    concept: "Mensualidad Grupal Boxeo Recreativo Agosto",
    amount: 12000,
    paymentMethod: "transferencia",
    status: "pagado",
    packageId: "pkg-3"
  },
  {
    id: "inc-5",
    date: "2026-08-01",
    clientId: "c-2",
    clientName: "Valentina 'Valu' Benítez",
    concept: "Bono 8 Sesiones Sparring & Técnica",
    amount: 24000,
    paymentMethod: "mercadopago",
    status: "pagado",
    packageId: "pkg-2"
  },
  {
    id: "inc-6",
    date: "2026-08-06",
    clientId: "c-5",
    clientName: "Luciano 'Lucho' Ferrari",
    concept: "Sesión Individual Técnica Guardia",
    amount: 3500,
    paymentMethod: "efectivo",
    status: "pendiente",
    sessionId: "s-4",
    notes: "Sesión agendada para mañana, cobro al finalizar"
  }
];

export const initialEvents: FightEvent[] = [
  {
    id: "evt-1",
    title: "Exhibición de Difusión de Boxeo en Canal Olga Streaming",
    type: "seminario",
    date: "2026-08-18",
    time: "15:00",
    location: "Estudios Canal Olga (Streaming Live)",
    participantOrClient: "Gonzalo Palma Oviedo (@palma_gon)",
    notes: "Exhibición especial de técnicas de boxeo, sparring controlado y promoción de sus clases de boxeo.",
    isImportant: true,
    cornerNotes: "Llevar guantes y cabezales Huracán Premium. Demostración de manopla dinámica y escuela de combate."
  },
  {
    id: "evt-2",
    title: "Velada Amateur FEB (Combate Mateo Rossi - 64kg)",
    type: "pelea",
    date: "2026-08-22",
    time: "19:00",
    location: "Estadio FAP / Circuito Amateur",
    participantOrClient: "Mateo Rossi (Vs. J. Ramírez 64kg) — Rincón Palma",
    notes: "Pesaje oficial a las 10:00 AM. Control estricto de hidratación y vendaje oficial.",
    isImportant: true,
    cornerNotes: "Rival con alcance largo. Aplicar 'Reforzando la muralla': achicar distancia con cruzados abajo y paso al costado.",
    rival: {
      name: "Julián Ramírez",
      nickname: "El Flaco",
      wins: 9,
      losses: 3,
      draws: 1,
      kos: 4,
      gym: "Club Atlético Unión",
      city: "Campana",
      stance: "zurdo",
      age: 21,
      height: 181,
      level: 4,
      styles: ["Boxeador de distancia", "Buen jab", "Buenas piernas"],
      strengths: "Jab largo y rápido, se mueve bien hacia su izquierda.",
      weaknesses: "Baja la derecha cuando tira el cross. Se incomoda si lo presionan contra las cuerdas.",
      notes: "Perdió sus 3 peleas contra presionadores. Viene de ganar por puntos hace un mes."
    }
  },
  {
    id: "evt-3",
    title: "Jornada Intensiva Sparring & Evaluación de Competidores",
    type: "campamento",
    date: "2026-08-29",
    time: "10:00",
    location: "Gimnasio — Ring Principal",
    participantOrClient: "Boxeadores Amateurs & Recreativos Avanzados",
    notes: "Sesión de fogueo guiada por Gonzalo Palma para definir lista del torneo local.",
    isImportant: true,
    cornerNotes: "Equipamiento completo obligatorio: Guantes 16oz Huracán Premium, cabezal e bucal."
  }
];

export const initialReminders: Reminder[] = [
  {
    id: "rem-1",
    title: "Cobrar clase individual a Lucho Ferrari",
    description: "$3.500 correspondientes a la clase técnica del 6 de Agosto.",
    dueDate: "2026-08-06",
    dueTime: "10:00",
    type: "pago",
    targetId: "s-4",
    isCompleted: false
  },
  {
    id: "rem-2",
    title: "Coordinar utilería Huracán Premium para la Exhibición en Olga",
    description: "Revisar guantes, manoplas y cabezales oficiales para la transmisión en streaming.",
    dueDate: "2026-08-17",
    dueTime: "12:00",
    type: "general",
    targetId: "evt-1",
    isCompleted: false
  },
  {
    id: "rem-3",
    title: "Pesaje Oficial Mateo Rossi (Circuito Amateur)",
    description: "Verificar categoría hasta 64.0 kg y llevar libreta de la FEB con Gonzalo y Maximiliano.",
    dueDate: "2026-08-22",
    dueTime: "10:00",
    type: "pelea",
    targetId: "evt-2",
    isCompleted: false
  }
];

export const initialRoutines: BoxingRoutine[] = [
  {
    id: "rot-1",
    title: "Metodología 'Reforzando la Muralla' (Guardia Hermética & Sparring)",
    level: "competidor",
    durationMinutes: 60,
    combos: [
      "1 - 2 (Jab - Directo a la barbilla)",
      "1 - 2 - Slip Izquierda - 3 Al Cuerpo (Crochet de izquierda)",
      "Bloqueo de cruzado (Guardia 'Muralla') - 2 - 3 - 2",
      "Pivote 90° - 1 - 6 (Uppercut) - 3 Head",
      "Step Back de escape - 2 en linea larga - 3 abajo"
    ],
    drills: [
      "3 Rounds de Sombra con mancuernas de 1kg (Velocidad y retracción)",
      "4 Rounds de Manoplas tácticas guiadas por @palma_gon",
      "4 Rounds de Sparring controlado con equipamiento Huracán Premium"
    ],
    physicalPrep: [
      "Salto de Cuerda: 3 rounds de 3 min x 30s aceleración",
      "Flexiones explosivas sobre saco: 4 series x 15 reps",
      "Trabajo de zona media 'Calamar': Ruedas + Abdominales con peso"
    ],
    notes: "Filosofía del Coach Palma: Mantener la guardia cerrada sin grietas y presionar con paso firme sin perder el eje."
  },
  {
    id: "rot-2",
    title: "Acondicionamiento Físico Riguroso (Fuerza & Resistencia)",
    level: "intermedio",
    durationMinutes: 50,
    combos: [
      "1 - 1 - 2 (Doble Jab - Directo potente)",
      "Slip Derecho - 2 Abajo - 3 Arriba"
    ],
    drills: [
      "Circuito de 5 Estaciones (Cuerda, Saco pesado Huracán, Escalera de agilidad, Balón medicinal, Pera loca)",
      "5 Rondas de 3 minutos intensos x 45 segundos de pausa"
    ],
    physicalPrep: [
      "Cuerda de velocidad: 15 minutos continuos",
      "Squat Jumps explosivos: 4 series x 20",
      "Plancha isométrica de resistencia: 4 series x 60 segundos"
    ],
    notes: "Exigencia física alta tanto para alumnos recreativos como para competidores."
  },
  {
    id: "rot-3",
    title: "Rutina de Escuela de Combate & Manopleo Pro",
    level: "avanzado",
    durationMinutes: 45,
    combos: [
      "1 - 2 - Duck - 2 - 3 - Paso lateral",
      "Jab de freno - Cross al cuerpo - Uppercut de izquierda"
    ],
    drills: [
      "Escuela de combate en pareja: esquiva de volados y respuesta rápida",
      "Manopla dinámica con cambios de dirección en el ring"
    ],
    physicalPrep: [
      "Sombra rápida en el ring: 3 rounds sin parar",
      "Lagartijas de tríceps + giros rusos para cintura"
    ],
    notes: "Técnica de combate del Coach Gonza."
  }
];

export const initialExpenses: Expense[] = [
  { id: 'exp-1', date: '2026-08-01', concept: 'Alquiler del espacio', category: 'alquiler', amount: 60000 },
  { id: 'exp-2', date: '2026-08-02', concept: 'Guantes 14oz y vendas', category: 'equipamiento', amount: 38000 },
  { id: 'exp-3', date: '2026-08-04', concept: 'Nafta a la velada', category: 'transporte', amount: 12000 },
  { id: 'exp-4', date: '2026-08-05', concept: 'Inscripción torneo amateur', category: 'federacion', amount: 15000 }
];

export const initialProgress: ProgressEntry[] = [
  { id: 'prg-1', clientId: 'c-1', date: '2026-07-08', weight: 67.8, notes: 'Arranca el campamento' },
  { id: 'prg-2', clientId: 'c-1', date: '2026-07-15', weight: 66.9 },
  { id: 'prg-3', clientId: 'c-1', date: '2026-07-22', weight: 66.1, notes: 'Buen sparring, mejoró la guardia' },
  { id: 'prg-4', clientId: 'c-1', date: '2026-07-29', weight: 65.4 },
  { id: 'prg-5', clientId: 'c-1', date: '2026-08-05', weight: 64.6, notes: 'Le falta poco para el pesaje' }
];
