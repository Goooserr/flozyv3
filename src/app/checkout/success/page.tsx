'use client'

import React from 'react'
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-[3rem] p-12 text-center shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </div>
        
        <h1 className="text-3xl font-black mb-4">Paiement Validé !</h1>
        <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-6">
          <Sparkles className="w-4 h-4" /> Bienvenue chez Flozy Pro
        </div>
        
        <p className="text-muted-foreground mb-10 leading-relaxed">
          Votre compte a été mis à jour avec succès. Vous avez désormais accès à tous les outils premium pour piloter votre activité.
        </p>
        
        <Link 
          href="/dashboard"
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl shadow-primary/20"
        >
          Accéder à mon Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
