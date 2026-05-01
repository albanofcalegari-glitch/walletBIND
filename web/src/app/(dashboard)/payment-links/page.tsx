'use client';

import { useState } from 'react';
import { money } from '@/lib/format';

interface PaymentLink {
  id: string;
  title: string;
  amount: number | null;
  currency: string;
  status: 'active' | 'expired' | 'paid';
  createdAt: string;
  url: string;
  payments: number;
}

const DEMO_LINKS: PaymentLink[] = [
  { id: 'pl_001', title: 'Factura #2024-089', amount: 125000, currency: 'ARS', status: 'active', createdAt: '2026-04-28', url: 'https://pay.walletbind.com/pl_001', payments: 0 },
  { id: 'pl_002', title: 'Servicio mensual consulting', amount: 85000, currency: 'ARS', status: 'paid', createdAt: '2026-04-20', url: 'https://pay.walletbind.com/pl_002', payments: 1 },
  { id: 'pl_003', title: 'Donacion voluntaria', amount: null, currency: 'ARS', status: 'active', createdAt: '2026-04-15', url: 'https://pay.walletbind.com/pl_003', payments: 3 },
  { id: 'pl_004', title: 'Cuota curso Q1', amount: 45000, currency: 'ARS', status: 'expired', createdAt: '2026-03-01', url: 'https://pay.walletbind.com/pl_004', payments: 12 },
];

export default function PaymentLinksPage() {
  const [links, setLinks] = useState<PaymentLink[]>(DEMO_LINKS);
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCreate = (link: Omit<PaymentLink, 'id' | 'status' | 'createdAt' | 'url' | 'payments'>) => {
    const id = `pl_${String(links.length + 1).padStart(3, '0')}`;
    setLinks([{
      ...link,
      id,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      url: `https://pay.walletbind.com/${id}`,
      payments: 0,
    }, ...links]);
    setShowCreate(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Links de Pago</h1>
          <p className="text-sm text-slate-400 mt-1">Genera links para cobrar a clientes sin integracion tecnica</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Crear link
        </button>
      </div>

      {showCreate && (
        <CreateLinkForm
          onCreate={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Links activos</p>
          <p className="text-2xl font-bold text-white mt-1">{links.filter(l => l.status === 'active').length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Cobros recibidos</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{links.reduce((s, l) => s + l.payments, 0)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Monto cobrado</p>
          <p className="text-2xl font-bold text-white mt-1">{money(links.filter(l => l.status === 'paid').reduce((s, l) => s + (l.amount || 0), 0))}</p>
        </div>
      </div>

      {/* Links list */}
      <div className="space-y-3">
        {links.map((link) => (
          <div key={link.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">{link.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    link.status === 'active' ? 'bg-green-500/10 text-green-400' :
                    link.status === 'paid' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {link.status === 'active' ? 'Activo' : link.status === 'paid' ? 'Cobrado' : 'Expirado'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Creado {link.createdAt} &middot; {link.payments} pago{link.payments !== 1 ? 's' : ''}</p>
              </div>
              <p className="text-lg font-bold text-white">
                {link.amount ? money(link.amount, link.currency) : 'Monto libre'}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-slate-400 font-mono truncate">
                {link.url}
              </div>
              <button
                onClick={() => copyLink(link.url, link.id)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  copied === link.id
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {copied === link.id ? 'Copiado!' : 'Copiar'}
              </button>
              <button className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
                Compartir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreateLinkForm({ onCreate, onCancel }: {
  onCreate: (link: Omit<PaymentLink, 'id' | 'status' | 'createdAt' | 'url' | 'payments'>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [fixedAmount, setFixedAmount] = useState(true);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('ARS');

  return (
    <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Crear link de pago</h2>
        <button onClick={onCancel} className="text-slate-500 hover:text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onCreate({ title, amount: fixedAmount ? Number(amount) : null, currency }); }} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Titulo / Concepto</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Factura, servicio, donacion..." required />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Tipo de monto</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setFixedAmount(true)}
              className={`flex-1 py-2.5 text-sm rounded-lg border font-medium transition-colors ${fixedAmount ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-700 bg-slate-800 text-slate-400'}`}>
              Monto fijo
            </button>
            <button type="button" onClick={() => setFixedAmount(false)}
              className={`flex-1 py-2.5 text-sm rounded-lg border font-medium transition-colors ${!fixedAmount ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-700 bg-slate-800 text-slate-400'}`}>
              Monto libre
            </button>
          </div>
        </div>

        {fixedAmount && (
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-slate-400 mb-1">Monto</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00" min="0.01" step="0.01" required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Moneda</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
        )}

        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          Crear link de pago
        </button>
      </form>
    </div>
  );
}
