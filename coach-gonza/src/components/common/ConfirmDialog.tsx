import React, { useEffect, useState } from 'react';
import { ConfirmRequest, setConfirmListener } from '../../utils/confirm';

export const ConfirmDialog: React.FC = () => {
  const [req, setReq] = useState<ConfirmRequest | null>(null);

  useEffect(() => {
    setConfirmListener(setReq);
    return () => setConfirmListener(null);
  }, []);

  if (!req) return null;

  const close = (ok: boolean) => {
    req.resolve(ok);
    setReq(null);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => close(false)}>
      <div
        role="alertdialog"
        aria-modal="true"
        className="bg-zinc-900 border border-zinc-700 rounded-t-3xl sm:rounded-2xl w-full max-w-sm p-5 pb-8 sm:pb-5 shadow-2xl space-y-4 safe-bottom"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-sm font-semibold text-white leading-snug">{req.message}</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => close(false)}
            className="py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm font-bold cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={() => close(true)}
            className={`py-3 rounded-xl text-white text-sm font-bold cursor-pointer ${
              req.danger ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {req.okLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
