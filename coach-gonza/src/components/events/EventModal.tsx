import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FightEvent, EventType } from '../../types';
import { X } from 'lucide-react';
import { getTodayString } from '../../utils/dateUtils';

interface EventModalProps {
  eventToEdit?: FightEvent;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ eventToEdit, onClose }) => {
  const { addEvent, updateEvent, clients } = useApp();

  const [title, setTitle] = useState(eventToEdit ? eventToEdit.title : '');
  const [type, setType] = useState<EventType>(eventToEdit ? eventToEdit.type : 'pelea');
  const [date, setDate] = useState(eventToEdit ? eventToEdit.date : getTodayString());
  const [time, setTime] = useState(eventToEdit ? eventToEdit.time : '18:00');
  const [location, setLocation] = useState(eventToEdit ? eventToEdit.location : '');
  const [participantOrClient, setParticipantOrClient] = useState(eventToEdit ? (eventToEdit.participantOrClient || '') : '');
  const [boxerId, setBoxerId] = useState(eventToEdit?.boxerId ?? '');
  const [notes, setNotes] = useState(eventToEdit ? (eventToEdit.notes || '') : '');
  const [cornerNotes, setCornerNotes] = useState(eventToEdit ? (eventToEdit.cornerNotes || '') : '');
  const [isImportant, setIsImportant] = useState<boolean>(eventToEdit ? (eventToEdit.isImportant ?? true) : true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    if (eventToEdit) {
      updateEvent(eventToEdit.id, {
        title,
        type,
        date,
        time,
        location,
        participantOrClient,
        boxerId: boxerId || undefined,
        notes,
        cornerNotes,
        isImportant
      });
    } else {
      addEvent({
        title,
        type,
        date,
        time,
        location,
        participantOrClient,
        boxerId: boxerId || undefined,
        notes,
        cornerNotes,
        isImportant
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
            {eventToEdit ? 'Editar Evento / Pelea' : 'Agendar Pelea o Evento Importante'}
          </h2>
          <button
            onClick={onClose}
            className="w-11 h-11 inline-flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Nombre de la Pelea o Evento</label>
            <input
              type="text"
              required
              placeholder="Ej. Torneo Guantes de Oro / Pelea de Carlos"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-ring-red"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Tipo de Evento</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as EventType)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
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
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Tu boxeador</label>
              <select
                value={boxerId}
                onChange={e => {
                  setBoxerId(e.target.value);
                  const c = clients.find(x => x.id === e.target.value);
                  if (c && !participantOrClient) setParticipantOrClient(c.name);
                }}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
              >
                <option value="">Ninguno / otro</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Participantes (texto libre)</label>
            <input
              type="text"
              placeholder="Ej. Mateo Rossi vs. J. Ramírez"
              value={participantOrClient}
              onChange={e => setParticipantOrClient(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Hora</label>
              <input
                type="time"
                required
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Destacado</label>
              <button
                type="button"
                onClick={() => setIsImportant(!isImportant)}
                className={`w-full py-2 px-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  isImportant ? 'bg-amber-950 border-amber-500 text-amber-300' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}
              >
                {isImportant ? '★ Destacado' : '☆ Normal'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Lugar / Sede</label>
            <input
              type="text"
              placeholder="Arena Metropolitana / Gym"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Plan Táctico de Esquina / Estrategia</label>
            <textarea
              rows={2}
              placeholder="Estrategia contra el rival, pesaje máximo..."
              value={cornerNotes}
              onChange={e => setCornerNotes(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Notas Generales</label>
            <textarea
              rows={2}
              placeholder="Observaciones adicionales..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 min-h-11 rounded-xl bg-zinc-900 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg transition-all cursor-pointer border border-ring-red/40"
          >
            {eventToEdit ? 'Guardar Cambios' : 'Agendar Evento'}
          </button>
        </form>

      </div>
    </div>
  );
};
