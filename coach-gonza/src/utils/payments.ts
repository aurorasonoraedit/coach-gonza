import { PaymentMethod } from '../types';

// Métodos que se ofrecen al cargar un cobro (Argentina)
export const PAYMENT_METHODS: { id: PaymentMethod; label: string; short: string; emoji: string }[] = [
  { id: 'efectivo', label: 'Efectivo', short: 'Efectivo', emoji: '💵' },
  { id: 'transferencia', label: 'Transferencia bancaria', short: 'Transferencia', emoji: '🏦' },
  { id: 'mercadopago', label: 'Mercado Pago', short: 'Mercado Pago', emoji: '📱' }
];

// Valores de versiones anteriores: se siguen mostrando bien si ya estaban cargados
const LEGACY: Record<string, { label: string; short: string; emoji: string }> = {
  tarjeta: { label: 'Tarjeta', short: 'Tarjeta', emoji: '💳' },
  bizum_zelle: { label: 'Mercado Pago', short: 'Mercado Pago', emoji: '📱' },
  otro: { label: 'Otro', short: 'Otro', emoji: '🔄' }
};

export const paymentInfo = (m: string) =>
  PAYMENT_METHODS.find(p => p.id === m) || LEGACY[m] || { label: m, short: m, emoji: '💰' };

export const paymentLabel = (m: string) => paymentInfo(m).short;
