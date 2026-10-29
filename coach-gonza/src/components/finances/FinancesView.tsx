import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Plus,
  Download,
  CheckCircle,
  Clock,
  Trash2,
  Edit3,
  MessageCircle,
  BarChart2,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { getTodayString, formatCurrency, formatDateSpanish, formatShortDate } from '../../utils/dateUtils';
import { Income, PaymentStatus } from '../../types';
import { IncomeModal } from './IncomeModal';
import { exportIncomesToCSV } from '../../utils/exportUtils';

export const FinancesView: React.FC = () => {
  const { incomes, profile, clients, deleteIncome, updateIncome } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'pagado' | 'pendiente'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);

  const todayStr = getTodayString();

  // Metrics
  const todayPaid = incomes
    .filter(i => i.date === todayStr && i.status === 'pagado')
    .reduce((sum, i) => sum + i.amount, 0);

  const currentMonthPrefix = todayStr.slice(0, 7);
  const monthPaid = incomes
    .filter(i => i.date.startsWith(currentMonthPrefix) && i.status === 'pagado')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalPending = incomes
    .filter(i => i.status === 'pendiente')
    .reduce((sum, i) => sum + i.amount, 0);

  const pendingList = incomes.filter(i => i.status === 'pendiente');

  // Filtered income list
  const filteredIncomes = incomes
    .filter(i => (activeTab === 'all' ? true : i.status === activeTab))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Prepare Recharts Data for Daily / Monthly breakdown
  const dailyDataMap: { [date: string]: number } = {};
  incomes.forEach(i => {
    if (i.status === 'pagado') {
      const shortDate = formatShortDate(i.date);
      dailyDataMap[shortDate] = (dailyDataMap[shortDate] || 0) + i.amount;
    }
  });

  const chartData = Object.keys(dailyDataMap).map(d => ({
    date: d,
    monto: dailyDataMap[d]
  }));

  // Payment Method Pie Chart Data
  const methodMap: { [method: string]: number } = {};
  incomes.forEach(i => {
    if (i.status === 'pagado') {
      methodMap[i.paymentMethod] = (methodMap[i.paymentMethod] || 0) + i.amount;
    }
  });

  const pieColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
  const pieData = Object.keys(methodMap).map(m => ({
    name: m.replace('_', ' ').toUpperCase(),
    value: methodMap[m]
  }));

  const handleMarkPaid = (incomeId: string) => {
    updateIncome(incomeId, { status: 'pagado' });
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este registro de ingreso?')) {
      deleteIncome(id);
    }
  };

  return (
    <div className="space-y-6 pb-24 pt-2 px-4 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" /> Control de Ingresos & Finanzas
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Registro de cobros, resumen mensual y reporte de pagos pendientes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportIncomesToCSV(incomes)}
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all border border-zinc-700 cursor-pointer text-xs font-semibold flex items-center space-x-1"
            title="Exportar a CSV"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            onClick={() => {
              setIncomeToEdit(null);
              setModalOpen(true);
            }}
            className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-3 py-2.5 rounded-xl flex items-center space-x-1 shadow-lg transition-all cursor-pointer border border-green-500/40"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ingreso</span>
          </button>
        </div>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-md">
          <span className="text-zinc-400 text-xs font-medium block">Ingresos Hoy</span>
          <p className="text-2xl font-black text-white mt-1">
            {formatCurrency(todayPaid, profile.currencySymbol)}
          </p>
          <span className="text-[10px] text-zinc-500">Recaudado el {formatShortDate(todayStr)}</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-md">
          <span className="text-zinc-400 text-xs font-medium block">Total Mes (Cobrado)</span>
          <p className="text-2xl font-black text-green-400 mt-1">
            {formatCurrency(monthPaid, profile.currencySymbol)}
          </p>
          <span className="text-[10px] text-zinc-500">Ingresos acumulados del mes</span>
        </div>

        <div className="bg-zinc-900 border border-amber-900/40 rounded-2xl p-4 shadow-md">
          <span className="text-zinc-400 text-xs font-medium block">Cobros Pendientes</span>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {formatCurrency(totalPending, profile.currencySymbol)}
          </p>
          <span className="text-[10px] text-amber-400/80 font-semibold">{pendingList.length} transacciones por cobrar</span>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Income Bar Chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-green-400" /> Evolución de Recaudación ($)
            </h3>
          </div>

          <div className="h-48 w-full pt-2">
            {chartData.length === 0 ? (
              <p className="text-xs text-zinc-500 py-12 text-center italic">Sin suficientes datos para graficar</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                    formatter={(val: number) => [formatCurrency(val, profile.currencySymbol), 'Monto']}
                  />
                  <Bar dataKey="monto" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Methods Pie Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <PieChartIcon className="w-4 h-4 text-blue-400" /> Por Método de Pago
            </h3>
          </div>

          <div className="h-48 w-full">
            {pieData.length === 0 ? (
              <p className="text-xs text-zinc-500 py-12 text-center italic">Sin registros de pago</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                    formatter={(val: number) => [formatCurrency(val, profile.currencySymbol), 'Monto']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Income Records List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4 shadow-xl">
        
        {/* Table Tabs */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-red-600 text-white shadow' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Todos ({incomes.length})
            </button>
            <button
              onClick={() => setActiveTab('pagado')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'pagado' ? 'bg-green-600 text-white shadow' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Pagados
            </button>
            <button
              onClick={() => setActiveTab('pendiente')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'pendiente' ? 'bg-amber-600 text-white shadow' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Pendientes ({pendingList.length})
            </button>
          </div>
        </div>

        {/* List Content */}
        {filteredIncomes.length === 0 ? (
          <p className="text-xs text-zinc-500 py-8 text-center italic">No hay ingresos registrados en esta categoría</p>
        ) : (
          <div className="space-y-2.5">
            {filteredIncomes.map(inc => {
              const client = clients.find(c => c.name === inc.clientName || c.id === inc.clientId);

              return (
                <div
                  key={inc.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-zinc-700"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-xl text-xs font-bold shrink-0 ${
                      inc.status === 'pagado' ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {inc.status === 'pagado' ? '✓' : '⏳'}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-white text-xs">{inc.concept}</h4>
                        <span className="text-[10px] text-zinc-400 font-semibold bg-zinc-800 px-1.5 py-0.2 rounded uppercase">
                          {inc.paymentMethod.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        <span className="font-semibold text-zinc-200">{inc.clientName}</span> • {formatShortDate(inc.date)}
                      </p>
                      {inc.notes && (
                        <p className="text-[10px] text-zinc-500 italic mt-0.5">{inc.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-3 border-t sm:border-t-0 border-zinc-800/80 pt-2 sm:pt-0">
                    <span className="text-base font-black text-green-400">
                      {formatCurrency(inc.amount, profile.currencySymbol)}
                    </span>

                    <div className="flex items-center space-x-1">
                      {inc.status === 'pendiente' && (
                        <>
                          {client && client.whatsapp && (
                            <a
                              href={`https://wa.me/${client.whatsapp}?text=${encodeURIComponent(
                                `Hola ${client.name}, te escribo para recordarte el pago pendiente de ${formatCurrency(
                                  inc.amount,
                                  profile.currencySymbol
                                )} por ${inc.concept}. Gracias! 🥊`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 transition-colors"
                              title="Cobrar vía WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleMarkPaid(inc.id)}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold text-[10px] px-2 py-1 rounded-lg cursor-pointer"
                          >
                            Marcar Pagado
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setIncomeToEdit(inc);
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer border border-zinc-700"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                      </button>

                      <button
                        onClick={() => handleDelete(inc.id)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900 text-zinc-400 hover:text-red-300 transition-colors cursor-pointer border border-zinc-700"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Modal to Create/Edit Income */}
      {modalOpen && (
        <IncomeModal
          incomeToEdit={incomeToEdit || undefined}
          onClose={() => {
            setModalOpen(false);
            setIncomeToEdit(null);
          }}
        />
      )}

    </div>
  );
};
