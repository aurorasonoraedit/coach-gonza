// Confirmación propia de la app (reemplaza window.confirm, que algunos navegadores bloquean)
export interface ConfirmRequest {
  message: string;
  okLabel: string;
  danger: boolean;
  resolve: (ok: boolean) => void;
}

type Listener = (req: ConfirmRequest | null) => void;
let listener: Listener | null = null;

export const setConfirmListener = (l: Listener | null) => {
  listener = l;
};

export const askConfirm = (
  message: string,
  opts: { okLabel?: string; danger?: boolean } = {}
): Promise<boolean> =>
  new Promise(resolve => {
    if (!listener) {
      // Respaldo por si la app todavía no montó el cartel
      resolve(typeof window !== 'undefined' ? window.confirm(message) : false);
      return;
    }
    listener({
      message,
      okLabel: opts.okLabel ?? 'Aceptar',
      danger: opts.danger ?? true,
      resolve
    });
  });
