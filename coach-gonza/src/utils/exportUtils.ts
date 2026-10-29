import { Session, Client, Income } from '../types';

export const exportSessionsToCSV = (sessions: Session[]) => {
  const headers = ['ID', 'Título', 'Tipo', 'Fecha', 'Hora Inicio', 'Hora Fin', 'Cliente', 'Lugar', 'Estado', 'Estado Pago', 'Precio ($)', 'Notas'];
  const rows = sessions.map(s => [
    s.id,
    `"${s.title.replace(/"/g, '""')}"`,
    s.sessionType,
    s.date,
    s.startTime,
    s.endTime,
    `"${(s.clientName || 'N/A').replace(/"/g, '""')}"`,
    `"${s.location.replace(/"/g, '""')}"`,
    s.status,
    s.paymentStatus,
    s.price,
    `"${(s.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  downloadFile(csvContent, `BoxCoach_Sesiones_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
};

export const exportIncomesToCSV = (incomes: Income[]) => {
  const headers = ['ID', 'Fecha', 'Cliente', 'Concepto', 'Monto ($)', 'Método Pago', 'Estado', 'Notas'];
  const rows = incomes.map(inc => [
    inc.id,
    inc.date,
    `"${(inc.clientName || 'N/A').replace(/"/g, '""')}"`,
    `"${inc.concept.replace(/"/g, '""')}"`,
    inc.amount,
    inc.paymentMethod,
    inc.status,
    `"${(inc.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  downloadFile(csvContent, `BoxCoach_Ingresos_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
};

export const exportClientsToCSV = (clients: Client[]) => {
  const headers = ['ID', 'Nombre', 'Teléfono', 'WhatsApp', 'Email', 'Nivel', 'Objetivo', 'Sesiones Completadas', 'Sesiones Paquete Restantes', 'Notas'];
  const rows = clients.map(c => [
    c.id,
    `"${c.name.replace(/"/g, '""')}"`,
    c.phone,
    c.whatsapp || '',
    c.email || '',
    c.level,
    c.goal,
    c.totalSessionsCompleted || 0,
    c.sessionsRemaining || 0,
    `"${(c.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  downloadFile(csvContent, `BoxCoach_Clientes_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob(['\ufeff' + content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
