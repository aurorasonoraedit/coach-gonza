import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, Plus, Dumbbell, Flame, CheckCircle, Edit3, Trash2, Shield, Zap } from 'lucide-react';
import { BoxingRoutine } from '../../types';
import { RoutineModal } from './RoutineModal';

export const BoxingLibraryView: React.FC = () => {
  const { routines, deleteRoutine } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [routineToEdit, setRoutineToEdit] = useState<BoxingRoutine | null>(null);

  // Standard Boxing Punch Numbering Cheatsheet
  const punchGuide = [
    { num: '1', name: 'Jab', desc: 'Golpe directo de mano delantera (medir distancia y preparar ataque)', color: 'border-blue-500 text-blue-400' },
    { num: '2', name: 'Cross / Directo', desc: 'Directo de mano trasera con rotación de cadera (potencia pura)', color: 'border-red-500 text-red-400' },
    { num: '3', name: 'Lead Hook / Crochet Izq', desc: 'Gancho lateral de mano delantera a la mandíbula o hígado', color: 'border-amber-500 text-amber-400' },
    { num: '4', name: 'Rear Hook / Crochet Dcho', desc: 'Gancho lateral de mano trasera para cerrar espacio', color: 'border-orange-500 text-orange-400' },
    { num: '5', name: 'Lead Uppercut', desc: 'Gancho ascendente de mano delantera al mentón o plexo', color: 'border-emerald-500 text-emerald-400' },
    { num: '6', name: 'Rear Uppercut', desc: 'Gancho ascendente de mano trasera cuando el rival agacha la cabeza', color: 'border-purple-500 text-purple-400' }
  ];

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta rutina de la biblioteca?')) {
      deleteRoutine(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg">
        <div>
          <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-red-500" /> Biblioteca del Coach & Combos
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Nomenclatura estándar de golpes, driles de saco y rutinas de entrenamiento.
          </p>
        </div>

        <button
          onClick={() => {
            setRoutineToEdit(null);
            setModalOpen(true);
          }}
          className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-lg transition-all cursor-pointer border border-red-500/40"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nueva Rutina</span>
        </button>
      </div>

      {/* 1. Cheatsheet: Standard Boxing Numbering (1-6) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" /> Nomenclatura Numérica Internacional de Boxeo (1 a 6)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {punchGuide.map(p => (
            <div
              key={p.num}
              className={`bg-zinc-950 border ${p.color} rounded-xl p-3 flex items-start space-x-3 shadow-inner`}
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-lg font-black text-white shrink-0">
                {p.num}
              </div>
              <div>
                <h4 className="font-extrabold text-white text-xs">{p.name}</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-tight">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Custom Routines */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-red-500" /> Mis Rutinas Guardadas ({routines.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routines.map(rot => (
            <div
              key={rot.id}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                      Nivel: {rot.level} • {rot.durationMinutes} min
                    </span>
                    <h4 className="text-base font-black text-white mt-1.5 leading-snug">{rot.title}</h4>
                  </div>
                </div>

                {/* Combos */}
                {rot.combos && rot.combos.length > 0 && (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs space-y-1">
                    <span className="font-extrabold text-red-400 text-[10px] uppercase tracking-wider block">
                      🥊 Combinaciones Principales
                    </span>
                    <ul className="space-y-1 font-mono text-zinc-200">
                      {rot.combos.map((combo, idx) => (
                        <li key={idx} className="flex items-center space-x-1.5">
                          <span className="text-red-500 font-bold">•</span>
                          <span>{combo}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Drills */}
                {rot.drills && rot.drills.length > 0 && (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs space-y-1">
                    <span className="font-extrabold text-amber-400 text-[10px] uppercase tracking-wider block">
                      ⏱️ Drills & Trabajo Técnico
                    </span>
                    <ul className="space-y-1 text-zinc-300">
                      {rot.drills.map((drill, idx) => (
                        <li key={idx}>- {drill}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {rot.notes && (
                  <p className="text-xs text-zinc-400 italic">{rot.notes}</p>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-zinc-800/80 pt-3 flex items-center justify-end space-x-2">
                <button
                  onClick={() => {
                    setRoutineToEdit(rot);
                    setModalOpen(true);
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-zinc-700 cursor-pointer flex items-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => handleDelete(rot.id)}
                  className="bg-zinc-800 hover:bg-red-900 text-zinc-400 hover:text-red-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-zinc-700 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {modalOpen && (
        <RoutineModal
          routineToEdit={routineToEdit || undefined}
          onClose={() => {
            setModalOpen(false);
            setRoutineToEdit(null);
          }}
        />
      )}

    </div>
  );
};
