'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { money } from '@/lib/format';

const SERVICE_CATEGORIES = [
  { key: 'utilities', label: 'Servicios', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { key: 'taxes', label: 'Impuestos', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
  { key: 'telecom', label: 'Telecomunicaciones', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
  { key: 'insurance', label: 'Seguros', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
];

const SERVICES = [
  { id: '1', category: 'utilities', name: 'Edenor', description: 'Energia electrica', icon: 'EN' },
  { id: '2', category: 'utilities', name: 'Metrogas', description: 'Gas natural', icon: 'MG' },
  { id: '3', category: 'utilities', name: 'AySA', description: 'Agua y saneamiento', icon: 'AY' },
  { id: '4', category: 'utilities', name: 'Edesur', description: 'Energia electrica', icon: 'ES' },
  { id: '5', category: 'taxes', name: 'AFIP', description: 'Monotributo / IVA / Ganancias', icon: 'AF' },
  { id: '6', category: 'taxes', name: 'ARBA', description: 'Ingresos brutos PBA', icon: 'AR' },
  { id: '7', category: 'taxes', name: 'AGIP', description: 'Ingresos brutos CABA', icon: 'AG' },
  { id: '8', category: 'telecom', name: 'Personal', description: 'Celular y fibra', icon: 'PE' },
  { id: '9', category: 'telecom', name: 'Movistar', description: 'Celular y fibra', icon: 'MO' },
  { id: '10', category: 'telecom', name: 'Claro', description: 'Celular y fibra', icon: 'CL' },
  { id: '11', category: 'insurance', name: 'La Caja', description: 'Seguros generales', icon: 'LC' },
  { id: '12', category: 'insurance', name: 'Zurich', description: 'ART y seguros', icon: 'ZU' },
];

export default function ServicesPage() {
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState<typeof SERVICES[0] | null>(null);

  const filtered = SERVICES.filter(s => {
    if (category && s.category !== category) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (selectedService) {
    return <PayService service={selectedService} onBack={() => setSelectedService(null)} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Pago de Servicios</h1>
        <p className="text-sm text-slate-400 mt-1">Paga tus facturas de servicios, impuestos y mas</p>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SERVICE_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(category === cat.key ? null : cat.key)}
            className={`p-4 rounded-xl border text-left transition-colors ${
              category === cat.key
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-800 bg-slate-900 hover:border-slate-700'
            }`}
          >
            <svg className={`w-6 h-6 mb-2 ${category === cat.key ? 'text-blue-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
            </svg>
            <p className={`text-sm font-medium ${category === cat.key ? 'text-blue-400' : 'text-slate-300'}`}>{cat.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar servicio..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Service list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((service) => (
          <button
            key={service.id}
            onClick={() => setSelectedService(service)}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4 hover:border-slate-700 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
              {service.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{service.name}</p>
              <p className="text-xs text-slate-500">{service.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function PayService({ service, onBack }: { service: typeof SERVICES[0]; onBack: () => void }) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [fromWalletId, setFromWalletId] = useState('');
  const [invoiceCode, setInvoiceCode] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAccounts().then((accs) => {
      setAccounts(accs);
      if (accs.length > 0) setFromWalletId(accs[0].id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      setResult(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver a servicios
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-400">
            {service.icon}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{service.name}</h2>
            <p className="text-sm text-slate-500">{service.description}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Codigo de pago / Nro de cliente</label>
            <input
              type="text"
              value={invoiceCode}
              onChange={(e) => setInvoiceCode(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingresa el codigo de la factura"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Monto</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Cuenta a debitar</label>
            <select
              value={fromWalletId}
              onChange={(e) => setFromWalletId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.alias || a.cvu} — {money(Number(a.cachedBalance), a.currency)}</option>
              ))}
            </select>
          </div>

          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}
          {result && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
              Pago realizado exitosamente. Comprobante disponible.
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || result}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {submitting ? 'Procesando...' : result ? 'Pagado' : `Pagar ${service.name}`}
          </button>
        </form>
      </div>
    </div>
  );
}
