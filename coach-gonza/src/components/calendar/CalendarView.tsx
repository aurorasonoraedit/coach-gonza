import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  AlertTriangle,
  Clock,
  User,
  CheckCircle,
  Copy,
  Lock,
  Layers
} from 'lucide-react';
import {
  getTodayString,
  getMonthDaysGrid,
  formatDateSpanish,
  formatCurrency,
  findSessionConflicts,
  getDayOfWeekName,
  formatShortDate
} from '../../utils/dateUtils';
import { Session, SessionType, SessionStatus, PaymentStatus } from '../../types';
import { SessionModal } from '../sessions/SessionModal';
import { SessionDetailModal } from '../sessions/SessionDetailModal';

export const CalendarView: React.FC = () => {
  const {
    sessions,
    clients,
    profile,
    addSession,
    duplicateSession,
    markSessionStatus,
    markSessionPaid,
    openPayPrompt
  } = useApp();

  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  
  // Current calendar month view state (Default to August 2026 or today)
  const todayStr = getTodayString();
  const [currentYear, setCurrentYear] = useState<number>(Number(todayStr.slice(0, 4)));
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(Number(todayStr.slice(5, 7)) - 1);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  // Modals state
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Filters state
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterClientId, setFilterClientId] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonthIndex(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonthIndex(prev => prev + 1);
    }
  };

  const monthGrid = getMonthDaysGrid(currentYear, currentMonthIndex);
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Filtered Sessions
  const filteredSessions = sessions.filter(s => {
    if (filterType !== 'all' && s.sessionType !== filterType) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (filterClientId !== 'all' && s.clientId !== filterClientId) return false;
    return true;
  });

  // Sessions for currently selected date
  const daySessions = filteredSessions
    .filter(s => s.date === selectedDateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Conflicts on selected day
  const dayConflicts = daySessions.filter(s => {
    const conflicts = findSessionConflicts(daySessions, s);
    return conflicts.length > 0;
  });

  // Block time slot
  const handleBlockSlot = () => {
    addSession({
      title: '🔒 Horario No Disponible / Descanso',
      sessionType: 'boxeo',
      date: selectedDateStr,
      startTime: '13:00',
      endTime: '15:00',
      location: 'Gimnasio Central',
      status: 'programada',
      paymentStatus: 'pagada',
      price: 0,
      notes: 'Bloqueado por el entrenador'
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header & View Selector */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-display font-extrabold uppercase text-3xl tracking-tight leading-none">Agenda
            </h1>
            <span className="text-xs text-zinc-400 font-bold bg-zinc-800 px-2 py-0.5 rounded">
              {monthNames[currentMonthIndex]} {currentYear}
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1.5">
            Tus turnos por mes, semana o día.
          </p>
        </div>

        {/* View Mode Toggle & Filter Trigger */}
        <div className="flex items-center space-x-2">
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-all ${
              showFilters || filterType !== 'all' || filterStatus !== 'all' || filterClientId !== 'all'
                ? 'bg-red-950 border-red-600 text-red-400'
                : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
          </button>

          <div className="bg-zinc-950 border border-zinc-800 p-1 rounded-xl flex text-xs font-bold">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-2 min-h-11 rounded-lg transition-all cursor-pointer ${
                viewMode === 'month' ? 'bg-ring-red text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-2 min-h-11 rounded-lg transition-all cursor-pointer ${
                viewMode === 'week' ? 'bg-ring-red text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-2 min-h-11 rounded-lg transition-all cursor-pointer ${
                viewMode === 'day' ? 'bg-ring-red text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Día
            </button>
          </div>

          <button
            onClick={() => setSessionModalOpen(true)}
            className="bg-ring-red hover:bg-ring-red-deep text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1 transition-all cursor-pointer border border-ring-red/40"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Turno</span>
          </button>
        </div>
      </div>

      {/* Filter Options Bar (Collapsible) */}
      {showFilters && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-zinc-400 font-semibold mb-1">Tipo de Sesión</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white"
            >
              <option value="all">Todas las Sesiones</option>
              <option value="boxeo">Boxeo</option>
              <option value="personalizado">Personalizado 1-a-1</option>
              <option value="grupal">Grupal</option>
              <option value="sparring">Sparring</option>
              <option value="tecnica">Técnica</option>
              <option value="defensa_personal">Defensa Personal</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 font-semibold mb-1">Estado</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white"
            >
              <option value="all">Todos los estados</option>
              <option value="programada">Programadas</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 font-semibold mb-1">Cliente</label>
            <select
              value={filterClientId}
              onChange={e => setFilterClientId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white"
            >
              <option value="all">Todos los clientes</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 1. MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Calendar Grid (2 Cols) */}
          <div className="lg:col-span-2 sm:bg-zinc-900 sm:border sm:border-zinc-800 sm:rounded-2xl sm:p-4">
            
            {/* Month Navigation Controls */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="w-11 h-11 inline-flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-700/50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <h2 className="text-base font-extrabold text-white">
                {monthNames[currentMonthIndex]} {currentYear}
              </h2>

              <button
                onClick={handleNextMonth}
                className="w-11 h-11 inline-flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-700/50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[12.5px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mié</span>
              <span>Jue</span>
              <span>Vie</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>

            {/* Grid Cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {monthGrid.map((cell, idx) => {
                if (!cell) return <div key={idx} className="h-16 rounded-xl bg-zinc-950/20 opacity-30"></div>;

                const isToday = cell.dateStr === todayStr;
                const isSelected = cell.dateStr === selectedDateStr;

                const daySessList = filteredSessions.filter(s => s.date === cell.dateStr && s.status !== 'cancelada');
                const hasConflict = daySessList.some(s => findSessionConflicts(daySessList, s).length > 0);

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    className={`h-16 sm:h-20 rounded-xl p-1.5 flex flex-col justify-between text-left transition-all border cursor-pointer relative ${
                      isSelected
                        ? 'bg-red-950/70 border-ring-red ring-1 ring-red-500'
                        : isToday
                        ? 'bg-zinc-800/90 border-red-600/60'
                        : cell.isCurrentMonth
                        ? 'bg-zinc-950/90 border-zinc-800/80 hover:border-zinc-700'
                        : 'bg-zinc-950/30 border-zinc-900 text-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-black ${
                          isToday
                            ? 'w-5 h-5 rounded-full bg-ring-red text-white flex items-center justify-center text-xs'
                            : cell.isCurrentMonth
                            ? 'text-white'
                            : 'text-zinc-600'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>
                      {hasConflict && (
                        <span className="w-2 h-2 rounded-full bg-amber-500" title="Solapamiento de horario"></span>
                      )}
                    </div>

                    {/* Session Indicators */}
                    {daySessList.length > 0 && (
                      <div className="space-y-0.5 mt-1">
                        <div className="text-xs font-bold px-1 py-0.2 rounded bg-red-950 text-red-300 border border-red-800/60 truncate">
                          {daySessList.length} sesión(es)
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Detail & Action Column (1 Col) */}
          <div className="space-y-4">
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    {formatDateSpanish(selectedDateStr)}
                  </h3>
                  <p className="text-[12.5px] text-zinc-400">{daySessions.length} turnos agendados</p>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleBlockSlot}
                    className="w-11 h-11 inline-flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-700"
                    title="Bloquear Horario"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                  <button
                    onClick={() => setSessionModalOpen(true)}
                    className="bg-ring-red hover:bg-ring-red-deep text-white text-xs font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
                  >
                    + Agregar
                  </button>
                </div>
              </div>

              {/* Conflict Alert Banner */}
              {dayConflicts.length > 0 && (
                <div className="bg-amber-950/90 border border-amber-600/60 rounded-xl p-2.5 text-amber-200 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>¡Atención! Hay choques de horario el día de hoy.</span>
                </div>
              )}

              {/* Day Session List */}
              {daySessions.length === 0 ? (
                <div className="py-8 text-center text-zinc-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-medium">Sin sesiones agendadas para este día</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {daySessions.map(sess => (
                    <div
                      key={sess.id}
                      className={`bg-zinc-950 border rounded-xl p-3 space-y-2 transition-all hover:border-zinc-700 ${
                        sess.status === 'completada'
                          ? 'border-green-900/40 bg-green-950/10'
                          : sess.status === 'cancelada'
                          ? 'border-red-900/30 opacity-60'
                          : 'border-zinc-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-red-400">{sess.startTime} - {sess.endTime}</span>
                            <span className="text-xs font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded">
                              {sess.sessionType.replace('_', ' ')}
                            </span>
                          </div>
                          <h4 className="font-bold text-white text-xs mt-1 leading-snug">{sess.title}</h4>
                          <p className="text-[12.5px] text-zinc-400 mt-0.5">{sess.clientName || 'Cliente'} • {sess.location}</p>
                        </div>
                        <span
                          className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${
                            sess.paymentStatus === 'pagada'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : 'bg-amber-950 text-amber-400 border-amber-800'
                          }`}
                        >
                          {formatCurrency(sess.price, profile.currencySymbol)}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between border-t border-zinc-900 pt-2 text-[12.5px]">
                        <button
                          onClick={() => setSelectedSession(sess)}
                          className="text-zinc-400 hover:text-white font-medium underline cursor-pointer"
                        >
                          Ver detalle
                        </button>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => duplicateSession(sess)}
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                            title="Duplicar para la próxima semana"
                          >
                            <Copy className="w-3.5 h-3.5 text-blue-400" />
                          </button>
                          {sess.status !== 'completada' && (
                            <button
                              onClick={() => markSessionStatus(sess.id, 'completada')}
                              className="bg-green-600 hover:bg-green-500 text-white font-bold px-2 py-0.5 rounded text-xs cursor-pointer"
                            >
                              ✓ Listo
                            </button>
                          )}
                          {sess.paymentStatus === 'pendiente' && (
                            <button
                              onClick={() => openPayPrompt({ sessionId: sess.id })}
                              className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-2 py-0.5 rounded text-xs cursor-pointer"
                            >
                              Cobrar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 2. WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
          <h2 className="text-sm font-bold text-white">Vista Semanal de Turnos</h2>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {[0, 1, 2, 3, 4, 5, 6].map(offset => {
              const d = new Date(selectedDateStr);
              d.setDate(d.getDate() - d.getDay() + 1 + offset); // Monday start
              const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              const daysess = filteredSessions.filter(s => s.date === dateStr);
              const dayName = getDayOfWeekName(dateStr);

              return (
                <div
                  key={offset}
                  className={`bg-zinc-950 border rounded-xl p-3 space-y-2 min-h-[220px] ${
                    dateStr === todayStr ? 'border-red-600/60 bg-red-950/10' : 'border-zinc-800'
                  }`}
                >
                  <div className="border-b border-zinc-800 pb-1.5 flex items-center justify-between">
                    <div>
                      <span className="block text-[12.5px] font-bold text-red-400 uppercase">{dayName}</span>
                      <span className="text-xs font-black text-white">{formatShortDate(dateStr)}</span>
                    </div>
                    <span className="text-xs text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded font-bold">
                      {daysess.length}
                    </span>
                  </div>

                  {daysess.length === 0 ? (
                    <p className="text-xs text-zinc-600 italic py-4 text-center">Sin turnos</p>
                  ) : (
                    <div className="space-y-1.5">
                      {daysess.map(s => (
                        <div
                          key={s.id}
                          onClick={() => setSelectedSession(s)}
                          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 rounded p-1.5 text-[12.5px] cursor-pointer transition-colors"
                        >
                          <span className="font-extrabold text-red-400 block">{s.startTime}</span>
                          <span className="font-semibold text-white truncate block">{s.clientName || s.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. DAY VIEW */}
      {viewMode === 'day' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-white">{formatDateSpanish(selectedDateStr)}</h2>
              <p className="text-xs text-zinc-400">Desglose de horas de trabajo</p>
            </div>
            <button
              onClick={() => setSessionModalOpen(true)}
              className="bg-ring-red hover:bg-ring-red-deep text-white text-xs font-bold px-3 py-2 min-h-11 rounded-xl cursor-pointer"
            >
              + Agregar Turno
            </button>
          </div>

          <div className="space-y-2">
            {['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map(hour => {
              const matchedSess = daySessions.filter(s => s.startTime.startsWith(hour.slice(0, 2)));

              return (
                <div key={hour} className="flex items-start space-x-3 border-b border-zinc-800/50 pb-2 pt-1">
                  <span className="text-xs font-mono font-bold text-zinc-400 w-12 shrink-0">{hour}</span>
                  <div className="flex-1 space-y-1">
                    {matchedSess.length === 0 ? (
                      <div className="h-7 border border-dashed border-zinc-800 rounded-lg flex items-center px-3 text-[12.5px] text-zinc-600">
                        Horario Libre
                      </div>
                    ) : (
                      matchedSess.map(s => (
                        <div
                          key={s.id}
                          onClick={() => setSelectedSession(s)}
                          className="bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 flex items-center justify-between cursor-pointer hover:border-ring-red transition-all"
                        >
                          <div>
                            <span className="font-bold text-white text-xs">{s.title}</span>
                            <span className="text-[12.5px] text-zinc-400 ml-2">({s.startTime} - {s.endTime})</span>
                          </div>
                          <span className="text-xs font-extrabold text-amber-400">{formatCurrency(s.price, profile.currencySymbol)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Session Create/Edit Modal */}
      {sessionModalOpen && (
        <SessionModal
          defaultDate={selectedDateStr}
          onClose={() => setSessionModalOpen(false)}
        />
      )}

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
