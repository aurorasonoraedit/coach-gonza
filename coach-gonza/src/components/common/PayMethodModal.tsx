import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PAYMENT_METHODS } from '../../utils/payments';
import { formatCurrency } from '../../utils/dateUtils';

/** Hoja "¿Cómo te pagó?" que aparece al registrar un cobro */
export const PayMethodModal: React.FC = () => {
  const { payPrompt, closePayPrompt, confirmPayment, sessions, incomes, profile } = useApp();
  if (!payPrompt) return null;

  const session = payPrompt.sessionId ? sessions.find(s => s.id === payPrompt.sessionId) : undefined;
  const income = payPrompt.incomeId ? incomes.find(i => i.id === payPrompt.incomeId) : undefined;
  const who = session?.clientName || income?.clientName || '';
  const amount = session?.price ?? income?.amount;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={closePayPrompt}>
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-t-3xl sm:rounded-2xl w-full max-w-sm p-5 pb-8 sm:pb-5 shadow-2xl space-y-4 safe-bottom"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-black text-white">¿Cómo te pagó?</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {who}
              {amount !== undefined && <span className="text-green-400 font-bold"> · {formatCurrency(amount, profile.currencySymbol)}</span>}
            </p>
          </div>
          <button onClick={closePayPrompt} aria-label="Cerrar" className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2">
          {PAYMENT_METHODS.map(m => (
            <button
              key={m.id}
              onClick={() => confirmPayment(m.id)}
              className="w-full flex items-center gap-3 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.99] border border-zinc-700 rounded-xl px-4 py-3.5 text-left cursor-pointer"
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-sm font-bold text-white">{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
