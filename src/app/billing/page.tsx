'use client'

import React, { useState } from 'react'
import { CreditCard, CheckCircle2, Zap, Shield, Crown, ArrowRight, Loader2 } from 'lucide-react'
import { useTheme } from '@/components/DynamicThemeProvider'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '0',
    description: 'Pour les artisans qui se lancent.',
    features: ['5 factures par mois', 'CRM basique', 'Support par email'],
    icon: Shield,
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-500/10',
    borderColor: 'border-zinc-500/20',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '29',
    description: 'Le choix idéal pour accélérer votre activité.',
    features: ['Factures illimitées', 'Gestion de Stock', 'Planning interactif', 'Relances automatiques', 'Support prioritaire'],
    icon: Zap,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '79',
    description: 'Une marque blanche totale pour les plus exigeants.',
    features: ['Tout le plan Pro', 'Marque blanche totale', 'Domaine personnalisé', 'Accès API dédié', 'Conseiller personnel'],
    icon: Crown,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  }
]

export default function BillingPage() {
  const { primaryColor } = useTheme()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  
  // Mock current user usage
  const invoicesUsed = 3
  const invoicesLimit = 5
  const usagePercentage = (invoicesUsed / invoicesLimit) * 100
  const currentPlan = 'starter'

  const handleUpgrade = (planId: string) => {
    setLoadingPlan(planId)
    setTimeout(() => {
      alert("Le module de paiement Stripe est en cours d'intégration. Cette fonctionnalité sera bientôt disponible !")
      setLoadingPlan(null)
    }, 1000)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-1">
          <CreditCard className="w-4 h-4" /> Abonnement & Facturation
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Gérez votre Forfait</h2>
        <p className="text-muted-foreground">Passez à la vitesse supérieure pour débloquer de nouveaux outils professionnels.</p>
      </div>

      {/* Usage Bar for Starter */}
      {currentPlan === 'starter' && (
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
           <div className="flex justify-between items-end mb-4">
              <div>
                 <h3 className="font-bold text-lg mb-1">Consommation actuelle (Starter)</h3>
                 <p className="text-sm text-muted-foreground">Vous avez créé {invoicesUsed} factures ce mois-ci sur un maximum de {invoicesLimit}.</p>
              </div>
              <div className="text-right">
                 <span className="text-2xl font-black text-primary">{invoicesUsed}</span>
                 <span className="text-muted-foreground font-medium"> / {invoicesLimit}</span>
              </div>
           </div>
           <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                 className="h-full rounded-full transition-all duration-1000" 
                 style={{ width: `${usagePercentage}%`, backgroundColor: primaryColor }}
              />
           </div>
           {invoicesUsed >= 3 && (
              <p className="text-amber-500 text-sm font-bold mt-4 flex items-center gap-2">
                 <Zap className="w-4 h-4" /> Vous approchez de votre limite. Passez au plan Pro pour une création illimitée.
              </p>
           )}
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative flex flex-col bg-card border rounded-[2rem] p-8 transition-all duration-500 ${
               plan.popular 
               ? `border-primary shadow-2xl shadow-primary/10 scale-105 z-10` 
               : `border-border hover:border-primary/30`
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest rounded-full shadow-lg">
                Le plus choisi
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-6">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.bgColor} ${plan.borderColor} border`}>
                  <plan.icon className={`w-6 h-6 ${plan.color}`} />
               </div>
               <div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.id === currentPlan ? 'Plan actuel' : 'Éligible'}</p>
               </div>
            </div>

            <div className="mb-6">
               <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">{plan.price} €</span>
                  <span className="text-muted-foreground font-medium">/mois</span>
               </div>
               <p className="text-sm text-muted-foreground mt-2 min-h-[40px]">{plan.description}</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
               {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-medium text-foreground/80">
                     <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.id === 'starter' ? 'text-zinc-400' : 'text-primary'}`} />
                     {feature}
                  </li>
               ))}
            </ul>

            <button
               disabled={plan.id === currentPlan || loadingPlan === plan.id}
               onClick={() => handleUpgrade(plan.id)}
               className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${
                  plan.id === currentPlan 
                  ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                  : plan.popular
                     ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20'
                     : 'bg-secondary text-foreground hover:bg-secondary/80'
               }`}
            >
               {loadingPlan === plan.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
               ) : plan.id === currentPlan ? (
                  'Plan Actuel'
               ) : (
                  <>Choisir ce plan <ArrowRight className="w-4 h-4" /></>
               )}
            </button>
          </div>
        ))}
      </div>

      {/* Payment History (Mock) */}
      <div className="bg-card border border-border rounded-3xl p-8 mt-12">
         <h3 className="font-bold text-xl mb-6">Historique de facturation</h3>
         <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="w-8 h-8 mx-auto mb-3 opacity-20" />
            <p>Aucune facture disponible pour le moment.</p>
         </div>
      </div>
    </div>
  )
}
