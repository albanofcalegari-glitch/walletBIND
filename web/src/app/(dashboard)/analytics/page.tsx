'use client';

import { useState } from 'react';
import { money } from '@/lib/format';

type Period = '7d' | '30d' | '90d' | '12m';

const CATEGORIES = [
  { name: 'Proveedores', amount: 342000, pct: 35, color: 'bg-blue-500', textColor: 'text-blue-400' },
  { name: 'Sueldos', amount: 280000, pct: 29, color: 'bg-green-500', textColor: 'text-green-400' },
  { name: 'Servicios', amount: 125000, pct: 13, color: 'bg-yellow-500', textColor: 'text-yellow-400' },
  { name: 'Alquileres', amount: 95000, pct: 10, color: 'bg-purple-500', textColor: 'text-purple-400' },
  { name: 'Impuestos', amount: 68000, pct: 7, color: 'bg-red-500', textColor: 'text-red-400' },
  { name: 'Otros', amount: 58000, pct: 6, color: 'bg-slate-500', textColor: 'text-slate-400' },
];

const MONTHLY_DATA = [
  { month: 'Nov', income: 1200000, expense: 850000 },
  { month: 'Dic', income: 1450000, expense: 920000 },
  { month: 'Ene', income: 980000, expense: 760000 },
  { month: 'Feb', income: 1100000, expense: 880000 },
  { month: 'Mar', income: 1350000, expense: 968000 },
  { month: 'Abr', income: 1280000, expense: 910000 },
];

const CARD_SPENDING = [
  { card: '**** 4589', holder: 'Juan Perez', spent: 123500, limit: 200000 },
  { card: '**** 7812', holder: 'Ana Garcia', spent: 145200, limit: 200000 },
  { card: '**** 3201', holder: 'Carlos Ruiz', spent: 37800, limit: 100000 },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d');

  const totalExpense = CATEGORIES.reduce((s, c) => s + c.amount, 0);
  const totalIncome = MONTHLY_DATA.reduce((s, m) => s + m.income, 0);
  const maxBar = Math.max(...MONTHLY_DATA.map(m => Math.max(m.income, m.expense)));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-surface-500 mt-1">Analisis de gastos e ingresos</p>
        </div>
        <div className="flex gap-1 bg-surface-100 dark:bg-surface-900 p-1 rounded-lg">
          {([['7d', '7 dias'], ['30d', '30 dias'], ['90d', '90 dias'], ['12m', '12 meses']] as [Period, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${period === key ? 'bg-brand-600 text-white' : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard label="Ingresos" value={money(totalIncome)} change="+12.3%" positive />
        <KpiCard label="Egresos" value={money(totalExpense)} change="-5.1%" positive />
        <KpiCard label="Balance neto" value={money(totalIncome - totalExpense)} change="+8.7%" positive />
        <KpiCard label="Transacciones" value="247" change="+15" positive />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly bar chart */}
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Ingresos vs Egresos</h2>
          <div className="space-y-3">
            {MONTHLY_DATA.map((m) => (
              <div key={m.month} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-surface-500 w-8">{m.month}</span>
                  <span className="text-surface-400">{money(m.income)} / {money(m.expense)}</span>
                </div>
                <div className="flex gap-1 h-4">
                  <div
                    className="bg-green-500/60 rounded-sm transition-all"
                    style={{ width: `${(m.income / maxBar) * 100}%` }}
                  />
                </div>
                <div className="flex gap-1 h-4 -mt-1">
                  <div
                    className="bg-red-500/40 rounded-sm transition-all"
                    style={{ width: `${(m.expense / maxBar) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-surface-600 dark:text-surface-300">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-500/60 rounded-sm" /> Ingresos</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-500/40 rounded-sm" /> Egresos</span>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Gastos por Categoria</h2>
          <div className="flex h-4 rounded-full overflow-hidden mb-6">
            {CATEGORIES.map((cat) => (
              <div key={cat.name} className={`${cat.color} transition-all`} style={{ width: `${cat.pct}%` }} />
            ))}
          </div>
          <div className="space-y-3">
            {CATEGORIES.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${cat.color}`} />
                  <span className="text-sm text-surface-600 dark:text-surface-300">{cat.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-surface-900 dark:text-white">{money(cat.amount)}</span>
                  <span className="text-xs text-surface-400 ml-2">{cat.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card spending */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Consumo por Tarjeta</h2>
        <div className="space-y-4">
          {CARD_SPENDING.map((card) => {
            const pct = (card.spent / card.limit) * 100;
            return (
              <div key={card.card}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-surface-900 dark:text-white">{card.card}</span>
                    <span className="text-xs text-surface-400">{card.holder}</span>
                  </div>
                  <span className="text-sm font-medium text-surface-900 dark:text-white">{money(card.spent)} <span className="text-surface-400">/ {money(card.limit)}</span></span>
                </div>
                <div className="h-2 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export */}
      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 text-sm bg-surface-200 dark:bg-surface-800 text-surface-600 dark:text-surface-300 rounded-lg hover:bg-surface-300 dark:hover:bg-surface-700 transition-colors">
          Exportar CSV
        </button>
        <button className="px-4 py-2 text-sm bg-surface-200 dark:bg-surface-800 text-surface-600 dark:text-surface-300 rounded-lg hover:bg-surface-300 dark:hover:bg-surface-700 transition-colors">
          Exportar PDF
        </button>
      </div>
    </div>
  );
}

function KpiCard({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) {
  return (
    <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5">
      <p className="text-xs text-surface-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{value}</p>
      <p className={`text-xs mt-1 ${positive ? 'text-green-400' : 'text-red-400'}`}>{change} vs periodo anterior</p>
    </div>
  );
}
