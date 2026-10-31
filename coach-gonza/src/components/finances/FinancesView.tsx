import { askConfirm } from '../../utils/confirm';
import React, { useState } from 'react';
import { waLink, paymentReminderText } from '../../utils/whatsapp';
import { paymentLabel } from '../../utils/payments';
import { ExpenseModal, categoryInfo, EXPENSE_CATEGORIES } from './ExpenseModal';
import { Expense } from '../../types';
import { exportExpensesToCSV } from '../../utils/exportUtils';
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
  PieChart as PieChartIcon,
  Receipt,
  Wallet
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
  const { incomes, profile, clients, deleteIncome, expenses, deleteExpense, openPayPrompt } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'pagado' | 'pendiente' | 'gastos'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const fmt = (n: number) => formatCurrency(n, profile.currencySymbol);
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

  // Gastos y ganancia del mes
  const monthExpensesList = expenses.filter(e => e.date.startsWith(currentMonthPrefix));
  const monthExpenses = monthExpensesList.reduce((sum, e) => sum + e.amount, 0);
  const monthNet = monthPaid - monthExpenses;
  const sortedExpenses = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
  const expenseByCategory = EXPENSE_CATEGORIES
    .map(c => ({ ...c, total: monthExpensesList.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0) }))
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total);
  const monthName = new Date().toLocaleDateString('es-AR', { month: 'long' });

  const reminderLink = (inc: Income) => {
    const client = clients.find(c => c.id === inc.clientId) || clients.find(c => c.name === inc.clientName);
    return waLink(
      client?.whatsapp || client?.phone,
      paymentReminderText(inc.clientName, [{ concept: inc.concept, date: inc.date, amount: inc.amount }], fmt, profile.name)
    );
  };

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
      methodMap[paymentLabel(i.paymentMethod)] = (methodMap[paymentLabel(i.paymentMethod)] || 0) + i.amount;
    }
  });

  const pieColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
  const pieData = Object.keys(methodMap).map(m => ({
    name: m,
    value: methodMap[m]
  }));

  const handleMarkPaid = (incomeId: string) => {
    openPayPrompt({ incomeId });
  };

  const handleDelete = async (id: string) => {
    if (await askConfirm('¿Eliminar este ingreso?', { okLabel: 'Eliminar' })) {
      deleteIncome(id);
    }
  };

  return (
    <div className="space-y-5 pt-1 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display font-extrabold uppercase text-3xl tracking-tight leading-none">Plata
          </h1>
          <p className="text-sm text-zinc-400 mt-1.5">
            Lo que cobrás, lo que gastás y lo que te queda de ganancia.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportIncomesToCSV(incomes)}
            className="min-w-11 min-h-11 inline-flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all border border-zinc-700 cursor-pointer text-xs font-semibold flex items-center space-x-1"
            title="Exportar a CSV"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            onClick={() => {
              setExpenseToEdit(null);
              setExpenseModalOpen(true);
            }}
            className="bg-zinc-800 hover:bg-zinc-700 text-red-300 text-xs font-bold px-3 py-2.5 min-h-11 rounded-xl flex items-center space-x-1 transition-all cursor-pointer border border-red-900/60"
          >
            <Receipt className="w-4 h-4" />
            <span>Gasto</span>
          </button>

          <button
            onClick={() => {
              setIncomeToEdit(null);
              setModalOpen(true);
            }}
            className="bg-ring-red hover:bg-ring-red-deep text-white text-sm font-bold px-3 py-2.5 min-h-11 rounded-xl flex items-center space-x-1 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ingreso</span>
          </button>
        </div>
      </div>

      {/* Resumen del mes: una tira con filetes, el número grande es lo que queda */}
      <section aria-label={`Resumen de ${monthName}`} className="border-y border-zinc-800">
        <div className="py-4">
          <span className="text-sm text-zinc-400">Te quedó en {monthName}</span>
          <p className={`font-display font-extrabold text-[52px] leading-none tabular mt-1 ${monthNet >= 0 ? 'text-white' : 'text-ring-red'}`}>{fmt(monthNet)}</p>
          <span className="text-[13px] text-zinc-500">Cobrado − gastos</span>
        </div>
        <div className="grid grid-cols-3 border-t border-zinc-800 divide-x divide-zinc-800">
          <div className="py-3 pr-3">
            <span className="text-[13px] text-zinc-400 block">Cobrado</span>
            <p className="font-display font-bold text-[24px] leading-tight tabular">{fmt(monthPaid)}</p>
          </div>
          <div className="py-3 px-3">
            <span className="text-[13px] text-zinc-400 block">Gastos</span>
            <p className="font-display font-bold text-[24px] leading-tight tabular text-zinc-300">{fmt(monthExpenses)}</p>
          </div>
          <div className="py-3 pl-3">
            <span className="text-[13px] text-zinc-400 block">Hoy</span>
            <p className="font-display font-bold text-[24px] leading-tight tabular">{fmt(todayPaid)}</p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('pendiente')}
          className="w-full text-left border-t border-zinc-800 py-3 min-h-14 flex items-center justify-between cursor-pointer"
        >
          <span>
            <span className="text-[13px] text-zinc-400 block">Te deben</span>
            <span className="font-display font-bold text-[24px] leading-tight tabular text-amber-500">{fmt(totalPending)}</span>
          </span>
          <span className="text-sm text-zinc-300 font-semibold">{pendingList.length === 1 ? '1 pendiente' : `${pendingList.length} pendientes`} ›</span>
        </button>
      </section>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Income Bar Chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
        
        {/* Table Tabs */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-2 min-h-11 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all' ? 'bg-ring-red text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Todos ({incomes.length})
            </button>
            <button
              onClick={() => setActiveTab('pagado')}
              className={`px-3 py-2 min-h-11 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'pagado' ? 'bg-green-600 text-white shadow' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Pagados
            </button>
            <button
              onClick={() => setActiveTab('pendiente')}
              className={`px-3 py-2 min-h-11 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'pendiente' ? 'bg-amber-600 text-white shadow' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Pendientes ({pendingList.length})
            </button>
            <button
              onClick={() => setActiveTab('gastos')}
              className={`px-3 py-2 min-h-11 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'gastos' ? 'bg-ring-red text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Gastos ({expenses.length})
            </button>
          </div>

        </div>

        {/* List Content */}
        {activeTab === 'gastos' ? (
          <div className="space-y-3">
            {expenses.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={() => exportExpensesToCSV(expenses)}
                  className="text-[12.5px] font-semibold px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" /> Exportar gastos
                </button>
              </div>
            )}
            {expenseByCategory.length > 0 && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2">
                <p className="text-[12.5px] font-bold text-zinc-300 uppercase tracking-wider">En qué se fue la plata en {monthName}</p>
                {expenseByCategory.map(c => (
                  <div key={c.id} className="text-[12.5px]">
                    <div className="flex justify-between text-zinc-300">
                      <span className="flex items-center gap-1.5"><c.icon className="w-4 h-4 text-zinc-400" /> {c.label}</span>
                      <span className="font-bold text-white">{fmt(c.total)}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-zinc-400 rounded-full" style={{ width: `${(c.total / monthExpenses) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {sortedExpenses.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <p className="text-xs text-zinc-500 italic">Todavía no cargaste gastos.</p>
                <button
                  onClick={() => { setExpenseToEdit(null); setExpenseModalOpen(true); }}
                  className="bg-ring-red hover:bg-ring-red-deep text-white text-xs font-bold px-4 py-2 min-h-11 rounded-xl cursor-pointer"
                >
                  + Registrar el primero
                </button>
              </div>
            ) : (
              sortedExpenses.map(exp => {
                const cat = categoryInfo(exp.category);
                return (
                  <div key={exp.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-zinc-800 shrink-0"><cat.icon className="w-5 h-5 text-zinc-300" /></div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-xs truncate">{exp.concept}</h4>
                        <p className="text-[12.5px] text-zinc-400 mt-0.5">{cat.label} • {formatShortDate(exp.date)}</p>
                        {exp.notes && <p className="text-xs text-zinc-500 italic mt-0.5 truncate">{exp.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-sm font-black text-zinc-200 mr-1">−{fmt(exp.amount)}</span>
                      <button
                        onClick={() => { setExpenseToEdit(exp); setExpenseModalOpen(true); }}
                        className="w-11 h-11 inline-flex items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 cursor-pointer"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                      <button
                        onClick={async () => { if (await askConfirm('¿Eliminar este gasto?', { okLabel: 'Eliminar' })) deleteExpense(exp.id); }}
                        className="w-11 h-11 inline-flex items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-red-300 cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : filteredIncomes.length === 0 ? (
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
                        <span className="text-xs text-zinc-400 font-semibold bg-zinc-800 px-1.5 py-0.2 rounded uppercase">
                          {paymentLabel(inc.paymentMethod)}
                        </span>
                      </div>
                      <p className="text-[12.5px] text-zinc-400 mt-0.5">
                        <span className="font-semibold text-zinc-200">{inc.clientName}</span> • {formatShortDate(inc.date)}
                      </p>
                      {inc.notes && (
                        <p className="text-xs text-zinc-500 italic mt-0.5">{inc.notes}</p>
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
                          <a
                            href={reminderLink(inc)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition-colors text-xs font-bold"
                            title={client?.whatsapp || client?.phone ? 'Mandar recordatorio de pago por WhatsApp' : 'Sin número cargado: elegís el contacto en WhatsApp'}
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> Cobrar
                          </a>
                          <button
                            onClick={() => handleMarkPaid(inc.id)}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold text-xs px-2 py-1 rounded-lg cursor-pointer"
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
                        className="w-11 h-11 inline-flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer border border-zinc-700"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                      </button>

                      <button
                        onClick={() => handleDelete(inc.id)}
                        className="w-11 h-11 inline-flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-red-900 text-zinc-400 hover:text-red-300 transition-colors cursor-pointer border border-zinc-700"
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

      {expenseModalOpen && (
        <ExpenseModal
          expenseToEdit={expenseToEdit || undefined}
          onClose={() => {
            setExpenseModalOpen(false);
            setExpenseToEdit(null);
          }}
        />
      )}

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
