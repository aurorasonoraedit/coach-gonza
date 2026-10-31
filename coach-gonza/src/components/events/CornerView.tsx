import React, { useEffect } from 'react';
import { ChevronLeft, Pencil, Timer, UserSearch } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FightEvent } from '../../types';
import { buildFightPlan } from '../../utils/fightPlan';
import { recordText, STANCE_LABEL } from './RivalModal';
import { formatDateSpanish } from '../../utils/dateUtils';

const kg = (n?: number) => (n === undefined ? undefined : `${n.toLocaleString('es-AR', { maximumFractionDigits: 1 })} kg`);

interface Props {
  event: FightEvent;
  onClose: () => void;
  onEditRival: () => void;
}

/**
 * Modo esquina: la ficha de la pelea para mirar en la velada.
 * Solo lectura, letra grande, tu boxeador frente al rival como en la transmisión.
 */
export const CornerView: React.FC<Props> = ({ event, onClose, onEditRival }) => {
  const { clients, progress, setActiveTab } = useApp();
  const r = event.rival;
  const boxer = event.boxerId ? clients.find(c => c.id === event.boxerId) : undefined;
  const lastWeight = boxer
    ? progress
        .filter(p => p.clientId === boxer.id && typeof p.weight === 'number')
        .sort((a, b) => b.date.localeCompare(a.date))[0]?.weight
    : undefined;

  // El fondo no se desplaza mientras está abierto
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const tips = r ? buildFightPlan(r).filter(t => t.area !== 'clave').slice(0, 5) : [];

  const rows: { label: string; mine?: string; theirs?: string }[] = [
    { label: 'Récord', theirs: r ? recordText(r) || undefined : undefined },
    { label: 'Guardia', theirs: r?.stance ? STANCE_LABEL[r.stance].replace(' (ortodoxo)', '') : undefined },
    { label: 'Peso', mine: kg(lastWeight), theirs: undefined },
    { label: 'Categoría', mine: boxer?.weightClass },
    { label: 'Edad', theirs: r?.age ? `${r.age}` : undefined },
    { label: 'Altura', theirs: r?.height ? `${r.height} cm` : undefined },
    { label: 'Club', theirs: r?.gym },
    { label: 'Ciudad', theirs: r?.city }
  ].filter(row => row.mine || row.theirs);

  const startFightTimer = () => {
    try {
      localStorage.setItem('boxcoach_timer_config_v1', JSON.stringify({ rounds: 3, roundSec: 180, restSec: 60, warnSec: 10 }));
    } catch { /* nada */ }
    onClose();
    setActiveTab('timer');
  };

  return (
    <div className="fixed inset-0 z-[85] bg-zinc-950 text-white flex flex-col" role="dialog" aria-modal="true" aria-label={`Modo esquina: ${event.title}`}>
      <div className="safe-top px-4 pb-2 border-b border-zinc-800 flex items-center gap-2">
        <button onClick={onClose} className="h-11 pl-1 pr-3 -ml-1 rounded-xl flex items-center gap-1 text-zinc-300 hover:text-white font-semibold cursor-pointer">
          <ChevronLeft className="w-6 h-6" /> Volver
        </button>
        <div className="min-w-0 flex-1 text-right">
          <p className="text-sm font-semibold text-white truncate">{event.title}</p>
          <p className="text-[13px] text-zinc-400 tabular">{formatDateSpanish(event.date)} · {event.time}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 pt-5 pb-8 space-y-7">
          {/* Frente a frente */}
          <section aria-label="Frente a frente">
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
              <div>
                <span className="block text-[13px] font-bold uppercase tracking-[0.1em] text-zinc-400">Tu boxeador</span>
                <span className="block font-display font-extrabold uppercase text-[28px] leading-[0.95] mt-1 break-words">
                  {boxer?.name.replace(/'[^']*'\s*/g, '') ?? '—'}
                </span>
              </div>
              <span className="font-display font-extrabold text-2xl text-ring-red pb-0.5">VS</span>
              <div className="text-right">
                <span className="block text-[13px] font-bold uppercase tracking-[0.1em] text-ring-red">Rival</span>
                <span className="block font-display font-extrabold uppercase text-[28px] leading-[0.95] mt-1 break-words">
                  {r?.name ?? 'Sin ficha'}
                </span>
                {r?.nickname && <span className="block text-sm text-zinc-400 mt-1">"{r.nickname}"</span>}
              </div>
            </div>

            {rows.length > 0 && (
              <dl className="mt-5 border-t border-zinc-800">
                {rows.map(row => (
                  <div key={row.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2.5 border-b border-zinc-800">
                    <dd className="font-display font-bold text-[22px] leading-tight tabular">{row.mine ?? <span className="text-zinc-600">—</span>}</dd>
                    <dt className="text-[13px] font-semibold uppercase tracking-[0.08em] text-zinc-400 text-center w-20">{row.label}</dt>
                    <dd className="font-display font-bold text-[22px] leading-tight tabular text-right">{row.theirs ?? <span className="text-zinc-600">—</span>}</dd>
                  </div>
                ))}
              </dl>
            )}
            {!boxer && (
              <p className="text-sm text-zinc-400 mt-3">Elegí tu boxeador en "Editar pelea" para ver su peso y categoría acá.</p>
            )}
          </section>

          {!r ? (
            <button
              onClick={onEditRival}
              className="w-full min-h-16 rounded-2xl border border-dashed border-zinc-700 text-lg font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserSearch className="w-6 h-6 text-ring-red" /> Armar ficha del rival
            </button>
          ) : (
            <>
              {/* Cómo pelearle */}
              {(r.weaknesses || tips.length > 0) && (
                <section aria-labelledby="plan-title">
                  <h2 id="plan-title" className="font-display font-extrabold uppercase text-2xl text-ring-red tracking-tight">Cómo pelearle</h2>
                  {r.weaknesses && (
                    <div className="mt-3 bg-zinc-900 rounded-2xl p-4">
                      <span className="block text-[13px] font-bold uppercase tracking-[0.1em] text-zinc-400">Dónde entrarle</span>
                      <p className="text-[19px] leading-snug font-semibold mt-1">{r.weaknesses}</p>
                    </div>
                  )}
                  {tips.length > 0 && (
                    <ol className="mt-3 space-y-3">
                      {tips.map((t, i) => (
                        <li key={i} className="flex gap-3 text-[18px] leading-snug">
                          <span className="font-display font-extrabold text-ring-red text-2xl leading-none w-6 shrink-0 tabular">{i + 1}</span>
                          <span>{t.text}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              )}

              {r.strengths && (
                <section className="border-l-0">
                  <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-zinc-400">Cuidado con</h2>
                  <p className="text-[18px] leading-snug mt-1">{r.strengths}</p>
                </section>
              )}
            </>
          )}

          {event.cornerNotes && (
            <section>
              <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-zinc-400">Estrategia de esquina</h2>
              <p className="text-[17px] leading-relaxed mt-1 whitespace-pre-line">{event.cornerNotes}</p>
            </section>
          )}

          {r?.notes && (
            <section>
              <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-zinc-400">Notas</h2>
              <p className="text-[16px] leading-relaxed text-zinc-300 mt-1">{r.notes}</p>
            </section>
          )}
        </div>
      </div>

      <div className="safe-bottom px-4 pt-3 border-t border-zinc-800 bg-zinc-950 grid grid-cols-2 gap-2">
        <button
          onClick={onEditRival}
          className="h-14 rounded-2xl bg-zinc-800 hover:bg-zinc-700 font-semibold flex items-center justify-center gap-2 cursor-pointer"
        >
          <Pencil className="w-5 h-5" /> Editar ficha
        </button>
        <button
          onClick={startFightTimer}
          className="h-14 rounded-2xl bg-ring-red hover:bg-ring-red-deep font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <Timer className="w-5 h-5" /> Timer 3×3
        </button>
      </div>
    </div>
  );
};
