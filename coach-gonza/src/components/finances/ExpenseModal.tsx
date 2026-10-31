import React, { useState } from 'react';
import { X, Save, Building2, Package, Car, FileText, Megaphone, Lightbulb, Box, LucideIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Expense, ExpenseCategory } from '../../types';
import { getTodayString } from '../../utils/dateUtils';

export const EXPENSE_CATEGORIES: { id: ExpenseCategory; label: string; emoji: string; icon: LucideIcon }[] = [
  { id: 'alquiler', label: 'Alquiler / Gimnasio', emoji: '🏠', icon: Building2 },
  { id: 'equipamiento', label: 'Equipamiento', emoji: '🥊', icon: Package },
  { id: 'transporte', label: 'Transporte / Viajes', emoji: '🚗', icon: Car },
  { id: 'federacion', label: 'Federación / Inscripciones', emoji: '📝', icon: FileText },
  { id: 'publicidad', label: 'Publicidad / Redes', emoji: '📣', icon: Megaphone },
  { id: 'servicios', label: 'Servicios (luz, internet…)', emoji: '💡', icon: Lightbulb },
  { id: 'otro', label: 'Otro', emoji: '📦', icon: Box }
];

export const categoryInfo = (id: ExpenseCategory) =>
  EXPENSE_CATEGORIES.find(c => c.id === id) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];

interface Props {
  expenseToEdit?: Expense;
  onClose: () => void;
}

const inputCls =
  'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red';

export const ExpenseModal: React.FC<Props> = ({ expenseToEdit, onClose }) => {
  const { addExpense, updateExpense, profile } = useApp();
  const [concept, setConcept] = useState(expenseToEdit?.concept ?? '');
  const [category, setCategory] = useState<ExpenseCategory>(expenseToEdit?.category ?? 'equipamiento');
  const [amount, setAmount] = useState<string>(expenseToEdit ? String(expenseToEdit.amount) : '');
  const [date, setDate] = useState(expenseToEdit?.date ?? getTodayString());
  const [notes, setNotes] = useState(expenseToEdit?.notes ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      concept: concept.trim() || categoryInfo(category).label,
      category,
      amount: Number(amount),
      date,
      notes: notes.trim() || undefined
    };
    if (expenseToEdit) updateExpense(expenseToEdit.id, data);
    else addExpense(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-6">
        <div className="flex items-center justify-between bg-zinc-950 px-5 py-4 border-b border-zinc-800">
          <h2 className="text-base font-bold text-white tracking-tight">
            {expenseToEdit ? 'Editar gasto' : 'Registrar gasto'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-11 h-11 inline-flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">Categoría</label>
            <div className="grid grid-cols-2 gap-2">
              {EXPENSE_CATEGORIES.map(c => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`text-left text-[12.5px] font-semibold px-2.5 py-2 rounded-lg border transition-all cursor-pointer ${
                    category === c.id
                      ? 'bg-red-950/70 border-red-600 text-white'
                      : 'bg-zinc-800/60 border-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                >
                  <c.icon className="w-4 h-4 inline-block mr-1.5 -mt-0.5 text-zinc-400" />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Concepto</label>
            <input
              type="text"
              placeholder="Ej. Guantes 14oz, alquiler del mes, nafta a la velada"
              value={concept}
              onChange={e => setConcept(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Monto ({profile.currencySymbol})</label>
              <input
                type="number"
                inputMode="decimal"
                required
                min="1"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Fecha</label>
              <input type="date" required value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Notas (opcional)</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className={inputCls} />
          </div>

          <button
            type="submit"
            className="w-full bg-ring-red hover:bg-ring-red-deep text-white font-bold text-sm py-2.5 min-h-11 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" /> {expenseToEdit ? 'Guardar cambios' : 'Registrar gasto'}
          </button>
        </form>
      </div>
    </div>
  );
};
