'use client';

import { useState } from 'react';
import { money } from '@/lib/format';

interface AlertRule {
  id: string;
  type: 'balance_low' | 'large_transaction' | 'card_usage' | 'transfer_received' | 'daily_summary';
  label: string;
  description: string;
  enabled: boolean;
  threshold?: number;
  channels: ('email' | 'push' | 'sms')[];
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const DEMO_RULES: AlertRule[] = [
  { id: '1', type: 'balance_low', label: 'Saldo bajo', description: 'Notificar cuando el saldo baje del umbral', enabled: true, threshold: 50000, channels: ['email', 'push'] },
  { id: '2', type: 'large_transaction', label: 'Movimiento grande', description: 'Alerta para transacciones superiores al monto', enabled: true, threshold: 100000, channels: ['email', 'push', 'sms'] },
  { id: '3', type: 'card_usage', label: 'Uso de tarjeta', description: 'Notificar cada consumo con tarjeta', enabled: true, channels: ['push'] },
  { id: '4', type: 'transfer_received', label: 'Transferencia recibida', description: 'Notificar al recibir una transferencia', enabled: false, channels: ['email'] },
  { id: '5', type: 'daily_summary', label: 'Resumen diario', description: 'Resumen de movimientos del dia a las 20hs', enabled: true, channels: ['email'] },
];

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'alert', title: 'Consumo tarjeta *4589', message: 'Juan Perez realizo un consumo de $12,500 en MercadoLibre', time: 'Hace 15 min', read: false },
  { id: '2', type: 'success', title: 'Transferencia recibida', message: 'Se acreditaron $85,000 de CBU ...456789', time: 'Hace 1 hora', read: false },
  { id: '3', type: 'warning', title: 'Saldo bajo - Cuenta ARS', message: 'El saldo de ACME.OPERATIVA.ARS esta por debajo de $50,000', time: 'Hace 3 horas', read: false },
  { id: '4', type: 'info', title: 'Resumen diario', message: '5 movimientos, ingresos: $125,000, egresos: $78,500', time: 'Ayer 20:00', read: true },
  { id: '5', type: 'success', title: 'Transferencia enviada', message: 'Se debitaron $42,000 a Proveedor Logistica SA', time: 'Ayer 14:30', read: true },
  { id: '6', type: 'alert', title: 'Consumo tarjeta *7812', message: 'Ana Garcia realizo un consumo de $8,200 en Booking.com', time: 'Ayer 11:15', read: true },
  { id: '7', type: 'info', title: 'Limite mensual al 80%', message: 'La tarjeta *3201 de Carlos Ruiz alcanzo el 80% del limite mensual', time: 'Hace 2 dias', read: true },
];

type Tab = 'notifications' | 'rules';

export default function NotificationsPage() {
  const [tab, setTab] = useState<Tab>('notifications');
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [rules, setRules] = useState(DEMO_RULES);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const toggleChannel = (ruleId: string, channel: 'email' | 'push' | 'sms') => {
    setRules(rules.map(r => {
      if (r.id !== ruleId) return r;
      const channels = r.channels.includes(channel)
        ? r.channels.filter(c => c !== channel)
        : [...r.channels, channel];
      return { ...r, channels };
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notificaciones y Alertas</h1>
          <p className="text-sm text-slate-400 mt-1">Configura alertas y revisa las notificaciones</p>
        </div>
        {tab === 'notifications' && unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Marcar todas como leidas
          </button>
        )}
      </div>

      <div className="flex gap-1 bg-slate-900 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab('notifications')}
          className={`px-4 py-2 text-sm rounded-md font-medium transition-colors flex items-center gap-2 ${tab === 'notifications' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Notificaciones
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">{unreadCount}</span>
          )}
        </button>
        <button
          onClick={() => setTab('rules')}
          className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${tab === 'rules' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Configurar alertas
        </button>
      </div>

      {tab === 'notifications' ? (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const iconColors = {
              info: 'text-blue-400 bg-blue-500/10',
              warning: 'text-yellow-400 bg-yellow-500/10',
              success: 'text-green-400 bg-green-500/10',
              alert: 'text-red-400 bg-red-500/10',
            };
            const icons = {
              info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
              warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
              success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
              alert: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
            };
            return (
              <div
                key={notif.id}
                className={`bg-slate-900 border rounded-xl p-4 flex items-start gap-4 transition-colors ${
                  notif.read ? 'border-slate-800/50 opacity-60' : 'border-slate-700'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconColors[notif.type]}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={icons[notif.type]} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${notif.read ? 'text-slate-400' : 'text-white'}`}>{notif.title}</p>
                    <span className="text-xs text-slate-600 shrink-0 ml-2">{notif.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                </div>
                {!notif.read && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2" />}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-medium">{rule.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{rule.description}</p>
                </div>
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${rule.enabled ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${rule.enabled ? 'left-5.5 translate-x-0' : 'left-0.5'}`}
                    style={{ left: rule.enabled ? '22px' : '2px' }}
                  />
                </button>
              </div>

              {rule.enabled && (
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Canales:</span>
                    {(['email', 'push', 'sms'] as const).map((ch) => (
                      <button
                        key={ch}
                        onClick={() => toggleChannel(rule.id, ch)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                          rule.channels.includes(ch)
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {ch === 'email' ? 'Email' : ch === 'push' ? 'Push' : 'SMS'}
                      </button>
                    ))}
                  </div>
                  {rule.threshold !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Umbral:</span>
                      <span className="text-xs text-white font-medium">{money(rule.threshold)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
