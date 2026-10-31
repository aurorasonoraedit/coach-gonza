import { askConfirm } from '../../utils/confirm';
import React, { useState } from 'react';
import { Plus, Scale, Target, Trash2, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import { useApp } from '../../context/AppContext';
import { Client } from '../../types';
import { getTodayString, formatShortDate } from '../../utils/dateUtils';

// Categorías profesionales (límite en kg). Se puede escribir cualquier otra.
const WEIGHT_CLASSES = [
  'Minimosca 48,9 kg',
  'Mosca 50,8 kg',
  'Supermosca 52,2 kg',
  'Gallo 53,5 kg',
  'Supergallo 55,3 kg',
  'Pluma 57,2 kg',
  'Superpluma 59 kg',
  'Ligero 61,2 kg',
  'Superligero 63,5 kg',
  'Welter 66,7 kg',
  'Superwelter 69,9 kg',
  'Mediano 72,6 kg',
  'Supermediano 76,2 kg',
  'Semipesado 79,4 kg',
  'Crucero 90,7 kg',
  'Pesado +90,7 kg'
];

const kg = (n: number) => `${n.toLocaleString('es-AR', { maximumFractionDigits: 1 })} kg`;
const inputCls =
  'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-ring-red';

export const ClientProgress: React.FC<{ client: Client }> = ({ client: initialClient }) => {
  const { clients, progress, addProgress, deleteProgress, updateClient } = useApp();
  const client = clients.find(c => c.id === initialClient.id) || initialClient;

  const [date, setDate] = useState(getTodayString());
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [target, setTarget] = useState(client.targetWeight ? String(client.targetWeight) : '');
  const [weightClass, setWeightClass] = useState(client.weightClass || '');

  const entries = progress
    .filter(p => p.clientId === client.id)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const weighed = entries.filter(e => typeof e.weight === 'number');
  const first = weighed[0]?.weight;
  const last = weighed[weighed.length - 1]?.weight;
  const change = first !== undefined && last !== undefined ? last - first : undefined;
  const toTarget = client.targetWeight && last !== undefined ? last - client.targetWeight : undefined;

  const chartData = weighed.map(e => ({ fecha: formatShortDate(e.date), peso: e.weight }));
  const weights = weighed.map(e => e.weight as number).concat(client.targetWeight ? [client.targetWeight] : []);
  const yDomain: [number, number] = weights.length
    ? [Math.floor(Math.min(...weights) - 1), Math.ceil(Math.max(...weights) + 1)]
    : [0, 100];

  const parseNum = (v: string) => Number(v.replace(',', '.'));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const w = weight.trim() ? parseNum(weight) : undefined;
    if (w === undefined && !notes.trim()) return;
    addProgress({
      clientId: client.id,
      date,
      weight: w !== undefined && !isNaN(w) ? w : undefined,
      notes: notes.trim() || undefined
    });
    setWeight('');
    setNotes('');
  };

  const saveGoal = () => {
    const t = target.trim() ? parseNum(target) : undefined;
    updateClient(client.id, {
      targetWeight: t !== undefined && !isNaN(t) ? t : undefined,
      weightClass: weightClass.trim() || undefined
    });
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Objetivo */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2">
        <p className="font-bold text-zinc-200 flex items-center gap-1.5">
          <Target className="w-4 h-4 text-red-500" /> Objetivo de peso / categoría
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Peso objetivo (kg)</label>
            <input
              inputMode="decimal"
              placeholder="Ej. 69,5"
              value={target}
              onChange={e => setTarget(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Categoría</label>
            <input
              list="weight-classes"
              placeholder="Ej. Superwelter"
              value={weightClass}
              onChange={e => setWeightClass(e.target.value)}
              className={inputCls}
            />
            <datalist id="weight-classes">
              {WEIGHT_CLASSES.map(w => (
                <option key={w} value={w} />
              ))}
            </datalist>
          </div>
        </div>
        <button
          onClick={saveGoal}
          className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold py-1.5 rounded-lg cursor-pointer"
        >
          Guardar objetivo
        </button>
      </div>

      {/* Resumen */}
      {last !== undefined && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">
            <span className="text-zinc-500 block text-xs">Último peso</span>
            <span className="font-black text-white text-sm">{kg(last)}</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">
            <span className="text-zinc-500 block text-xs">Desde el inicio</span>
            <span
              className={`font-black text-sm flex items-center gap-0.5 ${
                !change ? 'text-zinc-300' : change < 0 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {!change ? <Minus className="w-3.5 h-3.5" /> : change < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
              {change ? `${change > 0 ? '+' : '−'}${kg(Math.abs(change))}` : 'igual'}
            </span>
          </div>
          <div
            className={`rounded-xl p-2.5 border ${
              toTarget === undefined
                ? 'bg-zinc-950 border-zinc-800'
                : toTarget <= 0
                ? 'bg-emerald-950/50 border-emerald-800/60'
                : 'bg-amber-950/40 border-amber-800/60'
            }`}
          >
            <span className="text-zinc-400 block text-xs">Para el objetivo</span>
            <span className="font-black text-sm text-white">
              {toTarget === undefined ? '—' : toTarget <= 0 ? '✓ En peso' : `Faltan ${kg(toTarget)}`}
            </span>
          </div>
        </div>
      )}

      {/* Gráfico */}
      {chartData.length >= 2 && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#27272a" vertical={false} />
              <XAxis dataKey="fecha" stroke="#71717a" fontSize={10} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={10} tickLine={false} domain={yDomain} allowDecimals={false} tickFormatter={(v: number) => String(Math.round(v))} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '10px', fontSize: '12px', color: '#fff' }}
                formatter={(v: number) => [kg(v), 'Peso']}
              />
              {client.targetWeight && (
                <ReferenceLine
                  y={client.targetWeight}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{ value: 'Objetivo', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }}
                />
              )}
              <Line isAnimationActive={false} type="monotone" dataKey="peso" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3, fill: '#ef4444' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Nuevo registro */}
      <form onSubmit={handleAdd} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2">
        <p className="font-bold text-zinc-200 flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-red-500" /> Nuevo registro
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} required />
          <input
            inputMode="decimal"
            placeholder="Peso (kg)"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            className={inputCls}
          />
        </div>
        <input
          placeholder="Nota: técnica, sparring, cómo llegó al pesaje…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className={inputCls}
        />
        <button
          type="submit"
          className="w-full bg-ring-red hover:bg-ring-red-deep text-white font-bold py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Guardar registro
        </button>
      </form>

      {/* Historial */}
      {entries.length === 0 ? (
        <p className="text-zinc-500 italic text-center py-2">Todavía no hay registros. Cargá el primer pesaje.</p>
      ) : (
        <div className="space-y-2">
          {[...entries].reverse().map((e, idx, arr) => {
            const prev = arr.slice(idx + 1).find(p => typeof p.weight === 'number');
            const diff = e.weight !== undefined && prev?.weight !== undefined ? e.weight - prev.weight : undefined;
            return (
              <div key={e.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-zinc-400 text-[12.5px]">{formatShortDate(e.date)}</p>
                  {e.weight !== undefined && (
                    <p className="font-black text-white">
                      {kg(e.weight)}
                      {diff !== undefined && diff !== 0 && (
                        <span className={`ml-1.5 text-xs font-bold ${diff < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {diff > 0 ? '+' : '−'}
                          {kg(Math.abs(diff))}
                        </span>
                      )}
                    </p>
                  )}
                  {e.notes && <p className="text-zinc-300 italic mt-0.5">{e.notes}</p>}
                </div>
                <button
                  onClick={async () => { if (await askConfirm('¿Eliminar este registro?', { okLabel: 'Eliminar' })) deleteProgress(e.id); }}
                  className="w-11 h-11 inline-flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-500 hover:text-red-300 cursor-pointer shrink-0"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
