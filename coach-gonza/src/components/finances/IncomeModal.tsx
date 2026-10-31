import React, { useState } from 'react';
import { PAYMENT_METHODS } from '../../utils/payments';
import { useApp } from '../../context/AppContext';
import { Income, PaymentMethod, PaymentStatus } from '../../types';
import { X } from 'lucide-react';
import { getTodayString } from '../../utils/dateUtils';

interface IncomeModalProps {
  incomeToEdit?: Income;
  onClose: () => void;
}

export const IncomeModal: React.FC<IncomeModalProps> = ({ incomeToEdit, onClose }) => {
  const { clients, profile, addIncome, updateIncome } = useApp();

  const [concept, setConcept] = useState(incomeToEdit ? incomeToEdit.concept : '');
  const [clientName, setClientName] = useState(incomeToEdit ? incomeToEdit.clientName : '');
  const [clientId, setClientId] = useState(incomeToEdit ? (incomeToEdit.clientId || '') : '');
  const [amount, setAmount] = useState<number>(incomeToEdit ? incomeToEdit.amount : 35);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(incomeToEdit ? incomeToEdit.paymentMethod : 'efectivo');
  const [status, setStatus] = useState<PaymentStatus>(incomeToEdit ? incomeToEdit.status : 'pagado');
  const [date, setDate] = useState(incomeToEdit ? incomeToEdit.date : getTodayString());
  const [notes, setNotes] = useState(incomeToEdit ? (incomeToEdit.notes || '') : '');

  const handleClientSelect = (cId: string) => {
    setClientId(cId);
    const c = clients.find(cl => cl.id === cId);
    if (c) {
      setClientName(c.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept || !amount) return;

    if (incomeToEdit) {
      updateIncome(incomeToEdit.id, {
        date,
        clientId: clientId || undefined,
        clientName: clientName || 'Cliente General',
        concept,
        amount: Number(amount),
        paymentMethod,
        status,
        notes
      });
    } else {
      addIncome({
        date,
        clientId: clientId || undefined,
        clientName: clientName || 'Cliente General',
        concept,
        amount: Number(amount),
        paymentMethod,
        status,
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
            {incomeToEdit ? 'Editar Registro de Ingreso' : 'Registrar Nuevo Ingreso'}
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
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Concepto / Servicio</label>
            <input
              type="text"
              required
              placeholder="Ej. Paquete 8 Sesiones / Mensualidad / Venta Vendas"
              value={concept}
              onChange={e => setConcept(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-ring-red"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Seleccionar Cliente</label>
              <select
                value={clientId}
                onChange={e => handleClientSelect(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
              >
                <option value="">Otro (escribí el nombre)</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Nombre de Cliente</label>
              <input
                type="text"
                placeholder="Nombre del pagador"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Monto ({profile.currencySymbol})</label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Fecha de Ingreso</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Método de Pago</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
              >
                {PAYMENT_METHODS.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                {!PAYMENT_METHODS.some(m => m.id === paymentMethod) && (
                  <option value={paymentMethod}>{paymentMethod}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Estado de Pago</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as PaymentStatus)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
              >
                <option value="pagado">✓ Pagado</option>
                <option value="pendiente">⏳ Pendiente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Notas Opcionales</label>
            <textarea
              rows={2}
              placeholder="Número de factura, comprobante..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 min-h-11 rounded-xl bg-zinc-900 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg transition-all cursor-pointer border border-ring-red/40"
          >
            {incomeToEdit ? 'Guardar Cambios' : 'Registrar Ingreso'}
          </button>
        </form>

      </div>
    </div>
  );
};
