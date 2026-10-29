import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Session, SessionType, PaymentStatus, SessionStatus } from '../../types';
import { X, AlertTriangle } from 'lucide-react';
import { getTodayString, findSessionConflicts } from '../../utils/dateUtils';

interface SessionModalProps {
  sessionToEdit?: Session;
  onClose: () => void;
  defaultDate?: string;
}

export const SessionModal: React.FC<SessionModalProps> = ({ sessionToEdit, onClose, defaultDate }) => {
  const { clients, routines, packages, profile, addSession, updateSession, sessions } = useApp();

  const [title, setTitle] = useState(sessionToEdit ? sessionToEdit.title : '');
  const [sessionType, setSessionType] = useState<SessionType>(sessionToEdit ? sessionToEdit.sessionType : 'boxeo');
  const [date, setDate] = useState(sessionToEdit ? sessionToEdit.date : (defaultDate || getTodayString()));
  const [startTime, setStartTime] = useState(sessionToEdit ? sessionToEdit.startTime : '09:00');
  const [endTime, setEndTime] = useState(sessionToEdit ? sessionToEdit.endTime : '10:00');
  const [clientId, setClientId] = useState(sessionToEdit ? (sessionToEdit.clientId || '') : '');
  const [location, setLocation] = useState(sessionToEdit ? sessionToEdit.location : 'Gimnasio Central');
  const [status, setStatus] = useState<SessionStatus>(sessionToEdit ? sessionToEdit.status : 'programada');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(sessionToEdit ? sessionToEdit.paymentStatus : 'pagada');
  const [price, setPrice] = useState<number>(sessionToEdit ? sessionToEdit.price : 35);
  const [notes, setNotes] = useState(sessionToEdit ? (sessionToEdit.notes || '') : '');
  const [routineId, setRoutineId] = useState(sessionToEdit ? (sessionToEdit.routineId || '') : '');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number>(sessionToEdit ? (sessionToEdit.reminderMinutesBefore || 30) : 30);

  const conflicts = findSessionConflicts(sessions, {
    id: sessionToEdit?.id,
    date,
    startTime,
    endTime
  });

  const handleClientChange = (cId: string) => {
    setClientId(cId);
    const selected = clients.find(c => c.id === cId);
    if (selected) {
      if (!title) {
        setTitle(`Sesión de ${selected.name}`);
      }
      if (selected.packageId) {
        const pkg = packages.find(p => p.id === selected.packageId);
        if (pkg) {
          setPrice(Math.round(pkg.price / (pkg.sessionCount || 1)));
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClient = clients.find(c => c.id === clientId);
    const clientName = selectedClient ? selectedClient.name : 'Cliente General';

    if (sessionToEdit) {
      updateSession(sessionToEdit.id, {
        title: title || `Entrenamiento - ${clientName}`,
        sessionType,
        date,
        startTime,
        endTime,
        clientId: clientId || undefined,
        clientName,
        location,
        status,
        paymentStatus,
        price: Number(price),
        notes,
        routineId: routineId || undefined,
        reminderMinutesBefore
      });
    } else {
      addSession({
        title: title || `Entrenamiento - ${clientName}`,
        sessionType,
        date,
        startTime,
        endTime,
        clientId: clientId || undefined,
        clientName,
        location,
        status,
        paymentStatus,
        price: Number(price),
        paidAmount: paymentStatus === 'pagada' ? Number(price) : 0,
        notes,
        routineId: routineId || undefined,
        reminderMinutesBefore
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-zinc-950 px-5 py-4 border-b border-zinc-800">
          <h2 className="text-base font-bold text-white tracking-tight">
            {sessionToEdit ? 'Editar Turno / Sesión' : 'Agendar Nueva Sesión'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {conflicts.length > 0 && (
            <div className="bg-amber-950/80 border border-amber-600/60 rounded-xl p-3 text-amber-200 text-xs flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300">¡Alerta de Choque de Horarios!</p>
                <p className="mt-0.5 text-amber-200/90">
                  Coincide con <span className="underline font-semibold">{conflicts[0].title}</span> ({conflicts[0].startTime} - {conflicts[0].endTime}).
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Título de la Sesión</label>
            <input
              type="text"
              placeholder="Ej. Sparring & Manoplas Pro"
              value={title}
              onChange={e => setTitle(e.target.value)}
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
                value={clientId}
                onChange={e => handleClientChange(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
              >
                <option value="">-- Sin Cliente Asignado --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
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
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Hora Inicio</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Hora Fin</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Lugar / Sede</label>
              <input
                type="text"
                placeholder="Gimnasio / Ring 1 / Parque"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Precio de Sesión ({profile.currencySymbol})</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Estado de la Sesión</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as SessionStatus)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
              >
                <option value="programada">📅 Programada</option>
                <option value="completada">✓ Completada</option>
                <option value="cancelada">❌ Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Estado del Pago</label>
              <select
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
              >
                <option value="pagada">✓ Pagada</option>
                <option value="pendiente">⏳ Pendiente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Vincular Rutina de Boxeo (Opcional)</label>
            <select
              value={routineId}
              onChange={e => setRoutineId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
            >
              <option value="">-- Ninguna rutina vinculada --</option>
              {routines.map(r => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.durationMinutes} min)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Notificación / Recordatorio</label>
            <select
              value={reminderMinutesBefore}
              onChange={e => setReminderMinutesBefore(Number(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
            >
              <option value={0}>Al momento</option>
              <option value={15}>15 minutos antes</option>
              <option value={30}>30 minutos antes</option>
              <option value={60}>1 hora antes</option>
              <option value={1440}>1 día antes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Notas Internas</label>
            <textarea
              rows={2}
              placeholder="Notas de preparación..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg transition-all cursor-pointer border border-red-500/40"
          >
            {sessionToEdit ? 'Guardar Cambios' : 'Agendar Sesión'}
          </button>
        </form>

      </div>
    </div>
  );
};
