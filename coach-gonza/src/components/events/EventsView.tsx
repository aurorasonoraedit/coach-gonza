import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Swords, Plus, Calendar, MapPin, Edit3, Trash2, Star, ShieldAlert } from 'lucide-react';
import { FightEvent } from '../../types';
import { formatDateSpanish, formatShortDate } from '../../utils/dateUtils';
import { EventModal } from './EventModal';

export const EventsView: React.FC = () => {
  const { events, deleteEvent } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<FightEvent | null>(null);

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este evento o pelea de la agenda?')) {
      deleteEvent(id);
    }
  };

  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg">
        <div>
          <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-500" /> Eventos, Peleas & Campamentos ({events.length})
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Registra combates de tus boxeadores, exámenes de graduación y carteleras profesionales.
          </p>
        </div>

        <button
          onClick={() => {
            setEventToEdit(null);
            setModalOpen(true);
          }}
          className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-lg transition-all cursor-pointer border border-amber-500/40"
        >
          <Plus className="w-4 h-4" />
          <span>+ Agendar Evento / Pelea</span>
        </button>
      </div>

      {/* Events List */}
      {sortedEvents.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 text-center">
          <Swords className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-300">No hay peleas ni eventos registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedEvents.map(evt => (
            <div
              key={evt.id}
              className={`bg-zinc-900 border rounded-2xl p-5 shadow-xl transition-all space-y-3 relative overflow-hidden ${
                evt.isImportant ? 'border-amber-500/60 bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/20' : 'border-zinc-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded">
                      {evt.type}
                    </span>
                    {evt.isImportant && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-black px-1.5 py-0.2 rounded flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> DESTACADO
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-white mt-1.5 leading-snug">{evt.title}</h3>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-amber-400 block">{formatShortDate(evt.date)}</span>
                  <span className="text-[10px] text-zinc-400 font-semibold">{evt.time}</span>
                </div>
              </div>

              {evt.participantOrClient && (
                <p className="text-xs text-zinc-300 font-semibold flex items-center gap-1.5">
                  <span>🥊 Participantes:</span>
                  <span className="text-white">{evt.participantOrClient}</span>
                </p>
              )}

              {evt.location && (
                <p className="text-xs text-zinc-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{evt.location}</span>
                </p>
              )}

              {evt.cornerNotes && (
                <div className="bg-zinc-950 border border-amber-900/40 rounded-xl p-3 text-xs space-y-1">
                  <span className="font-extrabold text-amber-400 uppercase tracking-wider text-[10px] block">
                    ⚡ Estrategia de Esquina / Plan Táctico
                  </span>
                  <p className="text-zinc-200 italic">{evt.cornerNotes}</p>
                </div>
              )}

              {evt.notes && (
                <p className="text-xs text-zinc-400 italic bg-zinc-950/50 p-2 rounded-lg border border-zinc-800">
                  {evt.notes}
                </p>
              )}

              {/* Actions Toolbar */}
              <div className="border-t border-zinc-800/80 pt-3 flex items-center justify-end space-x-2">
                <button
                  onClick={() => {
                    setEventToEdit(evt);
                    setModalOpen(true);
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-zinc-700 transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => handleDelete(evt.id)}
                  className="bg-zinc-800 hover:bg-red-900 text-zinc-400 hover:text-red-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-zinc-700 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <EventModal
          eventToEdit={eventToEdit || undefined}
          onClose={() => {
            setModalOpen(false);
            setEventToEdit(null);
          }}
        />
      )}

    </div>
  );
};
