'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme'
import {
  LayoutDashboard, ArrowLeftRight, CreditCard, Bitcoin,
  BarChart3, Building2, Users, Link2, Bell, Zap,
  LogOut, Sun, Moon, ChevronLeft, Menu,
} from 'lucide-react'
import { useState } from 'react'

const mainNav = [
  { href: '/', label: 'Posicion', icon: LayoutDashboard },
  { href: '/accounts', label: 'Cuentas', icon: Building2 },
  { href: '/transfers', label: 'Transferencias', icon: ArrowLeftRight },
  { href: '/cards', label: 'Tarjetas', icon: CreditCard },
  { href: '/crypto', label: 'Crypto', icon: Bitcoin },
]

const toolsNav = [
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/services', label: 'Servicios', icon: Zap },
  { href: '/contacts', label: 'Contactos', icon: Users },
  { href: '/payment-links', label: 'Links de pago', icon: Link2 },
  { href: '/notifications', label: 'Alertas', icon: Bell },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = user?.name
    ?.split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? '?'

  function NavItem({ item }: { item: (typeof mainNav)[0] }) {
    const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
    const Icon = item.icon
    return (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
          active
            ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
            : 'text-surface-500 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-white'
        } ${collapsed ? 'justify-center' : ''}`}
        title={collapsed ? item.label : undefined}
      >
        <Icon size={20} className={active ? 'text-white' : 'text-surface-400 group-hover:text-brand-500'} />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    )
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={`flex items-center border-b border-surface-200 dark:border-surface-800 ${collapsed ? 'justify-center px-3 py-5' : 'justify-between px-5 py-5'}`}>
        {collapsed ? (
          <span className="text-xl font-extrabold text-brand-600">W</span>
        ) : (
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-surface-900 dark:text-white">wallet</span>
            <span className="text-brand-500">BIND</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-white transition-colors"
        >
          <ChevronLeft size={16} className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {mainNav.map(item => (
          <NavItem key={item.href} item={item} />
        ))}

        <div className="pt-4 mt-4 border-t border-surface-200 dark:border-surface-800 space-y-1">
          {!collapsed && (
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-surface-400">
              Herramientas
            </p>
          )}
          {toolsNav.map(item => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-surface-200 dark:border-surface-800 p-3 space-y-2">
        <button
          onClick={toggle}
          className={`flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-surface-500 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-white transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? (theme === 'dark' ? 'Modo claro' : 'Modo oscuro') : undefined}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>}
        </button>

        {!collapsed && (
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-surface-900 dark:text-white">{user?.name}</p>
              <p className="truncate text-xs text-surface-500">{user?.company?.name}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className={`flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-surface-500 hover:bg-danger-500/10 hover:text-danger-500 transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Cerrar sesion' : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span>Cerrar sesion</span>}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-surface-200 bg-white/80 px-4 backdrop-blur-xl dark:border-surface-800 dark:bg-surface-950/80 md:hidden">
        <span className="text-lg font-extrabold tracking-tight">
          <span className="text-surface-900 dark:text-white">wallet</span>
          <span className="text-brand-500">BIND</span>
        </span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-full flex-col border-r border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900 transition-all duration-200 ${
          collapsed ? 'w-[72px]' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
