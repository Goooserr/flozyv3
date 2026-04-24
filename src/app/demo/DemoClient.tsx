'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Sparkles, MousePointerClick, Clock, Euro, TrendingUp, ShieldCheck, FileText, Calendar, Box, Users, Zap, Star, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, label: 'Devis', color: 'from-indigo-500 to-purple-500' },
  { id: 2, label: 'Planning', color: 'from-blue-500 to-cyan-400' },
  { id: 3, label: 'Stock', color: 'from-emerald-500 to-teal-400' },
  { id: 4, label: 'Offre', color: 'from-violet-500 to-fuchsia-500' },
]

export default function DemoClient() {
  const [step, setStep] = useState(1)
  const [timeSaved, setTimeSaved] = useState(0)
  const [signCount, setSignCount] = useState(347)

  useEffect(() => {
    const interval = setInterval(() => {
      setSignCount(n => n + Math.floor(Math.random() * 2))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  function nextStep() {
    if (step < 4) setStep(s => s + 1)
  }

  function addTime(mins: number) {
    setTimeSaved(t => t + mins)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-primary/30">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-sm" />
          </div>
          <span className="font-bold text-xl italic tracking-tight">Flozy</span>
          <span className="text-[9px] bg-primary/20 border border-primary/30 text-primary px-2 py-0.5 rounded-full uppercase font-black tracking-widest">Démo Live</span>
        </Link>
        <div className="flex items-center gap-4">
          {/* Time saved counter */}
          {timeSaved > 0 && (
            <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full animate-in fade-in">
              <Timer className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-400 text-xs font-black">+{timeSaved} min économisées</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-zinc-500 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono">{signCount} artisans actifs</span>
          </div>
          <Link href="/register" className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            Démarrer gratuit
          </Link>
        </div>
      </header>

      {/* Progress */}
      <div className="flex border-b border-white/5 bg-zinc-950/50">
        {STEPS.map((s) => (
          <button
            key={s.id}
            onClick={() => setStep(s.id)}
            className={cn(
              "flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all relative",
              step === s.id ? "text-white" : step > s.id ? "text-zinc-400" : "text-zinc-600"
            )}
          >
            {step > s.id && <CheckCircle2 className="w-3 h-3 inline mr-1 text-emerald-500" />}
            {s.label}
            {step === s.id && (
              <div className={cn("absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r", s.color)} />
            )}
          </button>
        ))}
      </div>

      {/* Main */}
      <main className="flex-1 grid lg:grid-cols-2 max-w-7xl mx-auto w-full">
        {/* Left: Story */}
        <div className="p-8 md:p-16 flex flex-col justify-center border-r border-white/5">
          {step === 1 && <StepQuote onAction={() => { addTime(18); nextStep() }} />}
          {step === 2 && <StepPlanning onAction={() => { addTime(25); nextStep() }} />}
          {step === 3 && <StepStock onAction={() => { addTime(12); nextStep() }} />}
          {step === 4 && <StepConvert timeSaved={timeSaved} />}
        </div>

        {/* Right: Interactive UI */}
        <div className="p-8 md:p-16 flex items-center justify-center bg-zinc-950/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="w-full max-w-lg relative z-10">
            {step === 1 && <UIQuote />}
            {step === 2 && <UIPlanning />}
            {step === 3 && <UIStock />}
            {step === 4 && <UIOffer />}
          </div>
        </div>
      </main>

      {/* Bottom CTA */}
      <div className="sticky bottom-0 border-t border-white/5 bg-black/80 backdrop-blur-xl p-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['JD','ML','PB','AR'].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-black flex items-center justify-center text-[9px] font-black">{i}</div>
              ))}
            </div>
            <p className="text-sm text-zinc-400 hidden sm:block"><strong className="text-white">500+ artisans</strong> gagnent du temps avec Flozy.</p>
          </div>
          <Link href="/register" className="bg-white text-black px-8 py-3 rounded-xl font-black text-sm hover:bg-zinc-200 transition shadow-[0_0_30px_rgba(255,255,255,0.15)] whitespace-nowrap">
            Créer mon compte — Gratuit
          </Link>
        </div>
      </div>
    </div>
  )
}

// ---- STEP 1: DEVIS ----
function StepQuote({ onAction }: { onAction: () => void }) {
  const [done, setDone] = useState(false)
  function handle() { setDone(true); setTimeout(onAction, 1200) }
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-widest">
        <FileText className="w-3 h-3" /> Étape 1 sur 3 — Facturation
      </div>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
        Un devis pro en <span className="text-primary italic">30 secondes</span>.
      </h1>
      <p className="text-zinc-400 text-lg leading-relaxed">
        Sélectionnez vos prestations, ajoutez votre client, cliquez "Générer". Flozy calcule la TVA, met votre logo et l'envoie par email.
      </p>
      <ul className="space-y-3">
        {['Calcul TVA automatique', 'Signature électronique incluse', 'PDF professionnel en 1 clic'].map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-zinc-300">{f}</span>
          </li>
        ))}
      </ul>
      {!done ? (
        <button onClick={handle} className="group flex items-center gap-2 bg-white text-black px-6 py-4 rounded-2xl font-black hover:scale-105 transition-all w-full justify-center shadow-[0_0_30px_rgba(255,255,255,0.15)]">
          <MousePointerClick className="w-5 h-5" /> Générer le devis maintenant
        </button>
      ) : (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-4 animate-in zoom-in duration-300">
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          <div>
            <p className="font-black text-emerald-400">Devis envoyé ! +18 min économisées</p>
            <p className="text-xs text-zinc-400">Passage au planning...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- STEP 2: PLANNING ----
function StepPlanning({ onAction }: { onAction: () => void }) {
  const [assigned, setAssigned] = useState(false)
  function handle() { setAssigned(true); setTimeout(onAction, 1200) }
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
        <Calendar className="w-3 h-3" /> Étape 2 sur 3 — Planning
      </div>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
        Zéro oubli, <span className="text-blue-400 italic">zéro retard</span>.
      </h1>
      <p className="text-zinc-400 text-lg leading-relaxed">
        Planifiez vos chantiers, assignez vos équipes. Vos clients reçoivent une confirmation automatique. Vous pilotez tout depuis votre téléphone.
      </p>
      <ul className="space-y-3">
        {['Vue semaine & mois', 'Notifications automatiques client', 'Photos de chantier intégrées'].map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="text-zinc-300">{f}</span>
          </li>
        ))}
      </ul>
      {!assigned ? (
        <button onClick={handle} className="group flex items-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black hover:scale-105 transition-all w-full justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
          <MousePointerClick className="w-5 h-5" /> Planifier une intervention
        </button>
      ) : (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-4 animate-in zoom-in duration-300">
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          <div>
            <p className="font-black text-emerald-400">Chantier planifié ! +25 min économisées</p>
            <p className="text-xs text-zinc-400">Voyons votre stock...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- STEP 3: STOCK ----
function StepStock({ onAction }: { onAction: () => void }) {
  const [added, setAdded] = useState(false)
  function handle() { setAdded(true); setTimeout(onAction, 1200) }
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
        <Box className="w-3 h-3" /> Étape 3 sur 3 — Catalogue
      </div>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
        Votre catalogue, <span className="text-emerald-400 italic">toujours à jour</span>.
      </h1>
      <p className="text-zinc-400 text-lg leading-relaxed">
        Saisissez vos matériaux une seule fois avec leur prix de vente. Ils apparaissent automatiquement lors de la création de vos devis.
      </p>
      <ul className="space-y-3">
        {['Prix achat & vente par article', 'Alertes rupture de stock', 'Intégration directe dans les devis'].map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-zinc-300">{f}</span>
          </li>
        ))}
      </ul>
      {!added ? (
        <button onClick={handle} className="group flex items-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black hover:scale-105 transition-all w-full justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          <MousePointerClick className="w-5 h-5" /> Ajouter un article au catalogue
        </button>
      ) : (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-4 animate-in zoom-in duration-300">
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          <div>
            <p className="font-black text-emerald-400">Article ajouté ! +12 min économisées</p>
            <p className="text-xs text-zinc-400">Découvrez votre offre...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- STEP 4: CONVERT ----
function StepConvert({ timeSaved }: { timeSaved: number }) {
  const monthlyGain = Math.round((timeSaved / 60) * 4.3 * 65)
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest">
        <Sparkles className="w-3 h-3 animate-pulse" /> Votre bilan
      </div>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
        Vous venez d'économiser <span className="text-amber-400 italic">{timeSaved} minutes</span>.
      </h1>
      <p className="text-zinc-400 text-lg leading-relaxed">
        En une semaine d'utilisation, Flozy vous fait gagner en moyenne <strong className="text-white">3h par semaine</strong>. C'est du temps facturable que vous ne gagniez pas avant.
      </p>
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-6 space-y-3">
        <p className="text-xs font-black uppercase tracking-widest text-amber-400 mb-4">Votre gain mensuel estimé</p>
        <div className="flex items-end gap-2">
          <span className="text-5xl font-black text-white">+{monthlyGain > 0 ? monthlyGain.toLocaleString() : '1 200'} €</span>
          <span className="text-zinc-400 text-sm mb-2">/ mois</span>
        </div>
        <p className="text-xs text-zinc-500">Basé sur 65€/h · 4,3 semaines · {timeSaved}min économisées aujourd'hui</p>
      </div>
      <div className="space-y-3">
        <Link href="/register" className="flex items-center justify-center gap-2 w-full bg-white text-black py-4 rounded-2xl font-black text-lg hover:scale-[1.02] transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]">
          <Sparkles className="w-5 h-5" /> Démarrer mon essai gratuit — 14 jours
        </Link>
        <p className="text-center text-xs text-zinc-600">Sans CB · Sans engagement · Données sécurisées en France</p>
      </div>
    </div>
  )
}

// ---- UI PANELS ----
function UIQuote() {
  const [items, setItems] = useState([
    { label: 'Tableau électrique', qty: 1, price: 850 },
    { label: 'Main d\'œuvre (8h)', qty: 8, price: 65 },
  ])
  const total = items.reduce((a, i) => a + i.qty * i.price, 0)
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/40">
        <div className="w-3 h-3 rounded-full bg-rose-500/70" /><div className="w-3 h-3 rounded-full bg-amber-500/70" /><div className="w-3 h-3 rounded-full bg-emerald-500/70" />
        <span className="text-[9px] font-mono text-zinc-500 ml-2">flozy.app/devis/nouveau</span>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div><p className="font-black text-lg">Électricité Pro</p><p className="text-xs text-zinc-500">DEV-2025-047</p></div>
          <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-lg">En attente</span>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
              <div><p className="text-sm font-bold">{item.label}</p><p className="text-[10px] text-zinc-500">x{item.qty}</p></div>
              <p className="font-black text-primary">{(item.qty * item.price).toLocaleString()} €</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-white/10">
          <div className="text-xs text-zinc-500">TVA 20% : {(total * 0.2).toFixed(0)} €</div>
          <div className="text-right">
            <p className="text-[9px] text-zinc-500 uppercase font-bold">Total TTC</p>
            <p className="text-2xl font-black">{(total * 1.2).toLocaleString()} €</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function UIPlanning() {
  const jobs = [
    { title: 'Tableau électrique Durand', time: '08:00 - 12:00', color: 'bg-blue-500/20 border-blue-500/30 text-blue-100', width: 'w-3/4' },
    { title: '🔴 URGENT — Dépannage Leroy', time: '14:00 - 17:00', color: 'bg-rose-500/20 border-rose-500/30 text-rose-100', width: 'w-full' },
    { title: 'Visite chantier Martin', time: '09:00 - 10:30', color: 'bg-purple-500/20 border-purple-500/30 text-purple-100', width: 'w-1/2 ml-auto' },
  ]
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <p className="font-black flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> Semaine du 24 Avr.</p>
        <span className="text-[9px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-lg uppercase">3 chantiers</span>
      </div>
      <div className="p-4 space-y-3">
        {jobs.map((j, i) => (
          <div key={i} className={cn("p-3 rounded-xl border", j.color, j.width)}>
            <p className="text-sm font-bold">{j.title}</p>
            <p className="text-[10px] mt-1 flex items-center gap-1 opacity-70"><Clock className="w-3 h-3" />{j.time}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function UIStock() {
  const items = [
    { name: 'Câble RO2V 3G2.5', qty: 145, unit: 'm', sell: 2.5, alert: false },
    { name: 'Disjoncteur 16A Legrand', qty: 4, unit: 'u', sell: 18, alert: true },
    { name: 'Gaine ICTA Ø20', qty: 80, unit: 'm', sell: 1.2, alert: false },
  ]
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <p className="font-black flex items-center gap-2"><Box className="w-4 h-4 text-emerald-500" /> Catalogue Stock</p>
      </div>
      <div className="divide-y divide-white/5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-6 py-3">
            <div>
              <p className="text-sm font-bold">{item.name}</p>
              <p className="text-[10px] text-zinc-500">{item.qty} {item.unit} en stock</p>
            </div>
            <div className="text-right flex items-center gap-3">
              {item.alert && <span className="text-[8px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full">⚠ Stock bas</span>}
              <p className="font-black text-emerald-400">{item.sell} €</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function UIOffer() {
  return (
    <div className="space-y-4">
      {[
        { name: 'Starter', price: 'Gratuit', features: ['5 devis/mois', 'Facturation basique'], cta: 'Continuer gratuitement', highlight: false },
        { name: 'Pro', price: '29€/mois', features: ['Devis illimités', 'Planning + Photos', 'Catalogue stock', 'Marque blanche'], cta: 'Démarrer — 14j gratuits', highlight: true },
        { name: 'Expert', price: '59€/mois', features: ['Tout Pro +', 'Multi-utilisateurs', 'Statistiques avancées', 'Support prioritaire'], cta: 'Contacter', highlight: false },
      ].map((plan) => (
        <div key={plan.name} className={cn(
          "rounded-2xl border p-6 relative transition-all duration-500", 
          plan.highlight 
            ? "border-primary/50 bg-zinc-900/80 shadow-[0_0_40px_rgba(var(--primary-rgb,255,255,255),0.1)] ring-1 ring-primary/20 scale-[1.02]" 
            : "border-white/5 bg-zinc-900/40 opacity-80 hover:opacity-100"
        )}>
          {plan.highlight && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full text-[10px] font-black uppercase tracking-widest text-primary-foreground whitespace-nowrap shadow-lg shadow-primary/20">
              ⭐ Le plus populaire
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <p className={cn("font-black text-lg", plan.highlight ? "text-white" : "text-zinc-400")}>{plan.name}</p>
            <p className={cn("font-black text-xl", plan.highlight ? "text-primary" : "text-white")}>{plan.price}</p>
          </div>
          <div className="space-y-3 mb-6">
            {plan.features.map((f, i) => (
              <p key={i} className="text-xs text-zinc-400 flex items-center gap-2">
                <CheckCircle2 className={cn("w-3.5 h-3.5 shrink-0", plan.highlight ? "text-primary" : "text-emerald-500")} />
                {f}
              </p>
            ))}
          </div>
          <Link 
            href="/register" 
            className={cn(
              "block w-full py-3 rounded-xl font-black text-sm text-center transition-all", 
              plan.highlight 
                ? "bg-primary text-primary-foreground hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20" 
                : "bg-white/5 text-zinc-300 hover:bg-white/10"
            )}
          >
            {plan.cta}
          </Link>
        </div>
      ))}
    </div>
  )
}
