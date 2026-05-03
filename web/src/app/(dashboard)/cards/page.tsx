'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { money } from '@/lib/format';

export default function CardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequest, setShowRequest] = useState(false);

  const loadCards = () => {
    api.getCards().then(setCards).finally(() => setLoading(false));
  };

  useEffect(() => { loadCards(); }, []);

  const toggleFreeze = async (card: any) => {
    if (card.status === 'ACTIVE') {
      await api.freezeCard(card.id);
    } else {
      await api.unfreezeCard(card.id);
    }
    loadCards();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Tarjetas Corporativas</h1>
        <button
          onClick={() => setShowRequest(!showRequest)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Solicitar tarjeta
        </button>
      </div>

      {showRequest && <RequestCard onClose={() => setShowRequest(false)} onSuccess={() => { setShowRequest(false); loadCards(); }} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <div key={card.id} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden">
            <div className={`p-6 ${card.brand === 'VISA' ? 'bg-gradient-to-br from-blue-600 to-blue-800' : card.brand === 'MASTERCARD' ? 'bg-gradient-to-br from-slate-800 to-slate-950' : 'bg-gradient-to-br from-orange-600 to-red-700'}`}>
              <div className="flex justify-between items-start">
                <span className="text-xs text-white/70 uppercase">{card.cardName}</span>
                <CardBrandLogo brand={card.brand} />
              </div>
              <p className="font-mono text-2xl text-white mt-6 tracking-widest">**** **** **** {card.lastFour}</p>
              <div className="flex justify-between items-end mt-4">
                <div>
                  <p className="text-xs text-white/50">Titular</p>
                  <p className="text-sm text-white">{card.holderName}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${card.cardType === 'VIRTUAL' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/80'}`}>
                  {card.cardType === 'VIRTUAL' ? 'Virtual' : 'Fisica'}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-500">Estado</span>
                <span className={`text-sm font-medium ${card.status === 'ACTIVE' ? 'text-success-500' : card.status === 'FROZEN' ? 'text-blue-400' : 'text-danger-400'}`}>
                  {card.status === 'ACTIVE' ? 'Activa' : card.status === 'FROZEN' ? 'Congelada' : card.status}
                </span>
              </div>

              <div className="space-y-2">
                <LimitBar label="Limite diario" spent={Number(card.spentToday)} limit={Number(card.dailyLimit)} />
                <LimitBar label="Limite mensual" spent={Number(card.spentMonth)} limit={Number(card.monthlyLimit)} />
              </div>

              <div className="pt-3 border-t border-surface-100 dark:border-surface-800 flex gap-2">
                <button
                  onClick={() => toggleFreeze(card)}
                  className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${
                    card.status === 'ACTIVE'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20'
                      : 'bg-success-500/10 text-success-600 dark:text-success-400 hover:bg-success-500/20'
                  }`}
                >
                  {card.status === 'ACTIVE' ? 'Congelar' : 'Activar'}
                </button>
              </div>

              {card.assignedUser && (
                <p className="text-xs text-surface-400">
                  Asignada a: {card.assignedUser.name} ({card.assignedUser.email})
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RequestCard({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [cardType, setCardType] = useState<'VIRTUAL' | 'PHYSICAL'>('VIRTUAL');
  const [brand, setBrand] = useState<'VISA' | 'MASTERCARD'>('VISA');
  const [cardName, setCardName] = useState('');
  const [holderName, setHolderName] = useState('');
  const [dailyLimit, setDailyLimit] = useState('50000');
  const [monthlyLimit, setMonthlyLimit] = useState('500000');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      setResult(true);
      setTimeout(onSuccess, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-900 border border-brand-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Solicitar nueva tarjeta</h2>
        <button onClick={onClose} className="text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-surface-500 mb-1">Tipo</label>
            <div className="flex gap-2">
              {(['VIRTUAL', 'PHYSICAL'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setCardType(t)}
                  className={`flex-1 py-2.5 text-sm rounded-lg border font-medium transition-colors ${
                    cardType === t
                      ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                      : 'border-surface-300 dark:border-surface-700 bg-surface-100 dark:bg-surface-800 text-surface-500 hover:border-surface-400 dark:hover:border-surface-600'
                  }`}
                >
                  {t === 'VIRTUAL' ? 'Virtual' : 'Fisica'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-surface-500 mb-1">Marca</label>
            <div className="flex gap-2">
              {(['VISA', 'MASTERCARD'] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBrand(b)}
                  className={`flex-1 py-2.5 text-sm rounded-lg border font-medium transition-colors ${
                    brand === b
                      ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                      : 'border-surface-300 dark:border-surface-700 bg-surface-100 dark:bg-surface-800 text-surface-500 hover:border-surface-400 dark:hover:border-surface-600'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-surface-500 mb-1">Nombre de tarjeta</label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Gastos operativos, Marketing..."
              required
            />
          </div>
          <div>
            <label className="block text-sm text-surface-500 mb-1">Titular</label>
            <input
              type="text"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Nombre y apellido"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-surface-500 mb-1">Limite diario</label>
            <input
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-surface-500 mb-1">Limite mensual</label>
            <input
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-danger-500/10 border border-danger-500/20 rounded-lg text-danger-400 text-sm">{error}</div>
        )}

        {result && (
          <div className="p-3 bg-success-500/10 border border-success-500/20 rounded-lg text-success-400 text-sm">
            Solicitud enviada. La tarjeta estara disponible en breve.
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-800 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
        >
          {submitting ? 'Enviando solicitud...' : `Solicitar tarjeta ${cardType === 'VIRTUAL' ? 'virtual' : 'fisica'}`}
        </button>
      </form>
    </div>
  );
}

function CardBrandLogo({ brand }: { brand: string }) {
  if (brand === 'VISA') {
    return (
      <svg viewBox="0 0 780 500" className="h-8 w-auto" fill="none">
        <path d="M293.2 348.7l33.4-195.8h53.4l-33.4 195.8H293.2zM531.5 157.1c-10.6-4-27.2-8.3-47.9-8.3-52.8 0-90 26.6-90.3 64.7-.3 28.2 26.6 43.9 46.9 53.3 20.9 9.6 27.9 15.7 27.8 24.3-.1 13.1-16.7 19.1-32.1 19.1-21.4 0-32.8-3-50.4-10.3l-6.9-3.1-7.5 44c12.5 5.5 35.6 10.2 59.6 10.5 56.2 0 92.7-26.3 93.1-67 .2-22.3-14-39.3-44.8-53.3-18.7-9.1-30.1-15.1-30-24.3 0-8.1 9.7-16.8 30.6-16.8 17.5-.3 30.1 3.5 40 7.5l4.8 2.3 7.1-42.6zM661.6 152.9h-41.3c-12.8 0-22.4 3.5-28 16.3l-79.4 179.5h56.2s9.2-24.2 11.3-29.5h68.6c1.6 6.9 6.5 29.5 6.5 29.5h49.7l-43.6-195.8zm-65.9 126.2c4.4-11.3 21.4-54.8 21.4-54.8-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.3 47 12.4 56.6h-44.5zM232.8 152.9l-52.3 133.5-5.6-27.1c-9.7-31.2-39.9-65-73.7-81.9l47.9 171.1h56.6l84.2-195.6h-57.1z" fill="#fff"/>
        <path d="M138.4 152.9H52.6l-.6 3.6c67.1 16.2 111.5 55.4 129.9 102.5L163.7 169c-3.2-12.4-12.6-15.7-25.3-16.1z" fill="#f9a51a"/>
      </svg>
    )
  }
  if (brand === 'MASTERCARD') {
    return (
      <svg viewBox="0 0 48 30" className="h-8 w-auto">
        <circle cx="18" cy="15" r="12" fill="#eb001b" />
        <circle cx="30" cy="15" r="12" fill="#f79e1b" />
        <path d="M24 5.2a14.9 14.9 0 0 0-6 9.8 14.9 14.9 0 0 0 6 9.8 14.9 14.9 0 0 0 6-9.8 14.9 14.9 0 0 0-6-9.8z" fill="#ff5f00" />
      </svg>
    )
  }
  if (brand === 'AMEX') {
    return (
      <svg viewBox="0 0 780 500" className="h-8 w-auto">
        <rect width="780" height="500" rx="40" fill="#2E77BC" />
        <text x="390" y="290" textAnchor="middle" fill="#fff" fontSize="160" fontWeight="bold" fontFamily="Arial, sans-serif">AMEX</text>
      </svg>
    )
  }
  return <span className="text-sm font-bold text-white">{brand}</span>
}

function LimitBar({ label, spent, limit }: { label: string; spent: number; limit: number }) {
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const available = Math.max(limit - spent, 0);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-surface-400">{label}</span>
        <span className="text-surface-600 dark:text-surface-300">{money(available)} disponible</span>
      </div>
      <div className="h-1.5 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-danger-500' : pct > 50 ? 'bg-yellow-500' : 'bg-success-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs mt-0.5">
        <span className="text-surface-400">{money(spent)} gastado</span>
        <span className="text-surface-400">{money(limit)} limite</span>
      </div>
    </div>
  );
}
