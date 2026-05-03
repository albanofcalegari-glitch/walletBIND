'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@acmecorp.com.ar')
  const [password, setPassword] = useState('123456')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-950 px-4">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-brand-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm animate-[fadeIn_0.5s_ease-out]">
        {/* Logo */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            wallet<span className="text-brand-400">BIND</span>
          </h1>
          <p className="mt-2 text-sm text-surface-500">Billetera corporativa</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-surface-800/50 bg-surface-900/60 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <h2 className="mb-6 text-lg font-semibold text-white">Iniciar sesion</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-surface-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-surface-700/50 bg-surface-800/50 px-4 py-3 text-sm text-white placeholder:text-surface-600 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                placeholder="tu@empresa.com"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-surface-400">Contrasena</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-surface-700/50 bg-surface-800/50 px-4 py-3 pr-11 text-sm text-white placeholder:text-surface-600 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-danger-500/20 bg-danger-500/10 px-4 py-3 text-sm text-danger-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:shadow-xl hover:shadow-brand-600/30 hover:brightness-110 disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Ingresando...
                </>
              ) : (
                <>
                  Ingresar
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-surface-600">
          Powered by <span className="font-medium text-surface-500">BIND</span> Pagos
        </p>
      </div>
    </div>
  )
}
