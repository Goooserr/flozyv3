'use client'

import React, { useState } from 'react'
import { Shield, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)

    // Mot de passe maître pour la démo / développement
    setTimeout(() => {
      if (password === 'flozy2024') {
        localStorage.setItem('flozy_admin_access', 'true')
        router.push('/admin')
      } else {
        setError(true)
        setLoading(false)
      }
    }, 800)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-in fade-in duration-700">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Décoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4 border border-amber-500/20">
              <Shield className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Accès Super-Admin</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Veuillez saisir le mot de passe maître pour accéder à la tour de contrôle.
            </p>
          </div>

          <form onSubmit={handleLogin} className="relative z-10 space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe maître"
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 pl-10 text-sm outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-xs text-rose-500 font-medium pl-1 animate-in slide-in-from-top-1">
                  Mot de passe incorrect.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white rounded-xl py-3 font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Déverrouiller <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-muted-foreground relative z-10">
            En cas d'oubli, consultez la documentation technique ou contactez le support développeur.
          </div>
        </div>
      </div>
    </div>
  )
}
