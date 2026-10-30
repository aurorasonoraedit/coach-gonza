import React, { useEffect, useState } from 'react';
import { buildGreeting } from '../../utils/greeting';
import { waBase } from '../../utils/whatsapp';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Users,
  DollarSign,
  Swords,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  MessageCircle,
  TrendingUp,
  Flame,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Newspaper, Timer } from 'lucide-react';
import { useNews } from '../../utils/news';
import { NewsCard } from '../news/NewsView';
import { getTodayString, formatCurrency, formatDateSpanish, formatShortDate } from '../../utils/dateUtils';
import { Session, FightEvent } from '../../types';
import { SessionDetailModal } from '../sessions/SessionDetailModal';

export const DashboardView: React.FC = () => {
  const {
    profile,
    sessions,
    clients,
    incomes,
    events,
    reminders,
    openQuickAdd,
    setActiveTab,
    markSessionStatus,
    markSessionPaid,
    openPayPrompt,
    toggleReminder
  } = useApp();

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const todayStr = getTodayString();

  // Sessions for today
  const todaySessions = sessions
    .filter(s => s.date === todayStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Income metrics
  // Today's paid income
  const todayIncome = incomes
    .filter(i => i.date === todayStr && i.status === 'pagado')
    .reduce((sum, i) => sum + i.amount, 0);

  // Week income (current 7 days)
  const dToday = new Date(todayStr);
  const weekAgo = new Date(dToday);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().slice(0, 10);

  const weekIncome = incomes
    .filter(i => i.date >= weekAgoStr && i.date <= todayStr && i.status === 'pagado')
    .reduce((sum, i) => sum + i.amount, 0);

  // Month income (August 2026 or current YYYY-MM)
  const currentMonthPrefix = todayStr.slice(0, 7);
  const monthIncome = incomes
    .filter(i => i.date.startsWith(currentMonthPrefix) && i.status === 'pagado')
    .reduce((sum, i) => sum + i.amount, 0);

  // Pending payments
  const pendingIncomes = incomes.filter(i => i.status === 'pendiente');
  const totalPendingAmount = pendingIncomes.reduce((sum, i) => sum + i.amount, 0);

  // Upcoming sessions (after today)
  const upcomingSessions = sessions
    .filter(s => s.date > todayStr && s.status !== 'cancelada')
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .slice(0, 3);

  // Upcoming important events/fights
  const upcomingEvents = events
    .filter(e => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  // Pending reminders
  const pendingReminders = reminders.filter(r => !r.isCompleted).slice(0, 4);
  const { items: newsItems } = useNews();
  const latestNews = newsItems.slice(0, 3);

  // Saludo dinámico: se actualiza cada minuto
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(id);
  }, []);
  const greeting = buildGreeting({
    now,
    nickname: profile.nickname?.trim() || profile.name.split(' ')[0],
    sessions,
    events,
    pendingIncomes,
    fmt: n => formatCurrency(n, profile.currencySymbol)
  });

  return (
    <div className="space-y-6 pb-20 pt-2 px-4 max-w-7xl mx-auto">
      
      {/* Coach Greeting & Identity Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-red-950/70 border border-zinc-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-red-600/10 to-transparent pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center space-x-1.5 text-red-400 text-xs font-bold uppercase tracking-wider bg-red-950/80 border border-red-800/60 px-2.5 py-0.5 rounded-md">
                <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span>{formatDateSpanish(todayStr)}</span>
              </span>

              {profile.handle && (
                <span className="text-xs font-extrabold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2.5 py-0.5 rounded-md">
                  {profile.handle}
                </span>
              )}

              {profile.coTrainer?.trim() && (
                <span className="text-xs font-extrabold text-blue-300 bg-blue-950/60 border border-blue-800/40 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                  <span>EQUIPO: {profile.coTrainer.toUpperCase()}</span>
                </span>
              )}

              {profile.sponsors && profile.sponsors.length > 0 && (
                <span className="text-xs font-semibold text-zinc-300 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-md">
                  🥊 Partner: {profile.sponsors.join(', ')}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {greeting.title}
              </h1>
              <p className="text-sm text-zinc-200 mt-1.5 leading-snug">{greeting.line}</p>
              {greeting.badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {greeting.badges.map(b => (
                    <button
                      key={b.text}
                      onClick={() => setActiveTab(b.tone === 'fight' ? 'events' : 'finances')}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer ${
                        b.tone === 'fight'
                          ? 'bg-amber-950/60 border-amber-800/60 text-amber-300'
                          : 'bg-zinc-800/80 border-zinc-700 text-amber-200'
                      }`}
                    >
                      {b.tone === 'fight' ? '🥊 ' : '💰 '}
                      {b.text}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-zinc-400 italic mt-3 border-l-2 border-red-600/70 pl-2">
                “{greeting.phrase}”
              </p>
            </div>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
            <button
              onClick={() => openQuickAdd('session')}
              className="bg-zinc-800/90 hover:bg-zinc-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl border border-zinc-700/60 flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-red-500" />
              <span>+ Sesión</span>
            </button>
            <button
              onClick={() => openQuickAdd('client')}
              className="bg-zinc-800/90 hover:bg-zinc-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl border border-zinc-700/60 flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>+ Cliente</span>
            </button>
            <button
              onClick={() => openQuickAdd('income')}
              className="bg-zinc-800/90 hover:bg-zinc-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl border border-zinc-700/60 flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95"
            >
              <DollarSign className="w-3.5 h-3.5 text-green-400" />
              <span>+ Ingreso</span>
            </button>
            <button
              onClick={() => openQuickAdd('event')}
              className="bg-zinc-800/90 hover:bg-zinc-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl border border-zinc-700/60 flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Evento</span>
            </button>
            <button
              onClick={() => setActiveTab('timer')}
              className="col-span-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black py-2.5 px-3 rounded-xl border border-red-500/60 flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95 shadow-lg shadow-red-950/40"
            >
              <Timer className="w-4 h-4" />
              <span>Timer de rounds</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Today's Income */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-lg hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-1">
            <span>Ingreso Hoy</span>
            <div className="p-1.5 rounded-lg bg-green-950/80 text-green-400 border border-green-800/40">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-white tracking-tight">
            {formatCurrency(todayIncome, profile.currencySymbol)}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">Recaudado el día de hoy</p>
        </div>

        {/* Week's Income */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-lg hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-1">
            <span>Esta Semana</span>
            <div className="p-1.5 rounded-lg bg-blue-950/80 text-blue-400 border border-blue-800/40">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-white tracking-tight">
            {formatCurrency(weekIncome, profile.currencySymbol)}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">Últimos 7 días</p>
        </div>

        {/* Month's Income */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-lg hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-1">
            <span>Mes Actual</span>
            <div className="p-1.5 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/40">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-amber-400 tracking-tight">
            {formatCurrency(monthIncome, profile.currencySymbol)}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">Total de cobros de este mes</p>
        </div>

        {/* Pending Incomes */}
        <div className="bg-zinc-900/90 border border-amber-900/40 rounded-2xl p-4 shadow-lg hover:border-amber-700/50 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-1">
            <span>Por Cobrar</span>
            <div className="p-1.5 rounded-lg bg-red-950/80 text-red-400 border border-red-800/40">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-red-400 tracking-tight">
            {formatCurrency(totalPendingAmount, profile.currencySymbol)}
          </p>
          <p className="text-[10px] text-red-400/80 font-medium mt-1">
            {pendingIncomes.length} cobro(s) pendiente(s)
          </p>
        </div>

      </div>

      {/* Main Content Layout: Today's Schedule & Side Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Today's Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-500" />
              Sesiones de Hoy ({todaySessions.length})
            </h2>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Ver Agenda Completa <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todaySessions.length === 0 ? (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-500">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-300">No hay sesiones agendadas para hoy</p>
              <p className="text-xs text-zinc-500 mt-1">Aprovecha para descansar o agendar nuevos turnos.</p>
              <button
                onClick={() => openQuickAdd('session')}
                className="mt-4 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                + Agendar Sesión Hoy
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySessions.map(session => {
                const client = clients.find(c => c.id === session.clientId);
                return (
                  <div
                    key={session.id}
                    className={`bg-zinc-900 border rounded-2xl p-4 transition-all shadow-md relative overflow-hidden ${
                      session.status === 'completada'
                        ? 'border-green-900/50 bg-green-950/10'
                        : session.status === 'cancelada'
                        ? 'border-red-900/40 opacity-60'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start space-x-3 min-w-0">
                        {/* Time box */}
                        <div className="bg-zinc-800 border border-zinc-700/60 rounded-xl px-2.5 py-1.5 text-center shrink-0">
                          <span className="block text-xs font-black text-red-400">{session.startTime}</span>
                          <span className="block text-[10px] text-zinc-400 font-medium">{session.endTime}</span>
                        </div>

                        {/* Details */}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-bold text-white leading-snug">{session.title}</h3>
                          </div>
                          
                          <p className="text-xs text-zinc-400 mt-0.5 flex flex-wrap items-center gap-x-1.5">
                            <span className="font-semibold text-zinc-200">{session.clientName || 'Cliente'}</span>
                            <span>•</span>
                            <span className="text-zinc-400">{session.location}</span>
                          </p>

                          {/* Status Pills */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {session.sessionType.replace('_', ' ')}
                            </span>
                            
                            {/* Session Status Pill */}
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                session.status === 'completada'
                                  ? 'bg-green-950 text-green-400 border-green-800'
                                  : session.status === 'cancelada'
                                  ? 'bg-red-950 text-red-400 border-red-800'
                                  : 'bg-blue-950 text-blue-400 border-blue-800'
                              }`}
                            >
                              {session.status}
                            </span>

                            {/* Payment Status Pill */}
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                session.paymentStatus === 'pagada'
                                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                  : 'bg-amber-950 text-amber-400 border-amber-800 animate-pulse'
                              }`}
                            >
                              {session.paymentStatus === 'pagada' ? 'Pagada' : 'Pendiente Pago'} ({formatCurrency(session.price, profile.currencySymbol)})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action buttons */}
                      <div className="flex flex-wrap sm:flex-col items-center sm:items-end gap-1.5 shrink-0 border-t sm:border-t-0 border-zinc-800 pt-2.5 sm:pt-0">
                        {/* WhatsApp Quick Link */}
                        {client && client.whatsapp && (
                          <a
                            href={`${waBase(client.whatsapp || client.phone)}?text=${encodeURIComponent(
                              `Hola ${client.name}, te recuerdo nuestra sesión de boxeo hoy a las ${session.startTime} en ${session.location}. ¡Nos vemos en el gimnasio! 🥊`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition-all"
                            title="Enviar recordatorio por WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Avisar</span>
                          </a>
                        )}

                        <div className="flex items-center gap-1.5">
                          {session.status !== 'completada' && (
                            <button
                              onClick={() => markSessionStatus(session.id, 'completada')}
                              className="bg-green-600 hover:bg-green-500 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
                            >
                              Completar
                            </button>
                          )}
                          {session.paymentStatus === 'pendiente' && (
                            <button
                              onClick={() => openPayPrompt({ sessionId: session.id })}
                              className="bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
                            >
                              Cobrar
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedSession(session)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-zinc-700 transition-all cursor-pointer"
                          >
                            Detalle
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pending Collections Section */}
          {pendingIncomes.length > 0 && (
            <div className="bg-zinc-900 border border-amber-900/50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Cobros Pendientes ({pendingIncomes.length})
                </h3>
                <span className="text-xs font-bold text-amber-300">
                  Total: {formatCurrency(totalPendingAmount, profile.currencySymbol)}
                </span>
              </div>

              <div className="space-y-2">
                {pendingIncomes.slice(0, 3).map(inc => {
                  const client = clients.find(c => c.name === inc.clientName || c.id === inc.clientId);
                  return (
                    <div
                      key={inc.id}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-white text-xs">{inc.clientName}</p>
                        <p className="text-[11px] text-zinc-400">{inc.concept} • {formatShortDate(inc.date)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-amber-400 text-xs">
                          {formatCurrency(inc.amount, profile.currencySymbol)}
                        </span>
                        {client && client.whatsapp && (
                          <a
                            href={`${waBase(client.whatsapp || client.phone)}?text=${encodeURIComponent(
                              `Hola ${inc.clientName}, te escribo del gimnasio para recordarte el pago pendiente de ${formatCurrency(
                                inc.amount,
                                profile.currencySymbol
                              )} por ${inc.concept}. ¡Gracias! 🥊`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 transition-colors"
                            title="Enviar cobranza por WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => {
                            openPayPrompt({ sessionId: inc.sessionId, incomeId: inc.id });
                          }}
                          className="bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer"
                        >
                          Registrar Pago
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Col: Upcoming Fights & Reminders */}
        <div className="space-y-6">
          
          {/* Upcoming Fights & Events */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-amber-500" /> Próximas Peleas / Eventos
              </h3>
              <button
                onClick={() => setActiveTab('events')}
                className="text-[11px] text-zinc-400 hover:text-white cursor-pointer"
              >
                Ver todos
              </button>
            </div>

            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-zinc-500 py-2 italic text-center">No hay eventos próximos agendados</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingEvents.map(evt => (
                  <div
                    key={evt.id}
                    className="bg-gradient-to-r from-zinc-950 via-zinc-950 to-amber-950/30 border border-amber-900/40 rounded-xl p-3 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-800/60 px-1.5 py-0.5 rounded">
                          {evt.type}
                        </span>
                        <h4 className="font-bold text-white text-xs mt-1.5 leading-snug">{evt.title}</h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{evt.participantOrClient || evt.location}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-amber-400 block">{formatShortDate(evt.date)}</span>
                        <span className="text-[10px] text-zinc-400">{evt.time}</span>
                      </div>
                    </div>
                    {evt.cornerNotes && (
                      <div className="mt-2 bg-zinc-900/80 rounded p-1.5 text-[10px] text-zinc-300 border border-zinc-800">
                        <span className="font-bold text-amber-400">Esquina:</span> {evt.cornerNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Reminders Widget */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-red-500" /> Recordatorios Rápidos
              </h3>
              <button
                onClick={() => openQuickAdd('event')}
                className="text-[11px] text-red-400 hover:text-red-300 cursor-pointer font-semibold"
              >
                + Crear
              </button>
            </div>

            {pendingReminders.length === 0 ? (
              <p className="text-xs text-zinc-500 py-2 italic text-center">¡Estás al día! Sin tareas pendientes.</p>
            ) : (
              <div className="space-y-2">
                {pendingReminders.map(rem => (
                  <div
                    key={rem.id}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={rem.isCompleted}
                        onChange={() => toggleReminder(rem.id)}
                        className="w-4 h-4 accent-red-600 rounded cursor-pointer shrink-0"
                      />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-zinc-200 truncate">{rem.title}</p>
                        <p className="text-[10px] text-zinc-500">{formatShortDate(rem.dueDate)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Noticias del box */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Newspaper className="w-4 h-4 text-red-500" /> Lo último del box
              </h3>
              <button
                onClick={() => setActiveTab('news')}
                className="text-[11px] text-red-400 hover:text-red-300 cursor-pointer font-semibold"
              >
                Ver todas
              </button>
            </div>
            {latestNews.length === 0 ? (
              <p className="text-xs text-zinc-500 py-2 italic text-center">Cargando noticias…</p>
            ) : (
              <div className="space-y-2">
                {latestNews.map(item => (
                  <NewsCard key={item.link} item={item} compact />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}

    </div>
  );
};
