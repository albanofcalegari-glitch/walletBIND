'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { money, cryptoAmount } from '@/lib/format';

type Tab = 'portfolio' | 'buy' | 'sell' | 'swap';

const COINS = [
  { symbol: 'BTC', name: 'Bitcoin', color: 'text-orange-400' },
  { symbol: 'ETH', name: 'Ethereum', color: 'text-blue-400' },
  { symbol: 'USDT', name: 'Tether', color: 'text-green-400' },
  { symbol: 'USDC', name: 'USD Coin', color: 'text-blue-300' },
  { symbol: 'SOL', name: 'Solana', color: 'text-purple-400' },
  { symbol: 'DAI', name: 'Dai', color: 'text-yellow-400' },
];

export default function CryptoPage() {
  const [tab, setTab] = useState<Tab>('portfolio');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Crypto</h1>

      <div className="flex gap-1 bg-surface-100 dark:bg-surface-900 p-1 rounded-lg w-fit">
        {([
          { key: 'portfolio', label: 'Portfolio' },
          { key: 'buy', label: 'Comprar' },
          { key: 'sell', label: 'Vender' },
          { key: 'swap', label: 'Swap' },
        ] as { key: Tab; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${tab === t.key ? 'bg-brand-600 text-white' : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'portfolio' && <Portfolio />}
      {tab === 'buy' && <BuySell mode="buy" />}
      {tab === 'sell' && <BuySell mode="sell" />}
      {tab === 'swap' && <Swap />}
    </div>
  );
}

function Portfolio() {
  const [holdings, setHoldings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPosition().then((pos) => {
      setHoldings(pos.crypto || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500" /></div>;
  }

  if (holdings.length === 0) {
    return (
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-8 text-center text-surface-400">
        No tenes criptomonedas aun. Usa la seccion Comprar para comenzar.
      </div>
    );
  }

  const totalArs = holdings.reduce((sum, h) => sum + h.valuationArs, 0);

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-surface-900 border border-brand-500/30 rounded-2xl p-6">
        <p className="text-xs text-surface-400 uppercase tracking-wider">Valor total del portfolio</p>
        <p className="text-3xl font-bold text-surface-900 dark:text-white mt-1">{money(totalArs)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {holdings.map((h) => {
          const coin = COINS.find(c => c.symbol === h.symbol);
          return (
            <div key={h.symbol} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-surface-200 dark:bg-surface-800 flex items-center justify-center text-sm font-bold ${coin?.color || 'text-surface-900 dark:text-white'}`}>
                  {h.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="text-surface-900 dark:text-white font-semibold">{h.symbol}</p>
                  <p className="text-xs text-surface-400">{coin?.name || h.symbol}</p>
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-lg font-bold text-surface-900 dark:text-white">{cryptoAmount(h.amount)} <span className="text-sm text-surface-400">{h.symbol}</span></p>
                <p className="text-xl font-semibold text-purple-400">{money(h.valuationArs)}</p>
                <p className="text-xs text-surface-400">Precio: {money(h.lastPrice)}/{h.symbol}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BuySell({ mode }: { mode: 'buy' | 'sell' }) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [fromWalletId, setFromWalletId] = useState('');
  const [coin, setCoin] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [amountType, setAmountType] = useState<'ars' | 'crypto'>('ars');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAccounts().then((accs) => {
      setAccounts(accs);
      if (accs.length > 0) setFromWalletId(accs[0].id);
    });
  }, []);

  const selectedCoin = COINS.find(c => c.symbol === coin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setSubmitting(true);
    try {
      // TODO: integrate with real crypto API
      await new Promise(r => setTimeout(r, 1500));
      setResult({
        id: crypto.randomUUID().slice(0, 8),
        coin,
        amount: Number(amount),
        type: mode,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
          {mode === 'buy' ? 'Comprar crypto' : 'Vender crypto'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-surface-500 mb-1">Moneda</label>
            <div className="grid grid-cols-3 gap-2">
              {COINS.slice(0, 6).map((c) => (
                <button
                  key={c.symbol}
                  type="button"
                  onClick={() => setCoin(c.symbol)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    coin === c.symbol
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-surface-300 dark:border-surface-700 bg-surface-100 dark:bg-surface-800 hover:border-surface-400 dark:hover:border-surface-600'
                  }`}
                >
                  <p className={`text-sm font-bold ${c.color}`}>{c.symbol}</p>
                  <p className="text-xs text-surface-400 mt-0.5">{c.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-surface-500 mb-1">
              {mode === 'buy' ? 'Cuenta a debitar' : 'Cuenta a acreditar'}
            </label>
            <select
              value={fromWalletId}
              onChange={(e) => setFromWalletId(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.alias || a.cvu} — {money(Number(a.cachedBalance), a.currency)}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-surface-500">Monto</label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setAmountType('ars')}
                  className={`text-xs px-2 py-0.5 rounded ${amountType === 'ars' ? 'bg-brand-600 text-white' : 'bg-surface-200 dark:bg-surface-800 text-surface-500'}`}
                >
                  ARS
                </button>
                <button
                  type="button"
                  onClick={() => setAmountType('crypto')}
                  className={`text-xs px-2 py-0.5 rounded ${amountType === 'crypto' ? 'bg-brand-600 text-white' : 'bg-surface-200 dark:bg-surface-800 text-surface-500'}`}
                >
                  {coin}
                </button>
              </div>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder={amountType === 'ars' ? '10000.00' : '0.001'}
              min="0"
              step="any"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
          )}

          {result && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
              {mode === 'buy' ? 'Compra' : 'Venta'} realizada (ID: {result.id})
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 font-medium rounded-lg transition-colors text-white ${
              mode === 'buy'
                ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-800'
                : 'bg-red-600 hover:bg-red-700 disabled:bg-red-800'
            } disabled:opacity-50`}
          >
            {submitting ? 'Procesando...' : mode === 'buy' ? `Comprar ${coin}` : `Vender ${coin}`}
          </button>
        </form>
      </div>
    </div>
  );
}

function Swap() {
  const [fromCoin, setFromCoin] = useState('USDT');
  const [toCoin, setToCoin] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromCoin === toCoin) {
      setError('Las monedas deben ser diferentes');
      return;
    }
    setError('');
    setResult(null);
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      setResult({ id: crypto.randomUUID().slice(0, 8) });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Swap entre criptos</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-surface-500 mb-1">De</label>
              <select
                value={fromCoin}
                onChange={(e) => setFromCoin(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {COINS.map((c) => (
                  <option key={c.symbol} value={c.symbol}>{c.symbol} - {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-surface-500 mb-1">A</label>
              <select
                value={toCoin}
                onChange={(e) => setToCoin(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {COINS.map((c) => (
                  <option key={c.symbol} value={c.symbol}>{c.symbol} - {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-surface-500 mb-1">Cantidad de {fromCoin}</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="0.00"
              min="0"
              step="any"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
          )}

          {result && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
              Swap realizado (ID: {result.id})
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {submitting ? 'Procesando...' : `Swap ${fromCoin} → ${toCoin}`}
          </button>
        </form>
      </div>
    </div>
  );
}
