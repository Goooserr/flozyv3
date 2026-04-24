'use client'

import React, { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MousePointerClick,
  ChevronRight,
  Clock,
  Euro,
  TrendingUp,
  ShieldCheck
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function DemoClient() {
  const [step, setStep] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)

  // Simulation state for interactive elements
  const [invoiceGenerated, setInvoiceGenerated] = useState(false)
  const [jobAssigned, setJobAssigned] = useState(false)

  const steps = [
    { id: 1, title: 'Facturation Éclair', subtitle: 'Créez des devis pros en 30s' },
    { id: 2, title: 'Planning Intelligent', subtitle: 'Ne ratez plus aucun chantier' },
    { id: 3, title: 'Vision Globale', subtitle: 'Pilotez votre entreprise' },
  ]

  const handleNext = () => {
    if (step < 3) {
      setIsAnimating(true)
      setTimeout(() => {
        setStep(step + 1)
        setIsAnimating(false)
      }, 300)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col relative selection:bg-primary/30">
      
      {/* Dynamic Backgrounds based on step */}
      <div className={cn("absolute top-0 left-1/4 w-[800px] h-[500px] blur-[120px] rounded-full pointer-events-none opacity-30 mix-blend-screen transition-colors duration-1000", 
        step === 1 ? "bg-primary" : step === 2 ? "bg-blue-600" : "bg-emerald-600")} />
      
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 md:px-12 md:py-6 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-sm" />
          </div>
          <span className="font-bold text-xl italic tracking-tight hidden sm:block">Flozy</span>
          <span className="text-[10px] bg-primary/20 border border-primary/30 text-primary px-2 py-0.5 rounded-full uppercase font-bold tracking-widest">
            Visite Guidée
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
            Déjà client ?
          </Link>
          <Link href="/register" className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            Créer mon compte
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row relative z-10 max-w-[1600px] mx-auto w-full">
        
        {/* Left Column: Narrative (Marketing Copy) */}
        <div className="w-full lg:w-[400px] xl:w-[500px] p-6 md:p-12 flex flex-col justify-center border-r border-white/5 bg-zinc-950/30">
          <div className="space-y-12">
            
            {/* Step Indicators */}
            <div className="flex gap-2">
              {steps.map((s) => (
                <div key={s.id} className="flex-1">
                  <div className={cn("h-1.5 rounded-full w-full transition-all duration-500", 
                    step >= s.id ? "bg-primary" : "bg-zinc-800")} />
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className={cn("transition-all duration-500 transform", isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0")}>
              {step === 1 && (
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                    Des devis qui font <span className="text-primary italic">signer</span> vos clients.
                  </h1>
                  <p className="text-lg text-zinc-400 leading-relaxed">
                    Fini les tableaux Excel interminables. Générez des devis professionnels et élégants en quelques clics. Vos clients peuvent même les signer en ligne.
                  </p>
                  <ul className="space-y-3">
                    {['Modèles personnalisables', 'Calcul automatique de la TVA', 'Signature électronique incluse'].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                    <Calendar className="w-6 h-6 text-blue-500" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                    Un planning <span className="text-blue-500 italic">sous contrôle</span>.
                  </h1>
                  <p className="text-lg text-zinc-400 leading-relaxed">
                    Gérez vos équipes et vos chantiers depuis votre poche. Finis les oublis et les retards, tout est synchronisé en temps réel.
                  </p>
                  <ul className="space-y-3">
                    {['Vue semaine/mois claire', 'Assignation des équipes', 'Rappels automatiques'].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                        <CheckCircle2 className="w-5 h-5 text-blue-500" /> {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                    <LayoutDashboard className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                    Pilotez comme un <span className="text-emerald-500 italic">expert</span>.
                  </h1>
                  <p className="text-lg text-zinc-400 leading-relaxed">
                    Suivez votre chiffre d'affaires, vos factures impayées et l'état de vos stocks d'un seul coup d'œil. Prenez les meilleures décisions pour votre entreprise.
                  </p>
                  <ul className="space-y-3">
                    {['Tableau de bord financier', 'Suivi de trésorerie', 'Statistiques détaillées'].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="pt-8 flex items-center gap-4">
              {step < 3 ? (
                <button 
                  onClick={handleNext}
                  className="group flex items-center justify-center gap-2 w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-zinc-200 transition-colors"
                >
                  Découvrir la suite 
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <Link 
                  href="/register"
                  className="group flex items-center justify-center gap-2 w-full bg-primary text-white py-4 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]"
                >
                  <Sparkles className="w-5 h-5" />
                  Démarrer mon essai gratuit
                </Link>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4 pt-8 border-t border-white/10 opacity-60">
              <ShieldCheck className="w-5 h-5 text-zinc-400" />
              <p className="text-xs text-zinc-400">Essai gratuit de 14 jours • Sans engagement • Données sécurisées</p>
            </div>

          </div>
        </div>

        {/* Right Column: Interactive UI Demo */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative overflow-hidden bg-zinc-900/10">
           {/* Abstract grid background */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
           
           <div className={cn("w-full max-w-2xl transition-all duration-700 transform", 
              isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"
            )}>
              {step === 1 && <InteractiveInvoice invoiceGenerated={invoiceGenerated} setInvoiceGenerated={setInvoiceGenerated} />}
              {step === 2 && <InteractivePlanning jobAssigned={jobAssigned} setJobAssigned={setJobAssigned} />}
              {step === 3 && <InteractiveDashboard />}
           </div>
        </div>

      </main>

      {/* Sticky Conversion Bar (Mobile & Desktop) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-black/80 backdrop-blur-xl z-50 transform transition-transform duration-500 translate-y-0">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-black flex items-center justify-center text-[10px] font-bold">AL</div>
                <div className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-black flex items-center justify-center text-[10px] font-bold">JB</div>
                <div className="w-8 h-8 rounded-full bg-zinc-600 border-2 border-black flex items-center justify-center text-[10px] font-bold">MR</div>
             </div>
             <p className="text-sm text-zinc-300 font-medium hidden sm:block">Rejoignez plus de <strong className="text-white">500 artisans</strong> qui utilisent Flozy tous les jours.</p>
          </div>
          <Link href="/register" className="w-full sm:w-auto bg-white text-black px-8 py-3 rounded-xl font-bold text-sm text-center hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            Créer mon compte gratuitement
          </Link>
        </div>
      </div>
    </div>
  )
}

// --- INTERACTIVE COMPONENTS ---

function InteractiveInvoice({ invoiceGenerated, setInvoiceGenerated }: any) {
  return (
    <div className="relative group">
      {/* Decorative background glow */}
      <div className={cn("absolute -inset-1 rounded-3xl blur transition-all duration-1000 opacity-50", 
        invoiceGenerated ? "bg-primary" : "bg-white/10 group-hover:bg-primary/30")} />
      
      <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden">
        
        {/* Fake Browser Toolbar */}
        <div className="flex items-center gap-2 mb-8 border-b border-white/5 pb-4">
          <div className="w-3 h-3 rounded-full bg-rose-500" />
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <div className="ml-4 text-xs font-mono text-zinc-600">flozy.app/nouveau-devis</div>
        </div>

        <div className="flex justify-between items-start mb-12">
          <div>
            <div className="w-12 h-12 bg-zinc-800 rounded-lg mb-4 flex items-center justify-center">
              <span className="font-bold text-white">Logo</span>
            </div>
            <h2 className="text-xl font-bold">Votre Entreprise BTP</h2>
          </div>
          <div className="text-right">
            <h3 className="text-primary font-bold tracking-widest uppercase">Devis</h3>
            <p className="text-zinc-500 text-sm">#DEV-2024-184</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between p-4 bg-black/50 rounded-xl border border-white/5">
            <div>
              <p className="font-bold text-sm">Rénovation Électrique Salon</p>
              <p className="text-xs text-zinc-500">Matériel fourni</p>
            </div>
            <p className="font-bold">2 450,00 €</p>
          </div>
          <div className="flex justify-between p-4 bg-black/50 rounded-xl border border-white/5">
            <div>
              <p className="font-bold text-sm">Main d'œuvre</p>
              <p className="text-xs text-zinc-500">3 jours</p>
            </div>
            <p className="font-bold">1 200,00 €</p>
          </div>
        </div>

        <div className="flex justify-between items-end border-t border-white/10 pt-6">
          {!invoiceGenerated ? (
            <button 
              onClick={() => setInvoiceGenerated(true)}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-all animate-pulse"
            >
              <MousePointerClick className="w-4 h-4" />
              Générer et envoyer au client
            </button>
          ) : (
            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-6 py-3 rounded-xl font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              Devis envoyé avec succès !
            </div>
          )}
          <div className="text-right">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Total TTC</p>
            <p className="text-3xl font-black">3 650,00 €</p>
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {!invoiceGenerated && (
        <div className="absolute -bottom-6 right-10 bg-white text-black px-4 py-2 rounded-lg shadow-xl text-xs font-bold animate-bounce z-20 flex items-center gap-2">
          Essayez de cliquer <ArrowRight className="w-3 h-3" />
        </div>
      )}
    </div>
  )
}

function InteractivePlanning({ jobAssigned, setJobAssigned }: any) {
  return (
    <div className="relative group">
       <div className={cn("absolute -inset-1 rounded-3xl blur transition-all duration-1000 opacity-50", 
        jobAssigned ? "bg-blue-600" : "bg-white/10 group-hover:bg-blue-600/30")} />
      
      <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden flex flex-col h-[500px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-500" /> Planning Semaine</h3>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-900 z-10 flex items-center justify-center text-xs font-bold">M</div>
            <div className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-zinc-900 -ml-4 z-0 flex items-center justify-center text-xs font-bold">L</div>
          </div>
        </div>

        <div className="flex-1 flex gap-4">
          {/* Days column */}
          <div className="w-16 flex flex-col gap-4 text-zinc-500 text-xs font-bold uppercase pt-4">
            <div className="h-24 flex items-center justify-center bg-black/40 rounded-xl">LUN</div>
            <div className="h-24 flex items-center justify-center bg-black/40 rounded-xl text-white border border-white/10">MAR</div>
            <div className="h-24 flex items-center justify-center bg-black/40 rounded-xl">MER</div>
          </div>
          
          {/* Timeline */}
          <div className="flex-1 flex flex-col gap-4 relative pt-4">
             {/* Existing Job */}
             <div className="h-24 bg-blue-500/20 border border-blue-500/30 rounded-xl p-3 flex flex-col justify-center w-3/4">
                <p className="font-bold text-sm text-blue-100">Installation Pompe à Chaleur</p>
                <p className="text-xs text-blue-300 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> 08:00 - 17:00</p>
             </div>

             {/* Interactive Job Slot */}
             <div className={cn("h-24 rounded-xl p-3 flex flex-col justify-center transition-all duration-500", 
                jobAssigned ? "bg-emerald-500/20 border border-emerald-500/30 w-full" : "bg-zinc-800/50 border border-dashed border-zinc-600 hover:border-zinc-400 cursor-pointer w-full flex items-center justify-center group/slot"
             )}
              onClick={() => !jobAssigned && setJobAssigned(true)}
             >
                {!jobAssigned ? (
                  <div className="text-zinc-500 text-sm font-bold flex items-center gap-2 group-hover/slot:text-white transition-colors">
                    <MousePointerClick className="w-4 h-4" /> Assigner une urgence
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-sm text-emerald-100 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Dépannage Électrique</p>
                    <p className="text-xs text-emerald-300 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Client notifié par SMS</p>
                  </>
                )}
             </div>

             {/* Existing Job */}
             <div className="h-24 bg-purple-500/20 border border-purple-500/30 rounded-xl p-3 flex flex-col justify-center w-1/2 ml-auto">
                <p className="font-bold text-sm text-purple-100">Visite de chantier</p>
                <p className="text-xs text-purple-300 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> 14:00 - 16:00</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InteractiveDashboard() {
  return (
    <div className="relative group">
       <div className="absolute -inset-1 bg-emerald-600/30 rounded-3xl blur transition-all duration-1000 opacity-50" />
      
      <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
        <h3 className="font-bold text-lg mb-6">Vue d'ensemble ce mois</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/50 p-5 rounded-xl border border-white/5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
              <Euro className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">C.A. Généré</p>
            <p className="text-2xl font-black">28 450 €</p>
            <p className="text-xs text-emerald-500 mt-2 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +14%
            </p>
          </div>
          
          <div className="bg-black/50 p-5 rounded-xl border border-white/5">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mb-3">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Devis signés</p>
            <p className="text-2xl font-black">12</p>
            <p className="text-xs text-zinc-400 mt-2">Sur 15 envoyés (80%)</p>
          </div>
        </div>

        <div className="bg-black/50 p-5 rounded-xl border border-white/5 mt-6">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Objectif Mensuel</p>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-bold">28k €</span>
            <span className="text-zinc-400">30k €</span>
          </div>
          <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 w-[95%] relative">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            </div>
          </div>
          <p className="text-xs text-emerald-500 font-bold mt-3 text-center animate-pulse">Presque atteint ! 🎉</p>
        </div>

      </div>
    </div>
  )
}
