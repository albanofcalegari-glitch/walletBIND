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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Tarjetas Corporativas</h1>

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
