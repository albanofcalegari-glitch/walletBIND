'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { money } from '@/lib/format';

export default function CardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const [showRequest, setShowRequest] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Tarjetas Corporativas</h1>
        <button
          onClick={() => setShowRequest(!showRequest)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
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
          <div key={card.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {/* Card visual */}
            <div className={`p-6 ${card.brand === 'VISA' ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gradient-to-br from-orange-600 to-red-700'}`}>
              <div className="flex justify-between items-start">
                <span className="text-xs text-white/70 uppercase">{card.cardName}</span>
                <span className="text-sm font-bold text-white">{card.brand}</span>
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

            {/* Card details */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Estado</span>
                <span className={`text-sm font-medium ${card.status === 'ACTIVE' ? 'text-green-400' : card.status === 'FROZEN' ? 'text-blue-400' : 'text-red-400'}`}>
                  {card.status === 'ACTIVE' ? 'Activa' : card.status === 'FROZEN' ? 'Congelada' : card.status}
                </span>
              </div>

              <div className="space-y-2">
                <LimitBar label="Limite diario" spent={Number(card.spentToday)} limit={Number(card.dailyLimit)} />
                <LimitBar label="Limite mensual" spent={Number(card.spentMonth)} limit={Number(card.monthlyLimit)} />
              </div>

              <div className="pt-3 border-t border-slate-800 flex gap-2">
                <button
                  onClick={() => toggleFreeze(card)}
                  className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${
                    card.status === 'ACTIVE'
                      ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                      : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                  }`}
                >
                  {card.status === 'ACTIVE' ? 'Congelar' : 'Activar'}
                </button>
              </div>

              {card.assignedUser && (
                <p className="text-xs text-slate-600">
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
      // TODO: integrate with real card request API
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
    <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-white">Solicitar nueva tarjeta</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Tipo</label>
            <div className="flex gap-2">
              {(['VIRTUAL', 'PHYSICAL'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setCardType(t)}
                  className={`flex-1 py-2.5 text-sm rounded-lg border font-medium transition-colors ${
                    cardType === t
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {t === 'VIRTUAL' ? 'Virtual' : 'Fisica'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Marca</label>
            <div className="flex gap-2">
              {(['VISA', 'MASTERCARD'] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBrand(b)}
                  className={`flex-1 py-2.5 text-sm rounded-lg border font-medium transition-colors ${
                    brand === b
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
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
            <label className="block text-sm text-slate-400 mb-1">Nombre de tarjeta</label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Gastos operativos, Marketing..."
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Titular</label>
            <input
              type="text"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre y apellido"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Limite diario</label>
            <input
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Limite mensual</label>
            <input
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
        )}

        {result && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
            Solicitud enviada. La tarjeta estara disponible en breve.
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
        >
          {submitting ? 'Enviando solicitud...' : `Solicitar tarjeta ${cardType === 'VIRTUAL' ? 'virtual' : 'fisica'}`}
        </button>
      </form>
    </div>
  );
}

function LimitBar({ label, spent, limit }: { label: string; spent: number; limit: number }) {
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const available = Math.max(limit - spent, 0);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-300">{money(available)} disponible</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs mt-0.5">
        <span className="text-slate-600">{money(spent)} gastado</span>
        <span className="text-slate-600">{money(limit)} limite</span>
      </div>
    </div>
  );
}
