// Arma links de WhatsApp que funcionan con números argentinos escritos de cualquier forma:
// "11 2345-6789", "15 2345 6789", "011 15 2345-6789", "+54 9 11 2345 6789"…
export const normalizePhoneAR = (raw?: string): string => {
  const trimmed = (raw || '').trim();
  let d = trimmed.replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('00')) d = d.slice(2);
  // Número de otro país escrito con "+" (ej. +34…): se deja como está
  if ((trimmed.startsWith('+') || trimmed.startsWith('00')) && !d.startsWith('54')) return d;
  if (d.startsWith('54')) {
    d = d.slice(2);
    if (d.startsWith('9')) d = d.slice(1);
  }
  if (d.startsWith('0')) d = d.slice(1);
  // Quitar el "15" de celular: AMBA 11-15-XXXX-XXXX o interior (2-4 dígitos de área) + 15
  if (d.length === 12) {
    for (const areaLen of [2, 3, 4]) {
      if (d.slice(areaLen, areaLen + 2) === '15') { d = d.slice(0, areaLen) + d.slice(areaLen + 2); break; }
    }
  }
  // "15 2345 6789" sin característica: se asume AMBA (11)
  if (d.length === 10 && d.startsWith('15')) d = '11' + d.slice(2);
  if (d.length === 8) d = '11' + d;
  return d.length === 10 ? '549' + d : d;
};

/** Base del link: con número abre ese chat; sin número deja elegir el contacto. */
export const waBase = (raw?: string): string => {
  const n = normalizePhoneAR(raw);
  return n ? `https://wa.me/${n}` : 'https://wa.me/';
};

export const waLink = (raw: string | undefined, text: string): string =>
  `${waBase(raw)}?text=${encodeURIComponent(text)}`;

export const firstName = (name: string) => (name || '').trim().split(/\s+/)[0] || '';

interface DebtItem {
  concept: string;
  date: string; // YYYY-MM-DD
  amount: number;
}

const shortDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
};

/** Mensaje amable de recordatorio de pago, listo para WhatsApp. */
export const paymentReminderText = (
  clientName: string,
  items: DebtItem[],
  fmt: (n: number) => string,
  coachName: string
): string => {
  const total = items.reduce((s, i) => s + i.amount, 0);
  const hola = `¡Hola ${firstName(clientName) || ''}! 👋`.replace(' !', '!');
  const detalle =
    items.length === 1
      ? `Te escribo para recordarte que quedó pendiente el pago de *${items[0].concept}* (${shortDate(items[0].date)}): *${fmt(total)}*.`
      : `Te escribo para recordarte que quedaron pendientes estos pagos:\n${items
          .map(i => `• ${i.concept} (${shortDate(i.date)}): ${fmt(i.amount)}`)
          .join('\n')}\n*Total: ${fmt(total)}*`;
  return `${hola}\n${detalle}\nPodés abonarlo en efectivo en la próxima clase o por transferencia. ¡Gracias! 🥊\n— ${firstName(coachName) || 'Tu entrenador'}`;
};
