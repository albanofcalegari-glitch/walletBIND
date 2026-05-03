'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { money, fullDate } from '@/lib/format';

type Tab = 'send' | 'scheduled' | 'history';
type TransferType = 'internal' | 'external';

export default function TransfersPage() {
  const [tab, setTab] = useState<Tab>('send');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Transferencias</h1>

      <div className="flex gap-1 bg-surface-100 dark:bg-surface-900 p-1 rounded-lg w-fit">
        {([
          { key: 'send', label: 'Enviar' },
          { key: 'scheduled', label: 'Programadas' },
          { key: 'history', label: 'Historial' },
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

      {tab === 'send' && <SendTransfer />}
      {tab === 'scheduled' && <ScheduledTransfers />}
      {tab === 'history' && <TransferHistory />}
    </div>
  );
}

function SendTransfer() {
  const [type, setType] = useState<TransferType>('external');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [fromWalletId, setFromWalletId] = useState('');
  const [destCbu, setDestCbu] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [concepto, setConcepto] = useState('VAR');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
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
    setResult(null);
    setSubmitting(true);
    try {
      if (type === 'external') {
        const res = await api.externalTransfer({
          fromWalletId,
          destCbu,
          amount: Number(amount),
          concepto,
          description: description || undefined,
        });
        setResult(res);
      } else {
        const res = await api.internalTransfer({
          fromWalletId,
          toWalletId,
          amount: Number(amount),
          description: description || undefined,
        });
        setResult(res);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500";

  return (
    <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6">
      <div className="flex gap-4 mb-6">
        {(['external', 'internal'] as TransferType[]).map((t) => (
          <label key={t} className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="type" checked={type === t} onChange={() => setType(t)} className="accent-brand-500" />
            <span className="text-sm text-surface-600 dark:text-surface-300">{t === 'external' ? 'A CBU/CVU externo' : 'Entre cuentas'}</span>
          </label>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-surface-500 mb-1">Cuenta origen</label>
          <select value={fromWalletId} onChange={(e) => setFromWalletId(e.target.value)} className={inputCls}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.alias || a.cvu} — {money(Number(a.cachedBalance), a.currency)}</option>
            ))}
          </select>
        </div>

        {type === 'external' ? (
          <>
            <div>
              <label className="block text-sm text-surface-500 mb-1">CBU/CVU destino</label>
              <input type="text" value={destCbu} onChange={(e) => setDestCbu(e.target.value)} className={inputCls} placeholder="0000000000000000000000" required />
            </div>
            <div>
              <label className="block text-sm text-surface-500 mb-1">Concepto</label>
              <select value={concepto} onChange={(e) => setConcepto(e.target.value)} className={inputCls}>
                <option value="VAR">Varios</option>
                <option value="FAC">Factura</option>
                <option value="HAB">Haberes</option>
                <option value="HON">Honorarios</option>
                <option value="ALQ">Alquiler</option>
                <option value="CUO">Cuota</option>
                <option value="EXP">Expensas</option>
                <option value="PRE">Prestamo</option>
                <option value="SEG">Seguro</option>
              </select>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm text-surface-500 mb-1">Cuenta destino</label>
            <select value={toWalletId} onChange={(e) => setToWalletId(e.target.value)} className={inputCls}>
              <option value="">Selecciona una cuenta</option>
              {accounts.filter(a => a.id !== fromWalletId).map((a) => (
                <option key={a.id} value={a.id}>{a.alias || a.cvu}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm text-surface-500 mb-1">Monto</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} placeholder="0.00" min="0.01" step="0.01" required />
        </div>

        <div>
          <label className="block text-sm text-surface-500 mb-1">Descripcion (opcional)</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} placeholder="Pago proveedor, haberes, etc." />
        </div>

        {error && (
          <div className="p-3 bg-danger-500/10 border border-danger-500/20 rounded-lg text-danger-400 text-sm">{error}</div>
        )}

        {result && (
          <div className="p-3 bg-success-500/10 border border-success-500/20 rounded-lg text-success-400 text-sm">
            Transferencia completada (ID: {result.id})
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-800 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
        >
          {submitting ? 'Enviando...' : 'Transferir'}
        </button>
      </form>
    </div>
  );
}

function ScheduledTransfers() {
  const [scheduled, setScheduled] = useState([
    { id: '1', dest: 'Proveedor Logistica SA', cbu: '0070999030004123456789', amount: 85000, frequency: 'Mensual', nextDate: '2026-05-05', description: 'Flete mensual', active: true },
    { id: '2', dest: 'Estudio Contable Martinez', cbu: '0140999030004987654321', amount: 42000, frequency: 'Mensual', nextDate: '2026-05-10', description: 'Honorarios', active: true },
    { id: '3', dest: 'Alquiler Oficina CABA', cbu: '0110999030004444555666', amount: 195000, frequency: 'Mensual', nextDate: '2026-05-01', description: 'Alquiler oficina', active: true },
    { id: '4', dest: 'Maria Lopez', cbu: '0170999030004111222333', amount: 35000, frequency: 'Quincenal', nextDate: '2026-05-15', description: 'Freelance diseño', active: false },
  ]);
  const [showCreate, setShowCreate] = useState(false);

  const toggleActive = (id: string) => {
    setScheduled(scheduled.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const inputCls = "w-full px-4 py-2.5 bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Programar transferencia
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-surface-900 border border-brand-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Nueva transferencia programada</h3>
            <button onClick={() => setShowCreate(false)} className="text-surface-400 hover:text-surface-900 dark:hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-surface-500 mb-1">Destinatario</label>
              <input type="text" className={inputCls} placeholder="Nombre o razon social" />
            </div>
            <div>
              <label className="block text-sm text-surface-500 mb-1">CBU/CVU destino</label>
              <input type="text" className={inputCls} placeholder="0000000000000000000000" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-surface-500 mb-1">Monto</label>
              <input type="number" className={inputCls} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm text-surface-500 mb-1">Frecuencia</label>
              <select className={inputCls}>
                <option>Semanal</option>
                <option>Quincenal</option>
                <option>Mensual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-surface-500 mb-1">Primer envio</label>
              <input type="date" className={inputCls} />
            </div>
          </div>
          <button className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors">
            Programar
          </button>
        </div>
      )}

      <div className="space-y-3">
        {scheduled.map((s) => (
          <div key={s.id} className={`bg-white dark:bg-surface-900 border rounded-xl p-5 transition-colors ${s.active ? 'border-surface-200 dark:border-surface-800' : 'border-surface-200/50 dark:border-surface-800/50 opacity-60'}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-surface-900 dark:text-white font-medium">{s.dest}</p>
                <p className="text-xs text-surface-400 font-mono mt-0.5">CBU ...{s.cbu.slice(-6)}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-lg font-bold text-surface-900 dark:text-white">{money(s.amount)}</p>
                <button
                  onClick={() => toggleActive(s.id)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${s.active ? 'bg-brand-600' : 'bg-surface-300 dark:bg-surface-700'}`}
                >
                  <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                    style={{ left: s.active ? '22px' : '2px' }}
                  />
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-surface-400">
              <span>{s.frequency}</span>
              <span>&middot;</span>
              <span>Proximo: {s.nextDate}</span>
              <span>&middot;</span>
              <span>{s.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransferHistory() {
  const [transfers, setTransfers] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTransfers({ limit: 50 }).then(setTransfers).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500" /></div>;
  }

  if (!transfers?.data?.length) {
    return (
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-8 text-center text-surface-400">
        No hay transferencias registradas
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-surface-100 dark:border-surface-800 text-xs text-surface-400">
            <th className="text-left px-5 py-3 font-medium">Fecha</th>
            <th className="text-left px-5 py-3 font-medium">Tipo</th>
            <th className="text-left px-5 py-3 font-medium">Descripcion</th>
            <th className="text-left px-5 py-3 font-medium">Destino</th>
            <th className="text-right px-5 py-3 font-medium">Monto</th>
            <th className="text-left px-5 py-3 font-medium">Estado</th>
            <th className="text-right px-5 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {transfers.data.map((t: any) => (
            <tr key={t.id} className="border-b border-surface-100/50 dark:border-surface-800/50 hover:bg-surface-50 dark:hover:bg-surface-800/40">
              <td className="px-5 py-3 text-sm text-surface-500">{fullDate(t.createdAt)}</td>
              <td className="px-5 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  t.direction === 'INTERNAL' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                  t.direction === 'OUTBOUND' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' :
                  'bg-success-500/10 text-success-600 dark:text-success-400'
                }`}>
                  {t.direction === 'INTERNAL' ? 'Interna' : t.direction === 'OUTBOUND' ? 'Saliente' : 'Entrante'}
                </span>
              </td>
              <td className="px-5 py-3 text-sm text-surface-900 dark:text-white">{t.transaction?.description || '-'}</td>
              <td className="px-5 py-3 text-xs text-surface-400 font-mono">{t.destCbu ? `CBU ...${t.destCbu.slice(-6)}` : '-'}</td>
              <td className="px-5 py-3 text-sm text-right font-medium text-surface-900 dark:text-white">{money(Number(t.amount), t.currency)}</td>
              <td className="px-5 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  t.status === 'COMPLETED' ? 'bg-success-500/10 text-success-600 dark:text-success-400' :
                  t.status === 'FAILED' ? 'bg-danger-500/10 text-danger-500' :
                  'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                }`}>
                  {t.status}
                </span>
              </td>
              <td className="px-5 py-3 text-right">
                <button className="p-1.5 text-surface-400 hover:text-surface-900 dark:hover:text-white rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" title="Descargar comprobante">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
