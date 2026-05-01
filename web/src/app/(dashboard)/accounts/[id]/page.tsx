'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { money, fullDate } from '@/lib/format';

export default function AccountDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [balance, setBalance] = useState<any>(null);
  const [movements, setMovements] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAccountBalance(id),
      api.getAccountMovements(id, { page, limit: 20 }),
    ]).then(([b, m]) => {
      setBalance(b);
      setMovements(m);
    }).finally(() => setLoading(false));
  }, [id, page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-slate-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Detalle de Cuenta</h1>
          <p className="text-sm text-slate-400">Wallet {id.slice(0, 8)}...</p>
        </div>
      </div>

      {balance && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-sm text-slate-500 uppercase tracking-wider">Saldo actual</p>
          <p className="text-4xl font-bold text-white mt-1">{money(Number(balance.balance), balance.currency)}</p>
          <p className="text-sm text-slate-500 mt-1">{balance.currency}</p>
        </div>
      )}

      {movements && (
        <>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">Movimientos</h2>
              <p className="text-xs text-slate-500">{movements.pagination.total} movimientos totales</p>
            </div>
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
                {movements.data.map((m: any) => (
                  <tr key={m.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3 text-sm text-slate-400">{fullDate(m.date)}</td>
                    <td className="px-5 py-3 text-sm text-white">{m.description || '-'}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{m.type}</span>
                    </td>
                    <td className={`px-5 py-3 text-sm text-right font-medium ${m.sign === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                      {m.sign === 'credit' ? '+' : '-'}{money(Number(m.amount))}
                    </td>
                    <td className="px-5 py-3 text-sm text-right text-slate-400">{money(Number(m.balanceAfter))}</td>
                  </tr>
                ))}
                {movements.data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500">Sin movimientos</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {movements.pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-4 py-2 text-sm bg-slate-800 text-slate-300 rounded-lg disabled:opacity-30 hover:bg-slate-700 transition-colors"
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-sm text-slate-500">
                {page} / {movements.pagination.pages}
              </span>
              <button
                onClick={() => setPage(Math.min(movements.pagination.pages, page + 1))}
                disabled={page >= movements.pagination.pages}
                className="px-4 py-2 text-sm bg-slate-800 text-slate-300 rounded-lg disabled:opacity-30 hover:bg-slate-700 transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
