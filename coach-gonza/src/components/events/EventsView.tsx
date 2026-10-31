import { askConfirm } from '../../utils/confirm';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, MapPin, Pencil, Trash2, ChevronRight, UserSearch } from 'lucide-react';
import { FightEvent } from '../../types';
import { formatShortDate, getTodayString } from '../../utils/dateUtils';
import { EventModal } from './EventModal';
import { recordText, STANCE_LABEL } from './RivalModal';

const TYPE_LABEL: Record<string, string> = {
  pelea: 'Pelea',
  competencia: 'Competencia',
  seminario: 'Seminario',
  examen: 'Examen',
  campamento: 'Campamento',
  personal: 'Personal'
};

const daysUntil = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  const [ty, tm, td] = getTodayString().split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86400000);
};

export const EventsView: React.FC = () => {
  const { events, deleteEvent, clients, setCornerEventId, setRivalEditEventId } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<FightEvent | null>(null);

  const handleDelete = async (id: string) => {
    if (await askConfirm('¿Eliminar este evento o pelea de la agenda?', { okLabel: 'Eliminar' })) {
      deleteEvent(id);
    }
  };

  const today = getTodayString();
  const upcoming = [...events].filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = [...events].filter(e => e.date < today).sort((a, b) => b.date.localeCompare(a.date));

  const isFight = (e: FightEvent) => e.type === 'pelea' || e.type === 'competencia';

  const renderRow = (evt: FightEvent) => {
    const d = daysUntil(evt.date);
    const boxer = evt.boxerId ? clients.find(c => c.id === evt.boxerId) : undefined;
    const when = d === 0 ? 'Hoy' : d === 1 ? 'Mañana' : d > 1 && d <= 14 ? `En ${d} días` : '';
    const [dayNum, ...monthParts] = formatShortDate(evt.date).split(' ');
    return (
      <li key={evt.id} className="py-4">
        <div className="flex items-start gap-4">
          <div className="w-14 shrink-0 text-center">
            <span className={`block font-display font-extrabold text-[30px] leading-none tabular ${d >= 0 && d <= 7 ? 'text-ring-red' : 'text-white'}`}>
              {dayNum}
            </span>
            <span className="block text-[13px] font-semibold uppercase text-zinc-400 mt-1">{monthParts.join(' ')}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-zinc-400">
              {[TYPE_LABEL[evt.type] ?? evt.type, when, evt.time].filter(Boolean).join(' · ')}
            </p>
            <h3 className="text-[17px] font-bold leading-snug mt-0.5">{evt.title}</h3>
            {(boxer || evt.participantOrClient) && (
              <p className="text-sm text-zinc-300 mt-1">{boxer ? boxer.name : evt.participantOrClient}</p>
            )}
            {evt.location && (
              <p className="text-sm text-zinc-400 mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4 shrink-0" /> {evt.location}
              </p>
            )}
          </div>
        </div>

        {isFight(evt) &&
          (evt.rival ? (
            <button
              onClick={() => setCornerEventId(evt.id)}
              className="mt-3 w-full text-left bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold uppercase tracking-[0.1em] text-ring-red">Rival</span>
                <span className="block font-display font-extrabold uppercase text-2xl leading-none mt-1">{evt.rival.name}</span>
                <span className="block text-sm text-zinc-300 mt-1.5 tabular">
                  {[recordText(evt.rival), evt.rival.stance ? STANCE_LABEL[evt.rival.stance].replace(' (ortodoxo)', '') : '', evt.rival.city]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </span>
              <span className="shrink-0 flex items-center gap-1 text-sm font-bold text-white bg-ring-red rounded-xl h-11 px-3">
                Esquina <ChevronRight className="w-4 h-4" />
              </span>
            </button>
          ) : (
            <button
              onClick={() => setRivalEditEventId(evt.id)}
              className="mt-3 w-full min-h-12 rounded-2xl border border-dashed border-zinc-700 hover:border-ring-red text-sm font-semibold text-zinc-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserSearch className="w-5 h-5 text-ring-red" /> Armar ficha del rival
            </button>
          ))}

        {!isFight(evt) && evt.cornerNotes && <p className="mt-2 text-sm text-zinc-300 leading-relaxed">{evt.cornerNotes}</p>}

        <div className="mt-2 flex items-center justify-end gap-1">
          <button
            onClick={() => { setEventToEdit(evt); setModalOpen(true); }}
            className="h-11 px-3 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer"
          >
            <Pencil className="w-4 h-4" /> Editar pelea
          </button>
          <button
            onClick={() => handleDelete(evt.id)}
            aria-label={`Eliminar ${evt.title}`}
            className="w-11 h-11 rounded-xl text-zinc-400 hover:text-red-300 hover:bg-zinc-800 flex items-center justify-center cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </li>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-end justify-between gap-3 mb-1">
        <h1 className="font-display font-extrabold uppercase text-3xl tracking-tight leading-none">Peleas</h1>
        <button
          onClick={() => { setEventToEdit(null); setModalOpen(true); }}
          className="h-11 px-4 rounded-xl bg-ring-red hover:bg-ring-red-deep text-white text-sm font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Agendar
        </button>
      </div>
      <p className="text-sm text-zinc-400 mb-4">Tocá el rival para abrir el modo esquina.</p>

      {events.length === 0 ? (
        <div className="py-12 text-center border-y border-zinc-800">
          <p className="text-lg font-semibold">Todavía no hay peleas agendadas</p>
          <p className="text-sm text-zinc-400 mt-1">Agendá la próxima velada y armá la ficha del rival.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && <ul className="divide-y divide-zinc-800 border-y border-zinc-800">{upcoming.map(renderRow)}</ul>}
          {past.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-zinc-400 mt-8 mb-1">Anteriores</h2>
              <ul className="divide-y divide-zinc-800 border-y border-zinc-800">{past.map(renderRow)}</ul>
            </>
          )}
        </>
      )}

      {modalOpen && (
        <EventModal eventToEdit={eventToEdit || undefined} onClose={() => { setModalOpen(false); setEventToEdit(null); }} />
      )}
    </div>
  );
};
