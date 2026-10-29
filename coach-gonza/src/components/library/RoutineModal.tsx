import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BoxingRoutine, ClientLevel } from '../../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface RoutineModalProps {
  routineToEdit?: BoxingRoutine;
  onClose: () => void;
}

export const RoutineModal: React.FC<RoutineModalProps> = ({ routineToEdit, onClose }) => {
  const { addRoutine, updateRoutine } = useApp();

  const [title, setTitle] = useState(routineToEdit ? routineToEdit.title : '');
  const [level, setLevel] = useState<ClientLevel>(routineToEdit ? routineToEdit.level : 'intermedio');
  const [durationMinutes, setDurationMinutes] = useState<number>(routineToEdit ? routineToEdit.durationMinutes : 45);
  const [combos, setCombos] = useState<string[]>(routineToEdit ? routineToEdit.combos : ['1 - 2 (Jab - Directo)']);
  const [drills, setDrills] = useState<string[]>(routineToEdit ? routineToEdit.drills : ['3 Rounds de Sombra']);
  const [physicalPrep, setPhysicalPrep] = useState<string[]>(routineToEdit ? routineToEdit.physicalPrep : ['Saltos de cuerda']);
  const [notes, setNotes] = useState(routineToEdit ? (routineToEdit.notes || '') : '');

  const [newCombo, setNewCombo] = useState('');
  const [newDrill, setNewDrill] = useState('');
  const [newPhysical, setNewPhysical] = useState('');

  const handleAddCombo = () => {
    if (!newCombo.trim()) return;
    setCombos([...combos, newCombo.trim()]);
    setNewCombo('');
  };

  const handleAddDrill = () => {
    if (!newDrill.trim()) return;
    setDrills([...drills, newDrill.trim()]);
    setNewDrill('');
  };

  const handleAddPhysical = () => {
    if (!newPhysical.trim()) return;
    setPhysicalPrep([...physicalPrep, newPhysical.trim()]);
    setNewPhysical('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    if (routineToEdit) {
      updateRoutine(routineToEdit.id, {
        title,
        level,
        durationMinutes: Number(durationMinutes),
        combos,
        drills,
        physicalPrep,
        notes
      });
    } else {
      addRoutine({
        title,
        level,
        durationMinutes: Number(durationMinutes),
        combos,
        drills,
        physicalPrep,
        notes
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
            {routineToEdit ? 'Editar Rutina de Boxeo' : 'Crear Nueva Rutina'}
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
          
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Título de la Rutina</label>
            <input
              type="text"
              required
              placeholder="Ej. Combinaciones Pro de Manoplas"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Nivel Destinado</label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value as ClientLevel)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
              >
                <option value="principiante">🌱 Principiante</option>
                <option value="intermedio">⚡ Intermedio</option>
                <option value="avanzado">🔥 Avanzado</option>
                <option value="competidor">🥊 Competidor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Duración (minutos)</label>
              <input
                type="number"
                min="10"
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Combinaciones List */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Combinaciones Numéricas</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                placeholder="Ej. 1-2-3 Roll 2"
                value={newCombo}
                onChange={e => setNewCombo(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
              />
              <button
                type="button"
                onClick={handleAddCombo}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
              >
                + Añadir
              </button>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {combos.map((c, i) => (
                <div key={i} className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white flex justify-between items-center font-mono">
                  <span>{c}</span>
                  <button type="button" onClick={() => setCombos(combos.filter((_, idx) => idx !== i))} className="text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Drills List */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Drills y Trabajo Técnico</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                placeholder="Ej. 3 Rounds de Sombra con pesas"
                value={newDrill}
                onChange={e => setNewDrill(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
              />
              <button
                type="button"
                onClick={handleAddDrill}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
              >
                + Añadir
              </button>
            </div>
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {drills.map((d, i) => (
                <div key={i} className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-300 flex justify-between items-center">
                  <span>{d}</span>
                  <button type="button" onClick={() => setDrills(drills.filter((_, idx) => idx !== i))} className="text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Notas Internas</label>
            <textarea
              rows={2}
              placeholder="Consejos de postura..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg transition-all cursor-pointer border border-red-500/40"
          >
            {routineToEdit ? 'Guardar Cambios' : 'Crear Rutina'}
          </button>
        </form>

      </div>
    </div>
  );
};
