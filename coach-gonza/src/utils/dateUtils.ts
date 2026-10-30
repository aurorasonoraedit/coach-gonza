import { Session } from '../types';

export const getTodayString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatCurrency = (amount: number, currencySymbol = '$'): string => {
  if (amount < 0) return `−${formatCurrency(-amount, currencySymbol)}`;
  return `${currencySymbol}${amount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const formatDateSpanish = (dateStr: string, includeDayName = true): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(includeDayName ? { weekday: 'long' } : {})
  };
  
  const formatted = date.toLocaleDateString('es-ES', options);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${day} ${months[month - 1]}`;
};

export const getDayOfWeekName = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
};

// Check if two time ranges overlap (e.g. 08:00 - 09:00 vs 08:30 - 09:30)
export const checkTimeOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };
  
  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);
  
  return s1 < e2 && s2 < e1;
};

// Returns conflicting sessions on the same date with overlapping times
export const findSessionConflicts = (sessions: Session[], targetSession: Partial<Session>): Session[] => {
  if (!targetSession.date || !targetSession.startTime || !targetSession.endTime) return [];
  
  return sessions.filter(s => {
    // Ignore current session if editing
    if (targetSession.id && s.id === targetSession.id) return false;
    if (s.status === 'cancelada') return false;
    if (s.date !== targetSession.date) return false;
    
    return checkTimeOverlap(s.startTime, s.endTime, targetSession.startTime!, targetSession.endTime!);
  });
};

export const getMonthDaysGrid = (year: number, monthIndex: number) => {
  // monthIndex: 0 = Jan, 7 = Aug
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
  
  // 0 = Sun, 1 = Mon... We want Monday to be start of week (1)
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6; // Sun becomes 6
  
  const daysInMonth = lastDayOfMonth.getDate();
  
  const grid: ({ dateStr: string; dayNumber: number; isCurrentMonth: boolean } | null)[] = [];
  
  // Previous month padding
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const pMonth = monthIndex === 0 ? 12 : monthIndex;
    const pYear = monthIndex === 0 ? year - 1 : year;
    const dateStr = `${pYear}-${String(pMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    grid.push({ dateStr, dayNumber: dayNum, isCurrentMonth: false });
  }
  
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    grid.push({ dateStr, dayNumber: d, isCurrentMonth: true });
  }
  
  // Next month padding to complete 35 or 42 grid cells
  const totalCells = grid.length > 35 ? 42 : 35;
  const remaining = totalCells - grid.length;
  for (let d = 1; d <= remaining; d++) {
    const nMonth = monthIndex === 11 ? 1 : monthIndex + 2;
    const nYear = monthIndex === 11 ? year + 1 : year;
    const dateStr = `${nYear}-${String(nMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    grid.push({ dateStr, dayNumber: d, isCurrentMonth: false });
  }
  
  return grid;
};
