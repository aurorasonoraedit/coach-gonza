import { askConfirm } from '../../utils/confirm';
import React, { useState } from 'react';
import { waBase, waLink, paymentReminderText } from '../../utils/whatsapp';
import { ClientProgress } from './ClientProgress';
import { paymentLabel } from '../../utils/payments';
import { useApp } from '../../context/AppContext';
import { Client } from '../../types';
import { X, Phone, MessageCircle, Mail, Trophy, Target, Calendar, DollarSign, Edit3, Trash2, Dumbbell, Package } from 'lucide-react';
import { formatCurrency, formatDateSpanish, formatShortDate } from '../../utils/dateUtils';
import { ClientModal } from './ClientModal';

interface ClientDetailModalProps {
  client: Client;
  onClose: () => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ client, onClose }) => {
  const { profile, sessions, incomes, packages, deleteClient, progress } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'progress' | 'sessions' | 'payments'>('info');
  const progressCount = progress.filter(p => p.clientId === client.id).length;

  const clientPackage = packages.find(p => p.id === client.packageId);

  // Client sessions & payments
  const clientSessions = sessions
    .filter(s => s.clientId === client.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const clientIncomes = incomes
    .filter(i => i.clientId === client.id || i.clientName === client.name)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalPaidByClient = clientIncomes
    .filter(i => i.status === 'pagado')
    .reduce((sum, i) => sum + i.amount, 0);

  const pendingIncomes = clientIncomes.filter(i => i.status === 'pendiente');
  const totalDebt = pendingIncomes.reduce((sum, i) => sum + i.amount, 0);
  const fmt = (n: number) => formatCurrency(n, profile.currencySymbol);

  const handleDelete = async () => {
    if (await askConfirm(`¿Eliminar a "${client.name}"? Se mantiene su historial de cobros.`, { okLabel: 'Eliminar' })) {
      deleteClient(client.id);
      onClose();
    }
  };

  if (isEditing) {
    return (
      <ClientModal
        clientToEdit={client}
        onClose={() => {
          setIsEditing(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-zinc-950 px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-950 border border-red-800 text-red-400 font-black text-base flex items-center justify-center">
              {client.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white leading-tight">{client.name}</h2>
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                {client.level} • {client.goal.replace('_', ' ')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 inline-flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 bg-zinc-950 border-b border-zinc-800 text-[12.5px] font-bold text-center">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-2.5 transition-all cursor-pointer ${
              activeTab === 'info' ? 'text-red-500 border-b-2 border-ring-red bg-zinc-900/60' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`py-2.5 transition-all cursor-pointer ${
              activeTab === 'progress' ? 'text-red-500 border-b-2 border-ring-red bg-zinc-900/60' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Progreso{progressCount ? ` (${progressCount})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-2.5 transition-all cursor-pointer ${
              activeTab === 'sessions' ? 'text-red-500 border-b-2 border-ring-red bg-zinc-900/60' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Clases ({clientSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2.5 transition-all cursor-pointer ${
              activeTab === 'payments' ? 'text-red-500 border-b-2 border-ring-red bg-zinc-900/60' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Pagos ({clientIncomes.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* 1. PERFIL & DATOS TAB */}
          {activeTab === 'info' && (
            <div className="space-y-4 text-xs">
              
              {/* WhatsApp & Contact Bar */}
              <div className="flex items-center space-x-2">
                {client.whatsapp && (
                  <a
                    href={`${waBase(client.whatsapp || client.phone)}?text=${encodeURIComponent(
                      `Hola ${client.name}, soy ${profile.name.split(' ')[0]}, tu entrenador de boxeo.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Enviar WhatsApp</span>
                  </a>
                )}
                {client.phone && (
                  <a
                    href={`tel:${client.phone}`}
                    className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold p-2 rounded-xl transition-all"
                    title="Llamar"
                  >
                    <Phone className="w-4 h-4 text-blue-400" />
                  </a>
                )}
              </div>

              {/* Deuda */}
              {totalDebt > 0 && (
                <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-amber-300/90 font-semibold block">Debe</span>
                    <span className="text-lg font-black text-amber-300">{fmt(totalDebt)}</span>
                    <span className="text-xs text-amber-400/70 block">{pendingIncomes.length} pago(s) pendiente(s)</span>
                  </div>
                  <a
                    href={waLink(
                      client.whatsapp || client.phone,
                      paymentReminderText(
                        client.name,
                        pendingIncomes.map(i => ({ concept: i.concept, date: i.date, amount: i.amount })),
                        fmt,
                        profile.name
                      )
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" /> Recordar pago
                  </a>
                </div>
              )}

              {/* Package Status Card */}
              {clientPackage ? (
                <div className="bg-zinc-900 border border-red-900/40 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-red-500" /> Paquete Activo: {clientPackage.name}
                    </span>
                    <span className="font-bold text-red-400 text-xs">
                      {client.sessionsRemaining || 0} de {clientPackage.sessionCount} restantes
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-ring-red h-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (((clientPackage.sessionCount - (client.sessionsRemaining || 0)) / clientPackage.sessionCount) * 100)
                        )}%`
                      }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-400 text-center">
                  Sin paquete activo configurado
                </div>
              )}

              {/* Quick Specs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                  <span className="text-zinc-500 block">Nivel de Boxeo</span>
                  <span className="font-extrabold text-white capitalize">{client.level}</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                  <span className="text-zinc-500 block">Objetivo</span>
                  <span className="font-extrabold text-white capitalize">{client.goal.replace('_', ' ')}</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                  <span className="text-zinc-500 block">Sesiones Completadas</span>
                  <span className="font-extrabold text-green-400">{client.totalSessionsCompleted || 0} turnos</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                  <span className="text-zinc-500 block">Total Invertido</span>
                  <span className="font-extrabold text-amber-400">{formatCurrency(totalPaidByClient, profile.currencySymbol)}</span>
                </div>
              </div>

              {/* Notes */}
              {client.notes && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                  <span className="text-zinc-400 font-bold block mb-1">Notas Internas del Entrenador</span>
                  <p className="text-zinc-300 italic whitespace-pre-line">{client.notes}</p>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2 border-t border-zinc-800">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 rounded-xl flex items-center justify-center space-x-1 cursor-pointer border border-zinc-700"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Editar Cliente</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 bg-red-950 hover:bg-red-900 text-red-400 rounded-xl border border-red-800 cursor-pointer"
                  title="Eliminar Cliente"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {activeTab === 'progress' && <ClientProgress client={client} />}

          {/* 2. SESSIONS TAB */}
          {activeTab === 'sessions' && (
            <div className="space-y-2">
              {clientSessions.length === 0 ? (
                <p className="text-xs text-zinc-500 py-6 text-center italic">Sin historial de sesiones registradas</p>
              ) : (
                clientSessions.map(s => (
                  <div key={s.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">{s.title}</p>
                      <p className="text-[12.5px] text-zinc-400">{formatShortDate(s.date)} • {s.startTime}</p>
                    </div>
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${
                      s.status === 'completada' ? 'bg-green-950 text-green-400 border-green-800' : 'bg-blue-950 text-blue-400 border-blue-800'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 3. PAYMENTS TAB */}
          {activeTab === 'payments' && (
            <div className="space-y-2">
              {clientIncomes.length === 0 ? (
                <p className="text-xs text-zinc-500 py-6 text-center italic">Sin registro de pagos de este cliente</p>
              ) : (
                clientIncomes.map(inc => (
                  <div key={inc.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">{inc.concept}</p>
                      <p className="text-[12.5px] text-zinc-400">{formatShortDate(inc.date)} • {paymentLabel(inc.paymentMethod)}</p>
                    </div>
                    <span className="font-extrabold text-green-400 text-sm">
                      {formatCurrency(inc.amount, profile.currencySymbol)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
