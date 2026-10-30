import React, { useState, useEffect } from 'react';
import { PAYMENT_METHODS } from '../../utils/payments';
import { useApp } from '../../context/AppContext';
import { X, Calendar, UserPlus, DollarSign, Swords, AlertTriangle, Clock } from 'lucide-react';
import { SessionType, ClientLevel, ClientGoal, PaymentMethod, EventType } from '../../types';
import { getTodayString, findSessionConflicts } from '../../utils/dateUtils';

export const QuickAddModal: React.FC = () => {
  const {
    quickAddModalOpen,
    closeQuickAdd,
    quickAddDefaultType,
    clients,
    packages,
    profile,
    addSession,
    addClient,
    addIncome,
    addEvent,
    sessions
  } = useApp();

  const [activeType, setActiveType] = useState<'session' | 'client' | 'income' | 'event'>('session');

  useEffect(() => {
    if (quickAddDefaultType) {
      setActiveType(quickAddDefaultType);
    }
  }, [quickAddDefaultType]);

  // Session State
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionType, setSessionType] = useState<SessionType>('boxeo');
  const [sessionDate, setSessionDate] = useState(getTodayString());
  const [sessionStartTime, setSessionStartTime] = useState('09:00');
  const [sessionEndTime, setSessionEndTime] = useState('10:00');
  const [sessionClientId, setSessionClientId] = useState('');
  const [sessionLocation, setSessionLocation] = useState('Gimnasio Central');
  const [sessionPrice, setSessionPrice] = useState<number>(35);
  const [sessionPaymentStatus, setSessionPaymentStatus] = useState<'pagada' | 'pendiente'>('pagada');
  const [sessionNotes, setSessionNotes] = useState('');

  // Conflict State
  const conflicts = findSessionConflicts(sessions, {
    date: sessionDate,
    startTime: sessionStartTime,
    endTime: sessionEndTime
  });

  // Client State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientWhatsapp, setClientWhatsapp] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientLevel, setClientLevel] = useState<ClientLevel>('principiante');
  const [clientGoal, setClientGoal] = useState<ClientGoal>('tecnica');
  const [clientPackageId, setClientPackageId] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  // Income State
  const [incomeClientName, setIncomeClientName] = useState('');
  const [incomeConcept, setIncomeConcept] = useState('');
  const [incomeAmount, setIncomeAmount] = useState<number>(35);
  const [incomeMethod, setIncomeMethod] = useState<PaymentMethod>('efectivo');
  const [incomeStatus, setIncomeStatus] = useState<'pagado' | 'pendiente'>('pagado');
  const [incomeDate, setIncomeDate] = useState(getTodayString());
  const [incomeNotes, setIncomeNotes] = useState('');

  // Event State
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>('pelea');
  const [eventDate, setEventDate] = useState(getTodayString());
  const [eventTime, setEventTime] = useState('18:00');
  const [eventLocation, setEventLocation] = useState('');
  const [eventParticipant, setEventParticipant] = useState('');
  const [eventNotes, setEventNotes] = useState('');
  const [eventCornerNotes, setEventCornerNotes] = useState('');
  const [eventIsImportant, setEventIsImportant] = useState(true);

  if (!quickAddModalOpen) return null;

  // Auto-fill price when client is selected
  const handleClientSelect = (clientId: string) => {
    setSessionClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      if (!sessionTitle) {
        setSessionTitle(`Sesión de ${client.name}`);
      }
      if (client.packageId) {
        const pkg = packages.find(p => p.id === client.packageId);
        if (pkg) {
          setSessionPrice(Math.round(pkg.price / (pkg.sessionCount || 1)));
        }
      }
    }
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClient = clients.find(c => c.id === sessionClientId);
    
    addSession({
      title: sessionTitle || `Entrenamiento - ${selectedClient ? selectedClient.name : 'Sesión'}`,
      sessionType,
      date: sessionDate,
      startTime: sessionStartTime,
      endTime: sessionEndTime,
      clientId: sessionClientId || undefined,
      clientName: selectedClient ? selectedClient.name : 'Cliente General',
      location: sessionLocation,
      status: 'programada',
      paymentStatus: sessionPaymentStatus,
      price: Number(sessionPrice),
      paidAmount: sessionPaymentStatus === 'pagada' ? Number(sessionPrice) : 0,
      notes: sessionNotes,
      reminderMinutesBefore: 30
    });

    closeQuickAdd();
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName) return;

    const selectedPkg = packages.find(p => p.id === clientPackageId);

    addClient({
      name: clientName,
      phone: clientPhone,
      whatsapp: clientWhatsapp || clientPhone.replace(/[^0-9]/g, ''),
      email: clientEmail,
      level: clientLevel,
      goal: clientGoal,
      packageId: clientPackageId || undefined,
      sessionsRemaining: selectedPkg ? selectedPkg.sessionCount : 0,
      notes: clientNotes
    });

    closeQuickAdd();
  };

  const handleCreateIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeConcept || !incomeAmount) return;

    addIncome({
      date: incomeDate,
      clientName: incomeClientName || 'Cliente General',
      concept: incomeConcept,
      amount: Number(incomeAmount),
      paymentMethod: incomeMethod,
      status: incomeStatus,
      notes: incomeNotes
    });

    closeQuickAdd();
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle) return;

    addEvent({
      title: eventTitle,
      type: eventType,
      date: eventDate,
      time: eventTime,
      location: eventLocation || 'Arena Central',
      participantOrClient: eventParticipant,
      notes: eventNotes,
      cornerNotes: eventCornerNotes,
      isImportant: eventIsImportant
    });

    closeQuickAdd();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-zinc-950 px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <h2 className="text-base font-bold text-white tracking-tight">Agregar Nuevo Registro</h2>
          </div>
          <button
            onClick={closeQuickAdd}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-4 bg-zinc-950 border-b border-zinc-800 p-2 gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveType('session')}
            className={`flex items-center justify-center space-x-1 py-2 rounded-lg transition-all cursor-pointer ${
              activeType === 'session' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Sesión</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveType('client')}
            className={`flex items-center justify-center space-x-1 py-2 rounded-lg transition-all cursor-pointer ${
              activeType === 'client' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Cliente</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveType('income')}
            className={`flex items-center justify-center space-x-1 py-2 rounded-lg transition-all cursor-pointer ${
              activeType === 'income' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Ingreso</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveType('event')}
            className={`flex items-center justify-center space-x-1 py-2 rounded-lg transition-all cursor-pointer ${
              activeType === 'event' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Evento</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 max-h-[75vh] overflow-y-auto">
          
          {/* 1. SESSION FORM */}
          {activeType === 'session' && (
            <form onSubmit={handleCreateSession} className="space-y-4">
              
              {/* Conflict Warning Alert */}
              {conflicts.length > 0 && (
                <div className="bg-amber-950/80 border border-amber-600/60 rounded-xl p-3 text-amber-200 text-xs flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-300">¡Conflicto de horario detectado!</p>
                    <p className="mt-0.5 text-amber-200/90">
                      Ya existe la sesión <span className="underline font-semibold">{conflicts[0].title}</span> ({conflicts[0].startTime} - {conflicts[0].endTime}).
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Título de la Sesión</label>
                <input
                  type="text"
                  placeholder="Ej. Sparring & Manoplas Pro"
                  value={sessionTitle}
                  onChange={e => setSessionTitle(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Tipo de Entrenamiento</label>
                  <select
                    value={sessionType}
                    onChange={e => setSessionType(e.target.value as SessionType)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  >
                    <option value="boxeo">🥊 Boxeo General</option>
                    <option value="personalizado">👤 Personalizado 1-a-1</option>
                    <option value="grupal">👥 Clase Grupal</option>
                    <option value="preparacion_fisica">💪 Preparación Física</option>
                    <option value="sparring">🔥 Sparring & Combate</option>
                    <option value="tecnica">🎯 Técnica & Manoplas</option>
                    <option value="defensa_personal">🛡️ Defensa Personal</option>
                    <option value="examen">📋 Examen / Evaluación</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Cliente / Grupo</label>
                  <select
                    value={sessionClientId}
                    onChange={e => handleClientSelect(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  >
                    <option value="">-- Seleccionar Cliente --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.level})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={e => setSessionDate(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={sessionStartTime}
                    onChange={e => setSessionStartTime(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={sessionEndTime}
                    onChange={e => setSessionEndTime(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Lugar</label>
                  <input
                    type="text"
                    placeholder="Ej. Ring 1 / Parque / Gimnasio"
                    value={sessionLocation}
                    onChange={e => setSessionLocation(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Precio ({profile.currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    value={sessionPrice}
                    onChange={e => setSessionPrice(Number(e.target.value))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Estado del Pago</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSessionPaymentStatus('pagada')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                      sessionPaymentStatus === 'pagada'
                        ? 'bg-green-950 border-green-600 text-green-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    ✓ Pagada
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionPaymentStatus('pendiente')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                      sessionPaymentStatus === 'pendiente'
                        ? 'bg-amber-950 border-amber-600 text-amber-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    ⏳ Pendiente de Pago
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Notas del Entrenador</label>
                <textarea
                  rows={2}
                  placeholder="Objetivos de la sesión, combinaciones a practicar..."
                  value={sessionNotes}
                  onChange={e => setSessionNotes(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg transition-all cursor-pointer border border-red-500/40"
              >
                Agendar Sesión
              </button>
            </form>
          )}

          {/* 2. CLIENT FORM */}
          {activeType === 'client' && (
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Nombre Completo del Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Roberto 'El Toro' Juárez"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="+52 55 1234 5678"
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">WhatsApp (sin + ni espacios)</label>
                  <input
                    type="text"
                    placeholder="525512345678"
                    value={clientWhatsapp}
                    onChange={e => setClientWhatsapp(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Nivel de Boxeo</label>
                  <select
                    value={clientLevel}
                    onChange={e => setClientLevel(e.target.value as ClientLevel)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  >
                    <option value="principiante">🌱 Principiante</option>
                    <option value="intermedio">⚡ Intermedio</option>
                    <option value="avanzado">🔥 Avanzado</option>
                    <option value="competidor">🥊 Competidor / Peleador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Objetivo Principal</label>
                  <select
                    value={clientGoal}
                    onChange={e => setClientGoal(e.target.value as ClientGoal)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  >
                    <option value="tecnica">🎯 Perfeccionar Técnica</option>
                    <option value="perder_peso">🔥 Bajar de Peso / Quemar Grasa</option>
                    <option value="condicion_fisica">💪 Condición Física de Boxeador</option>
                    <option value="competencia">🏆 Competir en Ring</option>
                    <option value="defensa_personal">🛡️ Defensa Personal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Asignar Paquete / Plan (Opcional)</label>
                <select
                  value={clientPackageId}
                  onChange={e => setClientPackageId(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                >
                  <option value="">-- Ningún paquete asignado --</option>
                  {packages.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({profile.currencySymbol}{p.price} - {p.sessionCount} sesiones)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Notas Internas</label>
                <textarea
                  rows={2}
                  placeholder="Lesiones previas, estilo preferido, comentarios..."
                  value={clientNotes}
                  onChange={e => setClientNotes(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg transition-all cursor-pointer border border-red-500/40"
              >
                Guardar Cliente
              </button>
            </form>
          )}

          {/* 3. INCOME FORM */}
          {activeType === 'income' && (
            <form onSubmit={handleCreateIncome} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Concepto / Servicio</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Pago Paquete 8 Sesiones / Clase Solitaria"
                  value={incomeConcept}
                  onChange={e => setIncomeConcept(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Nombre Cliente</label>
                  <input
                    type="text"
                    placeholder="Nombre del pagador"
                    value={incomeClientName}
                    onChange={e => setIncomeClientName(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Monto ({profile.currencySymbol})</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={incomeAmount}
                    onChange={e => setIncomeAmount(Number(e.target.value))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Método de Pago</label>
                  <select
                    value={incomeMethod}
                    onChange={e => setIncomeMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  >
                    {PAYMENT_METHODS.map(m => (
                    <option key={m.id} value={m.id}>{m.emoji} {m.label}</option>
                  ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Estado</label>
                  <select
                    value={incomeStatus}
                    onChange={e => setIncomeStatus(e.target.value as any)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  >
                    <option value="pagado">✓ Pagado</option>
                    <option value="pendiente">⏳ Pendiente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Fecha de Registro</label>
                <input
                  type="date"
                  value={incomeDate}
                  onChange={e => setIncomeDate(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg transition-all cursor-pointer border border-red-500/40"
              >
                Registrar Ingreso
              </button>
            </form>
          )}

          {/* 4. EVENT FORM */}
          {activeType === 'event' && (
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Nombre de la Pelea o Evento</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Torneo Guantes de Oro / Pelea de Carlos"
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Tipo de Evento</label>
                  <select
                    value={eventType}
                    onChange={e => setEventType(e.target.value as EventType)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  >
                    <option value="pelea">🥊 Pelea / Combate Ring</option>
                    <option value="competencia">🏆 Torneo / Competencia</option>
                    <option value="seminario">🎓 Seminario / Taller</option>
                    <option value="examen">📋 Examen de Graduación</option>
                    <option value="campamento">⛺ Campamento de Entrenamiento</option>
                    <option value="personal">📅 Evento Personal / Viaje</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Participante / Cliente</label>
                  <input
                    type="text"
                    placeholder="Ej. Carlos Mendoza Vs. Rival"
                    value={eventParticipant}
                    onChange={e => setEventParticipant(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Hora</label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={e => setEventTime(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Destacado</label>
                  <button
                    type="button"
                    onClick={() => setEventIsImportant(!eventIsImportant)}
                    className={`w-full py-2 px-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      eventIsImportant ? 'bg-amber-950 border-amber-500 text-amber-300' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {eventIsImportant ? '★ Destacado' : '☆ Normal'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Lugar / Sede</label>
                <input
                  type="text"
                  placeholder="Arena Metropolitana / Gym"
                  value={eventLocation}
                  onChange={e => setEventLocation(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Estrategia de Esquina / Notas de Combate</label>
                <textarea
                  rows={2}
                  placeholder="Plan táctico para la pelea, peso límite, observaciones..."
                  value={eventCornerNotes}
                  onChange={e => setEventCornerNotes(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg transition-all cursor-pointer border border-red-500/40"
              >
                Agendar Pelea / Evento
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
