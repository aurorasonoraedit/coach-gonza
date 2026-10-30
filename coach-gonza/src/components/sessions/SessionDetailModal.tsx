import React, { useState } from 'react';
import { waBase } from '../../utils/whatsapp';
import { useApp } from '../../context/AppContext';
import { Session } from '../../types';
import { X, Calendar, Clock, MapPin, User, DollarSign, Edit3, Trash2, Copy, MessageCircle, Dumbbell, AlertTriangle } from 'lucide-react';
import { formatDateSpanish, formatCurrency } from '../../utils/dateUtils';
import { SessionModal } from './SessionModal';

interface SessionDetailModalProps {
  session: Session;
  onClose: () => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({ session, onClose }) => {
  const {
    profile,
    clients,
    routines,
    markSessionStatus,
    markSessionPaid,
    openPayPrompt,
    deleteSession,
    duplicateSession
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);

  const client = clients.find(c => c.id === session.clientId);
  const routine = routines.find(r => r.id === session.routineId);

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de eliminar la sesión "${session.title}"?`)) {
      deleteSession(session.id);
      onClose();
    }
  };

  if (isEditing) {
    return (
      <SessionModal
        sessionToEdit={session}
        onClose={() => {
          setIsEditing(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-zinc-950 px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
              {session.sessionType.replace('_', ' ')}
            </span>
            <span className="text-xs text-zinc-400">• Detalle de Turno</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div>
            <h2 className="text-xl font-black text-white leading-tight">{session.title}</h2>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-red-500" />
              <span>{formatDateSpanish(session.date)}</span>
              <span>•</span>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-semibold text-white">{session.startTime} - {session.endTime}</span>
            </p>
          </div>

          {/* Client Box & Location */}
          <div className="grid grid-cols-2 gap-3 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs">
            <div>
              <span className="text-zinc-500 block mb-0.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-400" /> Cliente / Grupo
              </span>
              <p className="font-bold text-white text-sm truncate">{session.clientName || 'Cliente General'}</p>
              {client && (
                <p className="text-[10px] text-zinc-400 font-medium">Nivel: {client.level}</p>
              )}
            </div>

            <div>
              <span className="text-zinc-500 block mb-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" /> Ubicación / Sede
              </span>
              <p className="font-bold text-white text-sm truncate">{session.location}</p>
            </div>
          </div>

          {/* Payment & Status Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
              <span className="text-[11px] text-zinc-400 block mb-1">Estado de la Sesión</span>
              <span
                className={`text-xs font-extrabold uppercase px-2.5 py-1 rounded-lg border inline-block ${
                  session.status === 'completada'
                    ? 'bg-green-950 text-green-400 border-green-800'
                    : session.status === 'cancelada'
                    ? 'bg-red-950 text-red-400 border-red-800'
                    : 'bg-blue-950 text-blue-400 border-blue-800'
                }`}
              >
                {session.status}
              </span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
              <span className="text-[11px] text-zinc-400 block mb-1">Precio & Cobro</span>
              <p className="font-extrabold text-white text-sm">
                {formatCurrency(session.price, profile.currencySymbol)}{' '}
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ml-1 ${
                    session.paymentStatus === 'pagada'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border-amber-800'
                  }`}
                >
                  {session.paymentStatus}
                </span>
              </p>
            </div>
          </div>

          {/* Assigned Routine if any */}
          {routine && (
            <div className="bg-zinc-950 border border-red-900/40 rounded-xl p-3 space-y-2">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-red-500" /> Rutina Asignada: {routine.title}
              </span>
              {routine.combos && routine.combos.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[11px] text-zinc-400 font-semibold">Combinaciones a trabajar:</p>
                  <ul className="list-disc list-inside text-xs text-zinc-200 font-mono space-y-0.5">
                    {routine.combos.map((combo, idx) => (
                      <li key={idx}>{combo}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Coach Notes */}
          {session.notes && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
              <span className="text-xs font-bold text-zinc-400 block mb-1">Notas del Entrenador</span>
              <p className="text-xs text-zinc-300 italic whitespace-pre-line">{session.notes}</p>
            </div>
          )}

          {/* WhatsApp Direct Message button */}
          {client && client.whatsapp && (
            <a
              href={`${waBase(client.whatsapp || client.phone)}?text=${encodeURIComponent(
                `Hola ${client.name}, sobre tu sesión de boxeo (${session.title}) el ${session.date} a las ${session.startTime}: `
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Contactar Cliente por WhatsApp</span>
            </a>
          )}

          {/* Quick Action Toolbar */}
          <div className="border-t border-zinc-800 pt-3 space-y-2">
            <span className="text-xs font-semibold text-zinc-400 block">Acciones Rápidas:</span>
            
            <div className="grid grid-cols-2 gap-2">
              {session.status !== 'completada' && (
                <button
                  onClick={() => {
                    markSessionStatus(session.id, 'completada');
                    onClose();
                  }}
                  className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 rounded-xl transition-all cursor-pointer shadow"
                >
                  ✓ Marcar Completada
                </button>
              )}

              {session.paymentStatus === 'pendiente' && (
                <button
                  onClick={() => {
                    openPayPrompt({ sessionId: session.id });
                    onClose();
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-2 rounded-xl transition-all cursor-pointer shadow"
                >
                  💵 Marcar Pagada
                </button>
              )}

              <button
                onClick={() => {
                  duplicateSession(session);
                  onClose();
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold py-2 rounded-xl flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicar (Próx. Semana)</span>
              </button>

              <button
                onClick={() => setIsEditing(true)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold py-2 rounded-xl flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                <span>Editar Sesión</span>
              </button>
            </div>

            <button
              onClick={handleDelete}
              className="w-full mt-2 bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-300 text-xs font-bold py-2 rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Turno</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
