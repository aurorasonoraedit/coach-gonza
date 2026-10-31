import React, { useEffect, useState } from 'react';
import { buildGreeting } from '../../utils/greeting';
import { waLink, paymentReminderText } from '../../utils/whatsapp';
import { useApp } from '../../context/AppContext';
import { MessageCircle, Plus, Check, ChevronRight, MapPin, CalendarPlus } from 'lucide-react';
import { useNews, timeAgo } from '../../utils/news';
import { getTodayString, formatCurrency, formatDateSpanish, formatShortDate } from '../../utils/dateUtils';
import { Session } from '../../types';
import { SessionDetailModal } from '../sessions/SessionDetailModal';

const toMin = (hhmm: string) => {
  const [h, m] = (hhmm || '0:0').split(':').map(Number);
  return h * 60 + (m || 0);
};

const daysUntil = (iso: string, today: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86400000);
};

export const DashboardView: React.FC = () => {
  const {
    profile,
    sessions,
    clients,
    incomes,
    events,
    openQuickAdd,
    setActiveTab,
    markSessionStatus,
    openPayPrompt,
    setCornerEventId
  } = useApp();

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(id);
  }, []);

  const fmt = (n: number) => formatCurrency(n, profile.currencySymbol);
  const todayStr = getTodayString();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const todaySessions = sessions
    .filter(s => s.date === todayStr && s.status !== 'cancelada')
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // La clase que importa ahora: la que está en curso o la próxima de hoy; si no, la primera de mañana en adelante
  const current = todaySessions.find(s => toMin(s.startTime) <= nowMin && nowMin < toMin(s.endTime) && s.status !== 'completada');
  const nextToday = todaySessions.find(s => toMin(s.startTime) > nowMin && s.status !== 'completada');
  const nextLater = sessions
    .filter(s => s.date > todayStr && s.status !== 'cancelada' && s.status !== 'completada')
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))[0];
  const focus = current ?? nextToday ?? nextLater;
  const focusIsToday = focus?.date === todayStr;
  const restOfToday = todaySessions.filter(s => s.id !== focus?.id);

  const pendingIncomes = incomes.filter(i => i.status === 'pendiente').sort((a, b) => a.date.localeCompare(b.date));
  const totalPending = pendingIncomes.reduce((s, i) => s + i.amount, 0);
  const todayPaid = incomes.filter(i => i.date === todayStr && i.status === 'pagado').reduce((s, i) => s + i.amount, 0);
  const monthPaid = incomes.filter(i => i.date.startsWith(todayStr.slice(0, 7)) && i.status === 'pagado').reduce((s, i) => s + i.amount, 0);

  const nextFight = events
    .filter(e => (e.type === 'pelea' || e.type === 'competencia') && e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const fightDays = nextFight ? daysUntil(nextFight.date, todayStr) : 99;

  const greeting = buildGreeting({
    now,
    nickname: profile.nickname?.trim() || profile.name.split(' ')[0],
    sessions,
    events,
    pendingIncomes,
    fmt
  });

  const { items: newsItems } = useNews();

  const clientOf = (s: Session) => clients.find(c => c.id === s.clientId);
  const classReminderLink = (s: Session) => {
    const c = clientOf(s);
    const first = (s.clientName || c?.name || '').split(' ')[0];
    return waLink(
      c?.whatsapp || c?.phone,
      `¡Hola ${first}! Te recuerdo la clase ${s.date === todayStr ? 'de hoy' : `del ${formatShortDate(s.date)}`} a las ${s.startTime}${s.location ? ` en ${s.location}` : ''}. ¡Nos vemos! 🥊\n— Coach Gonza`
    );
  };

  const debtLink = (clientName: string, clientId?: string) => {
    const c = clients.find(x => x.id === clientId) || clients.find(x => x.name === clientName);
    const items = pendingIncomes
      .filter(i => (clientId && i.clientId === clientId) || i.clientName === clientName)
      .map(i => ({ concept: i.concept, date: i.date, amount: i.amount }));
    return waLink(c?.whatsapp || c?.phone, paymentReminderText(clientName, items, fmt));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-7">
      {/* Saludo */}
      <section>
        <p className="text-sm text-zinc-400 flex items-center gap-2 flex-wrap">
          <span>{(d => d.charAt(0).toUpperCase() + d.slice(1).toLowerCase())(formatDateSpanish(todayStr))}</span>
          {profile.handle && <span className="text-zinc-500">· {profile.handle}</span>}
        </p>
        <h1 className="font-display font-extrabold uppercase text-[34px] leading-[0.95] tracking-tight mt-1.5">{greeting.title}</h1>
        <p className="text-[16px] text-zinc-200 leading-snug mt-2">{greeting.line}</p>
      </section>

      {/* Próxima clase */}
      <section aria-labelledby="prox-title">
        <h2 id="prox-title" className="text-sm font-semibold text-zinc-400 mb-2">
          {current ? 'En clase ahora' : focus ? (focusIsToday ? 'Próxima clase' : `Próxima clase · ${formatShortDate(focus.date)}`) : 'Clases'}
        </h2>
        {focus ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <button onClick={() => setSelectedSession(focus)} className="w-full text-left p-4 flex items-start gap-4 cursor-pointer">
              <span className="font-display font-extrabold text-[56px] leading-[0.85] tabular text-white">{focus.startTime}</span>
              <span className="min-w-0 flex-1 pt-1">
                <span className="block text-lg font-bold leading-snug">{focus.clientName || focus.title}</span>
                <span className="block text-sm text-zinc-400 mt-0.5">{focus.title}</span>
                {focus.location && (
                  <span className="text-sm text-zinc-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {focus.location}
                  </span>
                )}
              </span>
              <ChevronRight className="w-5 h-5 text-zinc-600 mt-2 shrink-0" />
            </button>
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              {focus.paymentStatus === 'pendiente' && focus.price > 0 ? (
                <button
                  onClick={() => openPayPrompt({ sessionId: focus.id })}
                  className="h-12 rounded-xl bg-ring-red hover:bg-ring-red-deep text-white font-bold cursor-pointer"
                >
                  Cobrar {fmt(focus.price)}
                </button>
              ) : focus.status !== 'completada' && focusIsToday ? (
                <button
                  onClick={() => markSessionStatus(focus.id, 'completada')}
                  className="h-12 rounded-xl bg-ring-red hover:bg-ring-red-deep text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-5 h-5" /> Completar
                </button>
              ) : (
                <span className="h-12 rounded-xl bg-zinc-800 text-zinc-300 font-semibold flex items-center justify-center gap-1.5">
                  <Check className="w-5 h-5 text-green-500" /> {focus.status === 'completada' ? 'Completada' : 'Pagada'}
                </span>
              )}
              <a
                href={classReminderLink(focus)}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-5 h-5" /> Avisar
              </a>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-zinc-700 rounded-2xl p-5 text-center">
            <p className="font-semibold">No tenés clases agendadas</p>
            <button
              onClick={() => openQuickAdd('session')}
              className="mt-3 h-12 px-5 rounded-xl bg-ring-red hover:bg-ring-red-deep text-white font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <CalendarPlus className="w-5 h-5" /> Agendar una clase
            </button>
          </div>
        )}
      </section>

      {/* La plata */}
      <section aria-label="La plata">
        <div className="grid grid-cols-2 border-y border-zinc-800 divide-x divide-zinc-800">
          <button onClick={() => setActiveTab('finances')} className="py-3 pr-3 text-left cursor-pointer">
            <span className="block text-sm text-zinc-400">Cobrado hoy</span>
            <span className="block font-display font-extrabold text-[30px] leading-none mt-1 tabular">{fmt(todayPaid)}</span>
            <span className="block text-[13px] text-zinc-500 mt-1 tabular">Este mes {fmt(monthPaid)}</span>
          </button>
          <button onClick={() => setActiveTab('finances')} className="py-3 pl-4 text-left cursor-pointer">
            <span className="block text-sm text-zinc-400">Te deben</span>
            <span className={`block font-display font-extrabold text-[30px] leading-none mt-1 tabular ${totalPending ? 'text-amber-500' : 'text-white'}`}>
              {fmt(totalPending)}
            </span>
            <span className="block text-[13px] text-zinc-500 mt-1">
              {pendingIncomes.length === 0 ? 'Nadie, estás al día' : `${pendingIncomes.length} ${pendingIncomes.length === 1 ? 'cobro' : 'cobros'} · ver`}
            </span>
          </button>
        </div>

        {pendingIncomes.length > 0 && (
          <ul className="divide-y divide-zinc-800 border-b border-zinc-800">
            {pendingIncomes.slice(0, 3).map(inc => (
              <li key={inc.id} className="py-2.5 flex items-center gap-3">
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold truncate">{inc.clientName}</span>
                  <span className="block text-[13px] text-zinc-400 truncate">{inc.concept} · {formatShortDate(inc.date)}</span>
                </span>
                <span className="font-display font-bold text-xl tabular text-amber-500">{fmt(inc.amount)}</span>
                <a
                  href={debtLink(inc.clientName, inc.clientId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Recordarle el pago a ${inc.clientName} por WhatsApp`}
                  className="w-11 h-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center shrink-0"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <button
                  onClick={() => openPayPrompt({ sessionId: inc.sessionId, incomeId: inc.id })}
                  className="h-11 px-3 rounded-xl bg-zinc-100 text-zinc-950 text-sm font-bold shrink-0 cursor-pointer"
                >
                  Cobrado
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Próxima pelea */}
      {nextFight && fightDays <= 7 && (
        <section aria-labelledby="pelea-title">
          <h2 id="pelea-title" className="text-sm font-semibold text-zinc-400 mb-2">
            Próxima pelea · {fightDays === 0 ? 'hoy' : fightDays === 1 ? 'mañana' : `en ${fightDays} días`}
          </h2>
          <button
            onClick={() => (nextFight.rival ? setCornerEventId(nextFight.id) : setActiveTab('events'))}
            className="w-full text-left bg-zinc-900 border border-zinc-800 hover:border-ring-red rounded-2xl p-4 flex items-center gap-4 cursor-pointer"
          >
            <span className="text-center w-12 shrink-0">
              <span className="block font-display font-extrabold text-[30px] leading-none text-ring-red tabular">{formatShortDate(nextFight.date).split(' ')[0]}</span>
              <span className="block text-[13px] font-semibold uppercase text-zinc-400 mt-1">{formatShortDate(nextFight.date).split(' ')[1]}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold leading-snug">{nextFight.title}</span>
              <span className="block text-sm text-zinc-400 mt-0.5">
                {nextFight.rival ? `vs ${nextFight.rival.name}` : 'Sin ficha del rival todavía'}
              </span>
            </span>
            <span className="shrink-0 h-11 px-3 rounded-xl bg-ring-red text-white text-sm font-bold flex items-center">
              {nextFight.rival ? 'Esquina' : 'Ver'}
            </span>
          </button>
        </section>
      )}

      {/* El resto del día */}
      {restOfToday.length > 0 && (
        <section aria-labelledby="hoy-title">
          <div className="flex items-baseline justify-between mb-1">
            <h2 id="hoy-title" className="text-sm font-semibold text-zinc-400">Hoy</h2>
            <button onClick={() => setActiveTab('calendar')} className="h-11 -mr-2 px-2 text-sm font-semibold text-zinc-300 hover:text-white cursor-pointer">
              Ver agenda
            </button>
          </div>
          <ul className="divide-y divide-zinc-800 border-y border-zinc-800">
            {restOfToday.map(s => {
              const done = s.status === 'completada';
              return (
                <li key={s.id} className="flex items-center gap-3">
                  <button onClick={() => setSelectedSession(s)} className="min-w-0 flex-1 py-3 flex items-center gap-3 text-left cursor-pointer">
                    <span className={`font-display font-bold text-2xl w-16 tabular ${done ? 'text-zinc-500' : 'text-white'}`}>{s.startTime}</span>
                    <span className="min-w-0">
                      <span className={`block font-semibold truncate ${done ? 'text-zinc-400' : ''}`}>{s.clientName || s.title}</span>
                      <span className="block text-[13px] text-zinc-400 truncate">
                        {done ? 'Completada' : 'Programada'} · {s.paymentStatus === 'pendiente' ? <span className="text-amber-500">debe {fmt(s.price)}</span> : 'pagada'}
                      </span>
                    </span>
                  </button>
                  {s.paymentStatus === 'pendiente' && s.price > 0 && (
                    <button
                      onClick={() => openPayPrompt({ sessionId: s.id })}
                      className="h-11 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-bold shrink-0 cursor-pointer"
                    >
                      Cobrar
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Noticias */}
      {newsItems.length > 0 && (
        <section aria-labelledby="news-title">
          <div className="flex items-baseline justify-between mb-1">
            <h2 id="news-title" className="text-sm font-semibold text-zinc-400">Lo último del box</h2>
            <button onClick={() => setActiveTab('news')} className="h-11 -mr-2 px-2 text-sm font-semibold text-zinc-300 hover:text-white cursor-pointer">
              Ver todas
            </button>
          </div>
          <ul className="divide-y divide-zinc-800 border-y border-zinc-800">
            {newsItems.slice(0, 3).map(item => (
              <li key={item.link}>
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="block py-3">
                  <span className="block font-semibold leading-snug">{item.title}</span>
                  <span className="block text-[13px] text-zinc-400 mt-1">{item.source} · {timeAgo(item.date)}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-sm text-zinc-500 italic text-center pb-16 sm:pb-2">“{greeting.phrase}”</p>

      {/* Nuevo: un solo botón, en la zona del pulgar */}
      <button
        onClick={() => openQuickAdd()}
        aria-label="Agregar: clase, alumno, cobro o pelea"
        className="fixed right-4 z-30 w-14 h-14 rounded-full bg-zinc-100 text-zinc-950 shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-pointer active:scale-95 sm:hidden"
        style={{ bottom: 'calc(5.75rem + env(safe-area-inset-bottom))' }}
      >
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </button>

      {selectedSession && <SessionDetailModal session={selectedSession} onClose={() => setSelectedSession(null)} />}
    </div>
  );
};
