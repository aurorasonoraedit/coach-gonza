import { Session, FightEvent, Income } from '../types';

// Frases propias de box: una distinta por día
const PHRASES = [
  'La guardia alta no se negocia.',
  'Primero los pies, después las manos.',
  'Cada round se gana en el gimnasio, no arriba del ring.',
  'Un buen jab abre todas las puertas.',
  'La disciplina le gana al talento cuando el talento no entrena.',
  'Mirá, pegá y salí. Siempre salí.',
  'Paciencia en la esquina, decisión en el ring.',
  'La técnica se repite hasta que sale sola.',
  'Formar boxeadores es formar personas.',
  'El cansancio es mental: un round más.',
  'El que entrena cuando nadie lo ve, gana cuando todos miran.',
  'Sin piernas no hay boxeo.',
  'La humildad también se entrena.',
  'Un alumno constante vale más que diez entusiasmados.',
  'Golpear es fácil. No recibir, eso es boxeo.'
];

const toMin = (hhmm: string) => {
  const [h, m] = (hhmm || '0:0').split(':').map(Number);
  return h * 60 + (m || 0);
};

const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const daysBetween = (fromIso: string, toIso: string) => {
  const [a, b, c] = fromIso.split('-').map(Number);
  const [x, y, z] = toIso.split('-').map(Number);
  return Math.round((Date.UTC(x, y - 1, z) - Date.UTC(a, b - 1, c)) / 86400000);
};

const who = (s: Session) => s.clientName || s.title;

export interface Greeting {
  title: string;
  line: string;
  badges: { text: string; tone: 'fight' | 'money' }[];
  phrase: string;
}

export const buildGreeting = (opts: {
  now: Date;
  nickname: string;
  sessions: Session[];
  events: FightEvent[];
  pendingIncomes: Income[];
  fmt: (n: number) => string;
}): Greeting => {
  const { now, nickname, sessions, events, pendingIncomes, fmt } = opts;
  const hour = now.getHours();
  const nowMin = hour * 60 + now.getMinutes();
  const today = isoDate(now);
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(now.getDate() + 1);
  const tomorrow = isoDate(tomorrowDate);

  const saludo = hour >= 5 && hour < 12 ? 'Buen día' : hour >= 12 && hour < 20 ? 'Buenas tardes' : 'Buenas noches';
  const title = `${saludo}, ${nickname}`;

  const active = (s: Session) => s.status !== 'cancelada';
  const byTime = (a: Session, b: Session) => toMin(a.startTime) - toMin(b.startTime);
  const todayList = sessions.filter(s => s.date === today && active(s)).sort(byTime);
  const tomorrowList = sessions.filter(s => s.date === tomorrow && active(s)).sort(byTime);

  const current = todayList.find(s => toMin(s.startTime) <= nowMin && nowMin < toMin(s.endTime) && s.status !== 'completada');
  const pendingToday = todayList.filter(s => toMin(s.startTime) > nowMin && s.status !== 'completada');
  const next = pendingToday[0];
  const remainingToday = pendingToday.length;

  let line: string;
  if (current) {
    line = `Ahora estás en clase con ${who(current)}, hasta las ${current.endTime}.`;
  } else if (next) {
    const mins = toMin(next.startTime) - nowMin;
    if (mins <= 60) {
      line = `En ${mins} min arrancás con ${who(next)} (${next.startTime}). ¡A guantear!`;
    } else {
      line =
        remainingToday === 1
          ? `Hoy te queda una clase: a las ${next.startTime} con ${who(next)}.`
          : `Hoy te quedan ${remainingToday} clases. La próxima es a las ${next.startTime} con ${who(next)}.`;
    }
  } else if (todayList.length > 0) {
    line =
      tomorrowList.length > 0 && hour >= 18
        ? `Terminaste las ${todayList.length} clases de hoy. Mañana arrancás a las ${tomorrowList[0].startTime}.`
        : `Terminaste las ${todayList.length === 1 ? 'clase' : `${todayList.length} clases`} de hoy. ¡Buen laburo! 💪`;
  } else if (tomorrowList.length > 0) {
    line = `Hoy no tenés clases. Mañana arrancás a las ${tomorrowList[0].startTime} con ${who(tomorrowList[0])}.`;
  } else {
    line =
      now.getDay() === 0
        ? 'Domingo sin clases: a recargar energía para la semana.'
        : 'No tenés clases agendadas. Buen momento para planificar o sumar alumnos.';
  }

  const badges: Greeting['badges'] = [];
  const fight = events
    .filter(e => (e.type === 'pelea' || e.type === 'competencia') && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  if (fight) {
    const d = daysBetween(today, fight.date);
    if (d <= 14) {
      const when = d === 0 ? '¡Hoy!' : d === 1 ? 'Mañana' : `En ${d} días`;
      badges.push({ text: `${when}: ${fight.title}`, tone: 'fight' });
    }
  }
  if (pendingIncomes.length > 0) {
    const total = pendingIncomes.reduce((s, i) => s + i.amount, 0);
    badges.push({
      text: `${pendingIncomes.length === 1 ? '1 cobro pendiente' : `${pendingIncomes.length} cobros pendientes`} · ${fmt(total)}`,
      tone: 'money'
    });
  }

  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  const phrase = PHRASES[dayOfYear % PHRASES.length];

  return { title, line, badges, phrase };
};
