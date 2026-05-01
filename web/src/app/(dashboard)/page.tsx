'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { money, shortDate, cryptoAmount } from '@/lib/format';

export default function DashboardPage() {
  const [position, setPosition] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPosition().then(setPosition).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!position) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Posicion Consolidada</h1>
        <p className="text-slate-400 mt-1">{position.company.name} &middot; CUIT {position.company.cuit}</p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <TotalCard label="Total ARS" value={money(position.totals.ars)} accent="blue" />
        <TotalCard label="Total USD" value={money(position.totals.usd, 'USD')} accent="green" />
        <TotalCard label="Crypto (ARS)" value={money(position.totals.crypto_ars)} accent="purple" />
        <TotalCard label="Total General" value={money(position.totals.total_ars)} accent="white" large />
      </div>

      {/* Accounts */}
      <Section title="Cuentas">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {position.accounts.map((acc: any) => (
            <Link
              key={acc.walletId}
              href={`/dashboard/accounts/${acc.walletId}`}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-400">{acc.label}</p>
                  <p className="text-xs text-slate-600 font-mono mt-0.5">CVU {acc.cvu?.slice(-8)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${acc.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                  {acc.status === 'ACTIVE' ? 'Activa' : acc.status}
                </span>
              </div>
              <p className="text-2xl font-bold text-white mt-3">{money(acc.balance, acc.currency)}</p>
            </Link>
          ))}
        </div>
      </Section>

      {/* Cards */}
      <Section title="Tarjetas Corporativas">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {position.cards.map((card: any) => (
            <div key={card.cardId} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">{card.brand}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${card.cardType === 'VIRTUAL' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-700 text-slate-300'}`}>
                    {card.cardType === 'VIRTUAL' ? 'Virtual' : 'Fisica'}
                  </span>
                </div>
                <span className={`w-2 h-2 rounded-full ${card.status === 'ACTIVE' ? 'bg-green-400' : 'bg-yellow-400'}`} />
              </div>
              <p className="font-mono text-lg text-white mt-3">**** {card.lastFour}</p>
              <p className="text-sm text-slate-400 mt-1">{card.holderName}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.cardName}</p>
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Disponible hoy</span>
                  <span className="text-white font-medium">{money(card.availableDaily)}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-slate-500">Disponible mes</span>
                  <span className="text-white font-medium">{money(card.availableMonthly)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Crypto */}
      {position.crypto.length > 0 && (
        <Section title="Crypto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {position.crypto.map((c: any) => (
              <div key={c.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <p className="text-lg font-bold text-white">{c.symbol}</p>
                <p className="text-sm text-slate-400 mt-1">{cryptoAmount(c.amount)} {c.symbol}</p>
                <p className="text-xl font-semibold text-purple-400 mt-2">{money(c.valuationArs)}</p>
                <p className="text-xs text-slate-500 mt-1">Precio: {money(c.lastPrice)}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Recent movements */}
      <Section title="Ultimos Movimientos">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-500">
                <th className="text-left px-5 py-3 font-medium">Fecha</th>
                <th className="text-left px-5 py-3 font-medium">Descripcion</th>
                <th className="text-left px-5 py-3 font-medium">Tipo</th>
                <th className="text-right px-5 py-3 font-medium">Monto</th>
                <th className="text-right px-5 py-3 font-medium">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {position.recentMovements.map((m: any) => (
                <tr key={m.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3 text-sm text-slate-400">{shortDate(m.date)}</td>
                  <td className="px-5 py-3 text-sm text-white">{m.description}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{m.type}</span>
                  </td>
                  <td className={`px-5 py-3 text-sm text-right font-medium ${m.sign === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                    {m.sign === 'credit' ? '+' : '-'}{money(m.amount)}
                  </td>
                  <td className="px-5 py-3 text-sm text-right text-slate-400">{money(m.balanceAfter)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function TotalCard({ label, value, accent, large }: { label: string; value: string; accent: string; large?: boolean }) {
  const colors: Record<string, string> = {
    blue: 'border-blue-500/30',
    green: 'border-green-500/30',
    purple: 'border-purple-500/30',
    white: 'border-slate-600',
  };
  return (
    <div className={`bg-slate-900 border ${colors[accent] || 'border-slate-800'} rounded-xl p-5`}>
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`${large ? 'text-3xl' : 'text-2xl'} font-bold text-white mt-1`}>{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      {children}
    </div>
  );
}
