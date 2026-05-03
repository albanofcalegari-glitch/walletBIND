'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { money, shortDate, cryptoAmount } from '@/lib/format'
import {
  Eye, EyeOff, Wallet, DollarSign, Bitcoin, TrendingUp,
  ArrowUpRight, ArrowDownLeft, CreditCard, ChevronRight,
} from 'lucide-react'

const today = () =>
  new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export default function DashboardPage() {
  const { user } = useAuth()
  const [position, setPosition] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [show, setShow] = useState(true)

  useEffect(() => {
    api.getPosition().then(setPosition).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
      </div>
    )
  }

  if (!position) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Hola, {user?.name?.split(' ')[0]}
          </h1>
          <p className="mt-1 capitalize text-surface-500">{today()}</p>
          <p className="mt-0.5 text-xs text-surface-400">
            {position.company.name} &middot; CUIT {position.company.cuit}
          </p>
        </div>
        <button
          onClick={() => setShow(!show)}
          className="flex items-center gap-2 self-start rounded-xl border border-surface-200 bg-white px-3.5 py-2 text-sm font-medium text-surface-600 transition-colors hover:border-surface-300 hover:text-surface-900 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400 dark:hover:border-surface-600 dark:hover:text-white"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
          {show ? 'Ocultar saldos' : 'Mostrar saldos'}
        </button>
      </div>

      {/* Total cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TotalCard icon={Wallet} label="Total ARS" value={show ? money(position.totals.ars) : '••••••'} gradient="from-blue-500 to-blue-600" />
        <TotalCard icon={DollarSign} label="Total USD" value={show ? money(position.totals.usd, 'USD') : '••••••'} gradient="from-emerald-500 to-emerald-600" />
        <TotalCard icon={Bitcoin} label="Crypto (ARS)" value={show ? money(position.totals.crypto_ars) : '••••••'} gradient="from-brand-500 to-brand-600" />
        <TotalCard icon={TrendingUp} label="Total General" value={show ? money(position.totals.total_ars) : '••••••'} gradient="from-surface-700 to-surface-800 dark:from-surface-600 dark:to-surface-700" large />
      </div>

      {/* Accounts */}
      <Section title="Cuentas">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {position.accounts.map((acc: any) => (
            <Link
              key={acc.walletId}
              href={`/accounts/${acc.walletId}`}
              className="group rounded-2xl border border-surface-200 bg-white p-5 transition-all hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/5 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-brand-500/40"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-500">{acc.label}</p>
                  <p className="mt-0.5 font-mono text-xs text-surface-400">CVU {acc.cvu?.slice(-8)}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    acc.status === 'ACTIVE'
                      ? 'bg-success-500/10 text-success-600 dark:text-success-400'
                      : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                  }`}
                >
                  {acc.status === 'ACTIVE' ? 'Activa' : acc.status}
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold text-brand-600 dark:text-brand-400">
                {show ? money(acc.balance, acc.currency) : '••••••'}
              </p>
              <div className="mt-3 flex items-center text-xs font-medium text-brand-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-brand-400">
                Ver movimientos <ChevronRight size={14} className="ml-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Cards */}
      <Section title="Tarjetas Corporativas" href="/cards">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {position.cards.map((card: any) => (
            <div
              key={card.cardId}
              className="overflow-hidden rounded-2xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900"
            >
              <div className={`px-5 pt-5 pb-4 ${
                card.brand === 'VISA'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-800'
                  : card.brand === 'MASTERCARD'
                  ? 'bg-gradient-to-br from-slate-800 to-slate-950'
                  : 'bg-gradient-to-br from-surface-600 to-surface-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardBrandLogo brand={card.brand} />
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                        card.cardType === 'VIRTUAL'
                          ? 'bg-white/20 text-white'
                          : 'bg-white/10 text-white/80'
                      }`}
                    >
                      {card.cardType === 'VIRTUAL' ? 'Virtual' : 'Fisica'}
                    </span>
                  </div>
                  <span className={`h-2.5 w-2.5 rounded-full border border-white/30 ${card.status === 'ACTIVE' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                </div>
                <p className="mt-4 font-mono text-lg font-semibold text-white tracking-wider">
                  **** {card.lastFour}
                </p>
                <p className="mt-1 text-sm text-white/80">{card.holderName}</p>
                <p className="text-xs text-white/50">{card.cardName}</p>
              </div>
              <div className="px-5 py-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-surface-400">Disponible hoy</span>
                  <span className="font-medium text-surface-900 dark:text-white">{show ? money(card.availableDaily) : '••••'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-surface-400">Disponible mes</span>
                  <span className="font-medium text-surface-900 dark:text-white">{show ? money(card.availableMonthly) : '••••'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Crypto */}
      {position.crypto.length > 0 && (
        <Section title="Crypto" href="/crypto">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {position.crypto.map((c: any) => (
              <div
                key={c.symbol}
                className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/10">
                    <Bitcoin size={16} className="text-brand-500" />
                  </div>
                  <span className="text-lg font-bold text-surface-900 dark:text-white">{c.symbol}</span>
                </div>
                <p className="mt-3 text-sm text-surface-500">
                  {show ? `${cryptoAmount(c.amount)} ${c.symbol}` : '••••'}
                </p>
                <p className="mt-1 text-xl font-bold text-brand-600 dark:text-brand-400">
                  {show ? money(c.valuationArs) : '••••••'}
                </p>
                <p className="mt-1 text-xs text-surface-400">Precio: {money(c.lastPrice)}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Recent movements */}
      <Section title="Ultimos Movimientos">
        <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100 dark:border-surface-800">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Fecha</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Descripcion</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Tipo</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-surface-400">Monto</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-surface-400">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800/50">
                {position.recentMovements.map((m: any) => (
                  <tr key={m.id} className="transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/40">
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm text-surface-500">{shortDate(m.date)}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-surface-900 dark:text-white">{m.description}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-surface-100 px-2 py-0.5 text-xs font-medium text-surface-600 dark:bg-surface-800 dark:text-surface-400">
                        {m.sign === 'credit' ? (
                          <ArrowDownLeft size={12} className="text-success-500" />
                        ) : (
                          <ArrowUpRight size={12} className="text-danger-400" />
                        )}
                        {m.type}
                      </span>
                    </td>
                    <td className={`whitespace-nowrap px-5 py-3.5 text-right text-sm font-semibold ${
                      m.sign === 'credit' ? 'text-success-600 dark:text-success-400' : 'text-danger-500 dark:text-danger-400'
                    }`}>
                      {show ? `${m.sign === 'credit' ? '+' : '-'}${money(m.amount)}` : '••••'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right text-sm text-surface-500">
                      {show ? money(m.balanceAfter) : '••••'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>
    </div>
  )
}

function TotalCard({
  icon: Icon,
  label,
  value,
  gradient,
  large,
}: {
  icon: any
  label: string
  value: string
  gradient: string
  large?: boolean
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
      <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${gradient} opacity-10`} />
      <div className="relative">
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-surface-100 to-surface-200 dark:from-surface-800 dark:to-surface-700">
          <Icon size={18} className="text-surface-600 dark:text-surface-300" />
        </div>
        <p className="text-xs font-medium uppercase tracking-wider text-surface-400">{label}</p>
        <p className={`mt-1 font-bold text-brand-600 dark:text-brand-400 ${large ? 'text-2xl' : 'text-xl'}`}>
          {value}
        </p>
      </div>
    </div>
  )
}

function Section({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{title}</h2>
        {href && (
          <Link href={href} className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
            Ver todo <ChevronRight size={14} />
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}

function CardBrandLogo({ brand }: { brand: string }) {
  if (brand === 'VISA') {
    return (
      <svg viewBox="0 0 780 500" className="h-6 w-auto" fill="none">
        <path d="M293.2 348.7l33.4-195.8h53.4l-33.4 195.8H293.2zM531.5 157.1c-10.6-4-27.2-8.3-47.9-8.3-52.8 0-90 26.6-90.3 64.7-.3 28.2 26.6 43.9 46.9 53.3 20.9 9.6 27.9 15.7 27.8 24.3-.1 13.1-16.7 19.1-32.1 19.1-21.4 0-32.8-3-50.4-10.3l-6.9-3.1-7.5 44c12.5 5.5 35.6 10.2 59.6 10.5 56.2 0 92.7-26.3 93.1-67 .2-22.3-14-39.3-44.8-53.3-18.7-9.1-30.1-15.1-30-24.3 0-8.1 9.7-16.8 30.6-16.8 17.5-.3 30.1 3.5 40 7.5l4.8 2.3 7.1-42.6zM661.6 152.9h-41.3c-12.8 0-22.4 3.5-28 16.3l-79.4 179.5h56.2s9.2-24.2 11.3-29.5h68.6c1.6 6.9 6.5 29.5 6.5 29.5h49.7l-43.6-195.8zm-65.9 126.2c4.4-11.3 21.4-54.8 21.4-54.8-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.3 47 12.4 56.6h-44.5zM232.8 152.9l-52.3 133.5-5.6-27.1c-9.7-31.2-39.9-65-73.7-81.9l47.9 171.1h56.6l84.2-195.6h-57.1z" fill="#fff"/>
        <path d="M138.4 152.9H52.6l-.6 3.6c67.1 16.2 111.5 55.4 129.9 102.5L163.7 169c-3.2-12.4-12.6-15.7-25.3-16.1z" fill="#f9a51a"/>
      </svg>
    )
  }
  if (brand === 'MASTERCARD') {
    return (
      <svg viewBox="0 0 48 30" className="h-7 w-auto">
        <circle cx="18" cy="15" r="12" fill="#eb001b" />
        <circle cx="30" cy="15" r="12" fill="#f79e1b" />
        <path d="M24 5.2a14.9 14.9 0 0 0-6 9.8 14.9 14.9 0 0 0 6 9.8 14.9 14.9 0 0 0 6-9.8 14.9 14.9 0 0 0-6-9.8z" fill="#ff5f00" />
      </svg>
    )
  }
  if (brand === 'AMEX') {
    return (
      <svg viewBox="0 0 780 500" className="h-6 w-auto">
        <rect width="780" height="500" rx="40" fill="#2E77BC" />
        <text x="390" y="290" textAnchor="middle" fill="#fff" fontSize="160" fontWeight="bold" fontFamily="Arial, sans-serif">AMEX</text>
      </svg>
    )
  }
  return (
    <div className="flex h-6 items-center">
      <CreditCard size={18} className="text-white/70" />
    </div>
  )
}
