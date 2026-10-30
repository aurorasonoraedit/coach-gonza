import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Swords, Plus, MapPin, Edit3, Trash2, Star, UserSearch, ExternalLink } from 'lucide-react';
import { FightEvent } from '../../types';
import { formatDateSpanish, formatShortDate } from '../../utils/dateUtils';
import { EventModal } from './EventModal';
import { RivalModal, recordText, STANCE_LABEL } from './RivalModal';

export const EventsView: React.FC = () => {
  const { events, deleteEvent } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<FightEvent | null>(null);
  const [rivalEventId, setRivalEventId] = useState<string | null>(null);
  const rivalEvent = events.find(e => e.id === rivalEventId) || null;

  const igLink = (v: string) =>
    v.startsWith('http') ? v : `https://instagram.com/${v.replace(/^@/, '')}`;

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

              {/* Rival */}
              {evt.rival ? (
                <button
                  onClick={() => setRivalEventId(evt.id)}
                  className="w-full text-left bg-zinc-950 border border-red-900/50 rounded-xl p-3 text-xs space-y-1.5 cursor-pointer hover:border-red-700/70"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider block">Rival</span>
                      <span className="font-black text-white text-sm">
                        {evt.rival.name}
                        {evt.rival.nickname && <span className="text-zinc-400 font-semibold"> "{evt.rival.nickname}"</span>}
                      </span>
                    </div>
                    {evt.rival.level ? (
                      <span className="flex shrink-0">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} className={`w-3.5 h-3.5 ${n <= (evt.rival!.level || 0) ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />
                        ))}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recordText(evt.rival) && (
                      <span className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-white font-bold">{recordText(evt.rival)}</span>
                    )}
                    {evt.rival.stance && (
                      <span className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200">{STANCE_LABEL[evt.rival.stance]}</span>
                    )}
                    {(evt.rival.gym || evt.rival.city) && (
                      <span className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200">
                        📍 {[evt.rival.gym, evt.rival.city].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>
                  {evt.rival.styles && evt.rival.styles.length > 0 && (
                    <p className="text-[11px] text-amber-300/90">{evt.rival.styles.join(' · ')}</p>
                  )}
                  {evt.rival.weaknesses && (
                    <p className="text-[11px] text-zinc-300"><span className="font-bold text-emerald-400">🎯 Débil:</span> {evt.rival.weaknesses}</p>
                  )}
                  {evt.rival.strengths && (
                    <p className="text-[11px] text-zinc-300"><span className="font-bold text-red-400">💪 Fuerte:</span> {evt.rival.strengths}</p>
                  )}
                  <span className="text-[10px] text-zinc-500 block">Tocá para ver o editar la ficha completa</span>
                </button>
              ) : (evt.type === 'pelea' || evt.type === 'competencia') ? (
                <button
                  onClick={() => setRivalEventId(evt.id)}
                  className="w-full bg-zinc-950 border border-dashed border-zinc-700 hover:border-red-700 rounded-xl p-3 text-xs font-bold text-zinc-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserSearch className="w-4 h-4 text-red-400" /> Armar ficha del rival
                </button>
              ) : null}

              {evt.rival && (evt.rival.boxrecUrl || evt.rival.videoUrl || evt.rival.instagram) && (
                <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
                  {evt.rival.boxrecUrl && (
                    <a href={evt.rival.boxrecUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> BoxRec
                    </a>
                  )}
                  {evt.rival.videoUrl && (
                    <a href={evt.rival.videoUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded-lg bg-red-950/60 border border-red-900 text-red-200 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> Video
                    </a>
                  )}
                  {evt.rival.instagram && (
                    <a href={igLink(evt.rival.instagram)} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded-lg bg-fuchsia-950/50 border border-fuchsia-900 text-fuchsia-200 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> Instagram
                    </a>
                  )}
                </div>
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

      {rivalEvent && <RivalModal event={rivalEvent} onClose={() => setRivalEventId(null)} />}

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
