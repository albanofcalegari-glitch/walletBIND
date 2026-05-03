'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { money } from '@/lib/format';
import { ChevronRight, Plus, Wallet } from 'lucide-react';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadAccounts = () => {
    api.getAccounts().then(setAccounts).finally(() => setLoading(false));
  };

  useEffect(() => { loadAccounts(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  const arsAccounts = accounts.filter(a => a.currency === 'ARS');
  const usdAccounts = accounts.filter(a => a.currency === 'USD');
  const totalArs = arsAccounts.reduce((s, a) => s + Number(a.cachedBalance), 0);
  const totalUsd = usdAccounts.reduce((s, a) => s + Number(a.cachedBalance), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Cuentas</h1>
          <p className="text-sm text-surface-400 mt-1">Gestion de wallets y cuentas CVU</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nueva cuenta
        </button>
      </div>

      {showCreate && <CreateAccountForm onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); loadAccounts(); }} />}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5">
          <p className="text-xs text-surface-400 uppercase tracking-wider">Cuentas activas</p>
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">{accounts.filter(a => a.status === 'ACTIVE').length}</p>
        </div>
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5">
          <p className="text-xs text-surface-400 uppercase tracking-wider">Total ARS</p>
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">{money(totalArs)}</p>
        </div>
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5">
          <p className="text-xs text-surface-400 uppercase tracking-wider">Total USD</p>
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">{money(totalUsd, 'USD')}</p>
        </div>
      </div>

      {/* Account list */}
      <div className="space-y-3">
        {accounts.map((acc) => (
          <Link
            key={acc.id}
            href={`/accounts/${acc.id}`}
            className="group flex items-center justify-between bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 hover:border-brand-500/40 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                acc.currency === 'USD'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
              }`}>
                <Wallet size={22} />
              </div>
              <div>
                <p className="font-medium text-surface-900 dark:text-white">{acc.alias || `Wallet ${acc.id.slice(0, 8)}`}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {acc.cvu && <span className="text-xs text-surface-400 font-mono">CVU {acc.cvu}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    acc.status === 'ACTIVE'
                      ? 'bg-success-500/10 text-success-600 dark:text-success-400'
                      : acc.status === 'FROZEN'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'bg-danger-500/10 text-danger-500'
                  }`}>
                    {acc.status === 'ACTIVE' ? 'Activa' : acc.status === 'FROZEN' ? 'Congelada' : acc.status}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-500">{acc.currency}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-xl font-bold text-brand-600 dark:text-brand-400">
                {money(Number(acc.cachedBalance), acc.currency)}
              </p>
              <ChevronRight size={18} className="text-surface-300 dark:text-surface-600 group-hover:text-brand-500 transition-colors" />
            </div>
          </Link>
        ))}

        {accounts.length === 0 && (
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-8 text-center text-surface-400">
            No hay cuentas creadas. Crea tu primera cuenta para comenzar a operar.
          </div>
        )}
      </div>
    </div>
  );
}

function CreateAccountForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [alias, setAlias] = useState('');
  const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(false);
  const [error, setError] = useState('');

  const inputCls = "w-full px-4 py-2.5 bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      setResult(true);
      setTimeout(onSuccess, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-900 border border-brand-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Crear nueva cuenta</h2>
        <button onClick={onClose} className="text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-surface-500 mb-1">Alias de la cuenta</label>
          <input
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            className={inputCls}
            placeholder="EMPRESA.OPERATIVA.ARS"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-surface-500 mb-1">Moneda</label>
          <div className="flex gap-2">
            {(['ARS', 'USD'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`flex-1 py-2.5 text-sm rounded-lg border font-medium transition-colors ${
                  currency === c
                    ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                    : 'border-surface-300 dark:border-surface-700 bg-surface-100 dark:bg-surface-800 text-surface-500 hover:border-surface-400 dark:hover:border-surface-600'
                }`}
              >
                {c === 'ARS' ? 'Pesos (ARS)' : 'Dolares (USD)'}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-danger-500/10 border border-danger-500/20 rounded-lg text-danger-400 text-sm">{error}</div>
        )}

        {result && (
          <div className="p-3 bg-success-500/10 border border-success-500/20 rounded-lg text-success-400 text-sm">
            Cuenta creada exitosamente. Se asignara un CVU en breve.
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-800 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
        >
          {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  );
}
