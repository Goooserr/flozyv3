'use client'

import React, { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Loader2, Sparkles, Building2, User, Mail, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

function RegisterForm() {
  const searchParams = useSearchParams()
  const initialPlan = searchParams.get('plan') || 'starter'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [plan, setPlan] = useState(initialPlan)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
            plan: plan
          }
        }
      })

      if (signUpError) throw signUpError

      // Redirect to dashboard
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription.')
    } finally {
      setLoading(false)
    }
  }

  const plans = [
    { id: 'starter', name: 'Starter', price: 'Gratuit', features: 'Clients & Devis' },
    { id: 'pro', name: 'Professionnel', price: '29€', features: 'Branding & Planning' },
    { id: 'expert', name: 'Expert', price: '49€', features: 'Stock & Multi-user' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden py-20">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50 mix-blend-screen" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none opacity-50 mix-blend-screen" />
      
      <div className="w-full max-w-xl px-6 relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <div className="w-4 h-4 bg-black rounded-sm" />
            </div>
            <span className="font-bold text-xl tracking-tight italic text-white">Flozy</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Prêt pour l'excellence ?</h1>
          <p className="text-zinc-400 text-sm">Configurez votre espace de travail en quelques secondes.</p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm text-center font-medium animate-in slide-in-from-top-2">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Votre nom complet"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 pl-12 text-sm text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Entreprise"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 pl-12 text-sm text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse email"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 pl-12 text-sm text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe (min 6 car.)"
                  minLength={6}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 pl-12 text-sm text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Choisissez votre plan</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {plans.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => setPlan(p.id)}
                    className={cn(
                      "cursor-pointer p-4 rounded-2xl border transition-all relative overflow-hidden group",
                      plan === p.id 
                        ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]" 
                        : "bg-black/40 border-white/5 hover:border-white/20"
                    )}
                  >
                    <div className="relative z-10">
                      <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-1", plan === p.id ? "text-primary" : "text-zinc-500")}>
                        {p.name}
                      </p>
                      <p className="font-bold text-lg text-white">{p.price}</p>
                      <p className="text-[10px] text-zinc-400 mt-1">{p.features}</p>
                    </div>
                    {plan === p.id && (
                      <div className="absolute top-2 right-2">
                        <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password || !fullName || !companyName}
              className="w-full flex items-center justify-center gap-2 bg-white text-black rounded-xl py-4 font-bold hover:bg-zinc-200 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Démarrer avec le plan {plans.find(p => p.id === plan)?.name} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-zinc-500">
            Déjà inscrit ?{' '}
            <Link href="/login" className="text-white hover:text-primary font-medium transition-colors">
              Connectez-vous ici
            </Link>
          </div>
        </div>
        
        {/* Support floating text */}
        <div className="mt-12 text-center text-xs text-zinc-600 flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3 text-primary" />
          <p>La configuration initiale prend moins de 2 minutes.</p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-white opacity-20" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}

