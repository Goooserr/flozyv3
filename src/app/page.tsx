'use client'

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  LayoutGrid, 
  ShieldCheck, 
  Zap,
  Globe,
  Palette,
  Settings2,
  ChevronRight,
  X
} from 'lucide-react';
import { DynamicToolsShowcase } from '@/components/DynamicToolsShowcase';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl h-16 z-[9999] flex items-center justify-between px-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <Link href="/" className="flex items-center gap-2.5 group relative z-[10000]">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center transition-transform group-hover:scale-105 duration-500 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <div className="w-4 h-4 bg-black rounded-[4px]" />
          </div>
          <span className="font-bold text-xl tracking-tight italic bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Flozy</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 relative z-[10000]">
          <a href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-all hover:translate-y-[-1px]">Fonctionnalités</a>
          <Link href="/demo" className="text-sm font-medium text-zinc-400 hover:text-white transition-all hover:translate-y-[-1px]">Démo</Link>
          <a href="#pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-all hover:translate-y-[-1px]">Tarifs</a>
        </div>

        <div className="flex items-center gap-4 relative z-[10000]">
          <Link href="/login" className="hidden sm:block text-sm font-bold text-zinc-400 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/5">
            Connexion
          </Link>
          <Link href="/register" className="bg-white text-black px-6 py-2.5 rounded-xl text-sm font-black hover:bg-zinc-200 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-[0.98]">
            Démarrer Flozy
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        {/* Dynamic Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-10000 pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-500/10 blur-[100px] rounded-t-[100%] pointer-events-none" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-bold tracking-wide mb-8 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-1000 hover:border-white/20 transition-colors cursor-default">
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            La nouvelle norme pour les artisans
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-bold tracking-tighter mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 leading-[1.1]">
            <span className="bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent">
              Gérez votre activité
            </span>
            <br />
            <span className="bg-gradient-to-r from-zinc-500 via-zinc-400 to-zinc-600 bg-clip-text text-transparent">
              avec une précision chirurgicale.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 font-medium leading-relaxed">
            L'outil de gestion qui s'adapte à votre métier, pas l'inverse. 
            Devis, facturation et suivi client dans une interface d'exception conçue pour la vitesse.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500 w-full sm:w-auto">
            <Link href="/register" className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-zinc-200 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Commencer maintenant
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/demo" className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Démo Interactive
            </Link>
          </div>

          {/* Dashboard Preview - Vraie vitrine des outils */}
          <div className="mt-24 relative w-full max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-700">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 h-40 bottom-0 top-auto" style={{background: 'linear-gradient(to top, black 0%, transparent 100%)'}} />
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-purple-500/30 to-blue-500/30 blur-2xl opacity-50 rounded-3xl" />
            
            <div className="rounded-2xl border border-white/10 bg-zinc-900/90 backdrop-blur-xl shadow-2xl relative z-10 overflow-hidden">
              {/* Window Chrome */}
              <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-zinc-900/50">
                <div className="w-3 h-3 rounded-full bg-rose-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                <div className="flex-1 mx-8 h-5 rounded-md bg-white/5 border border-white/5 flex items-center px-3">
                  <span className="text-[9px] text-zinc-500 font-mono">app.flozy.fr/dashboard</span>
                </div>
              </div>

              {/* App Layout */}
              <div className="flex" style={{minHeight: '340px'}}>
                {/* Sidebar */}
                <div className="w-44 border-r border-white/5 bg-black/40 p-3 flex flex-col gap-1 shrink-0">
                  <div className="flex items-center gap-2 px-2 py-2 mb-2">
                    <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center"><div className="w-3 h-3 bg-black rounded-[2px]" /></div>
                    <span className="text-xs font-bold text-white">Flozy</span>
                  </div>
                  {[
                    { label: 'Dashboard', active: true, color: 'bg-white/10' },
                    { label: 'Planning', active: false, color: '' },
                    { label: 'Factures', active: false, color: '' },
                    { label: 'Clients', active: false, color: '' },
                    { label: 'Stock', active: false, color: '' },
                  ].map((item) => (
                    <div key={item.label} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${item.active ? 'bg-white/10 text-white' : 'text-zinc-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-primary' : 'bg-zinc-700'}`} />
                      <span className="text-[10px] font-bold">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Main Content */}
                <div className="flex-1 p-4 bg-zinc-950/50 overflow-hidden">
                  {/* KPI Row */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'CA ce mois', value: '12 480 €', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                      { label: 'Devis en attente', value: '4', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                      { label: 'Clients actifs', value: '23', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                    ].map((kpi) => (
                      <div key={kpi.label} className={`rounded-xl border p-3 ${kpi.bg}`}>
                        <p className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest mb-1">{kpi.label}</p>
                        <p className={`text-lg font-black ${kpi.color}`}>{kpi.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-5 gap-3">
                    {/* Derniers clients */}
                    <div className="col-span-2 bg-zinc-900/60 rounded-xl border border-white/5 p-3">
                      <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-2">Clients récents</p>
                      {[
                        { name: 'M. Ruffier', tag: 'VIP' },
                        { name: 'Batiment SAS', tag: 'Pro' },
                        { name: 'Mme Laurent', tag: '' },
                      ].map((c) => (
                        <div key={c.name} className="flex items-center justify-between py-1.5 border-b border-white/3 last:border-0">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-md bg-primary/20 text-primary text-[7px] font-black flex items-center justify-center uppercase">{c.name[2]}</div>
                            <span className="text-[9px] font-medium text-zinc-300">{c.name}</span>
                          </div>
                          {c.tag && <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-primary/10 text-primary">{c.tag}</span>}
                        </div>
                      ))}
                    </div>

                    {/* Dernières factures */}
                    <div className="col-span-3 bg-zinc-900/60 rounded-xl border border-white/5 p-3">
                      <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-2">Factures & Devis</p>
                      {[
                        { num: 'FAC-2024-042', amount: '1 850 €', status: 'Payée', statusColor: 'text-emerald-400 bg-emerald-500/10' },
                        { num: 'DEV-2024-031', amount: '3 200 €', status: 'En attente', statusColor: 'text-amber-400 bg-amber-500/10' },
                        { num: 'FAC-2024-039', amount: '650 €', status: 'Payée', statusColor: 'text-emerald-400 bg-emerald-500/10' },
                      ].map((inv) => (
                        <div key={inv.num} className="flex items-center justify-between py-1.5 border-b border-white/3 last:border-0">
                          <span className="text-[9px] font-mono text-zinc-400">{inv.num}</span>
                          <span className="text-[9px] font-black text-white">{inv.amount}</span>
                          <span className={`text-[7px] font-black px-1.5 py-0.5 rounded ${inv.statusColor}`}>{inv.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Planning strip */}
                  <div className="mt-3 bg-zinc-900/60 rounded-xl border border-purple-500/20 p-3 flex items-center gap-4">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[8px] text-purple-400 font-black uppercase tracking-widest">Prochain Chantier</p>
                      <p className="text-[10px] font-bold text-white">Installation tableau élec. — M. Ruffier · Demain 09h00</p>
                    </div>
                    <div className="px-2 py-1 bg-purple-500 rounded-lg">
                      <span className="text-[7px] font-black text-white uppercase">Planifié</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Tools Showcase */}
      <section className="bg-black relative z-20 border-t border-white/5">
        <DynamicToolsShowcase />
      </section>

      {/* Features - Bento Grid */}
      <section id="features" className="py-32 bg-zinc-950 relative overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="mb-20 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
                <Sparkles className="w-3 h-3" /> L'écosystème Flozy
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">Pensé pour le sur-mesure.</h2>
              <p className="text-zinc-400 text-lg">Pourquoi s'adapter à un logiciel rigide ? Flozy devient VOTRE logiciel grâce à nos outils de personnalisation poussés.</p>
            </div>
            <Link href="/demo" className="hidden md:flex items-center gap-2 text-sm font-bold text-white hover:text-primary transition-colors group">
              Voir la galerie de modules <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            {/* Custom Fields */}
            <div className="md:col-span-4 bg-zinc-900/40 border border-white/5 p-10 rounded-[2.5rem] relative overflow-hidden group hover:bg-zinc-900/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/3 group-hover:bg-primary/30 transition-all duration-700" />
              
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 border border-primary/20 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
                <Settings2 className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Champs Personnalisés</h3>
              <p className="text-zinc-400 text-lg leading-relaxed max-w-md relative z-10">
                Ajoutez vos propres données métier (Digicodes, types de chaudières, codes chantiers). 
                La base de données s'adapte à votre vocabulaire en un clic.
              </p>
              <div className="mt-12 flex gap-3 relative z-10">
                <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wide backdrop-blur-md">Flexible</span>
                <span className="px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-[10px] font-bold uppercase tracking-wide backdrop-blur-md">No-Code</span>
              </div>
            </div>

            {/* Modularity */}
            <div className="md:col-span-2 bg-zinc-900/40 border border-white/5 p-10 rounded-[2.5rem] group hover:bg-zinc-900/60 transition-all duration-500 hover:-translate-y-1 hover:border-white/10">
              <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-transform duration-500">
                <LayoutGrid className="w-7 h-7 text-zinc-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Architecture Modulaire</h3>
              <p className="text-zinc-400 leading-relaxed">
                Activez uniquement ce dont vous avez besoin : Facturation, Stock, ou Planning.
              </p>
            </div>

            {/* White Labeling */}
            <div className="md:col-span-3 bg-zinc-900/40 border border-white/5 p-10 rounded-[2.5rem] group hover:bg-emerald-500/5 transition-all duration-500 hover:-translate-y-1 hover:border-emerald-500/30 overflow-hidden relative">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Palette className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Marque Blanche</h3>
              <p className="text-zinc-400 leading-relaxed relative z-10">
                Couleurs de marque, logo, typographies. Flozy s'efface pour laisser place à VOTRE identité d'entreprise.
              </p>
            </div>

            {/* Stock / New Tool */}
            <div className="md:col-span-3 bg-zinc-900/40 border border-white/5 p-10 rounded-[2.5rem] group hover:bg-blue-500/5 transition-all duration-500 hover:-translate-y-1 hover:border-blue-500/30 overflow-hidden relative">
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Zap className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Stock & Terrain Connectés</h3>
              <p className="text-zinc-400 leading-relaxed relative z-10">
                Suivez vos matériaux et vos interventions avec une réactivité hors-norme. Mode "Anti-Coupure" inclus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-full max-w-lg h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Un prix juste, <br/>
              <span className="bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_8s_linear_infinite]">pour une croissance infinie.</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Choisissez le plan qui correspond à l'étape actuelle de votre entreprise. Sans engagement, évoluez à votre rythme.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
            {/* Starter */}
            <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] flex flex-col hover:border-white/20 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
              <div className="mb-8">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                  <div className="w-4 h-4 rounded-full bg-zinc-500" />
                </div>
                <h4 className="text-zinc-400 font-bold uppercase tracking-widest text-xs mb-2">Starter</h4>
                <div className="flex items-end gap-1">
                  <p className="text-4xl font-bold">Gratuit</p>
                </div>
                <p className="text-zinc-500 text-sm mt-3">Pour débuter sereinement</p>
              </div>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
              <ul className="space-y-5 mb-10 flex-1">
                <li className="flex items-start gap-4 text-sm text-zinc-300"><CheckCircle2 className="w-5 h-5 text-primary shrink-0 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" /> <span className="leading-tight">Jusqu'à 5 clients</span></li>
                <li className="flex items-start gap-4 text-sm text-zinc-300"><CheckCircle2 className="w-5 h-5 text-primary shrink-0 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" /> <span className="leading-tight">Devis & Factures</span></li>
                <li className="flex items-start gap-4 text-sm text-zinc-600"><X className="w-5 h-5 text-zinc-800 shrink-0" /> <span className="leading-tight">Branding personnalisé</span></li>
                <li className="flex items-start gap-4 text-sm text-zinc-600"><X className="w-5 h-5 text-zinc-800 shrink-0" /> <span className="leading-tight">Gestion de stock</span></li>
              </ul>
              <Link href="/register?plan=starter" className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-center font-bold hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all relative z-20">
                Commencer
              </Link>
            </div>

            {/* Pro - The Premium Card */}
            <div className="relative group scale-105 z-10">
              {/* Animated glowing border effect */}
              <div className="absolute -inset-[2px] bg-gradient-to-r from-primary via-purple-500 to-emerald-500 rounded-[2.5rem] opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
              
              <div className="relative bg-zinc-950 p-8 rounded-[2.5rem] flex flex-col shadow-2xl h-full border border-white/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-500 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] whitespace-nowrap z-20">
                  Recommandé
                </div>
                
                <div className="mb-8 mt-4 relative z-10">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="text-primary font-bold uppercase tracking-widest text-xs mb-2">Professionnel</h4>
                  <div className="flex items-end gap-1">
                    <p className="text-5xl font-bold bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">29€</p>
                    <span className="text-lg text-zinc-500 mb-1">/mois</span>
                  </div>
                  <p className="text-zinc-400 text-sm mt-3">Pour les artisans établis</p>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-8" />
                <ul className="space-y-5 mb-10 flex-1 relative z-10">
                  <li className="flex items-start gap-4 text-sm font-medium text-white"><CheckCircle2 className="w-5 h-5 text-primary shrink-0 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" /> <span className="leading-tight">Clients illimités</span></li>
                  <li className="flex items-start gap-4 text-sm font-medium text-white"><CheckCircle2 className="w-5 h-5 text-primary shrink-0 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" /> <span className="leading-tight">Branding complet (Logo & Couleurs)</span></li>
                  <li className="flex items-start gap-4 text-sm font-medium text-white"><CheckCircle2 className="w-5 h-5 text-primary shrink-0 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" /> <span className="leading-tight break-words">Champs personnalisés illimités</span></li>
                  <li className="flex items-start gap-4 text-sm font-medium text-white"><CheckCircle2 className="w-5 h-5 text-primary shrink-0 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" /> <span className="leading-tight">Support prioritaire inclus</span></li>
                </ul>
                <Link href="/register?plan=pro" className="w-full py-4 rounded-2xl bg-white text-black text-center font-bold hover:scale-[1.02] shadow-[0_0_30_rgba(255,255,255,0.2)] transition-all relative z-20">
                  Passer en Pro
                </Link>
              </div>
            </div>

            {/* Expert */}
            <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] flex flex-col hover:border-white/20 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
              <div className="mb-8">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                  <div className="w-4 h-4 rounded-full bg-blue-500" />
                </div>
                <h4 className="text-zinc-400 font-bold uppercase tracking-widest text-xs mb-2">Expert</h4>
                <div className="flex items-end gap-1">
                  <p className="text-4xl font-bold">49€</p>
                  <span className="text-lg text-zinc-500 mb-1">/mois</span>
                </div>
                <p className="text-zinc-500 text-sm mt-3">Le contrôle total sur le terrain</p>
              </div>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
              <ul className="space-y-5 mb-10 flex-1">
                <li className="flex items-start gap-4 text-sm text-zinc-300"><CheckCircle2 className="w-5 h-5 text-primary shrink-0 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" /> <span className="leading-tight">Tout le plan Pro inclus</span></li>
                <li className="flex items-start gap-4 text-sm text-zinc-300"><CheckCircle2 className="w-5 h-5 text-primary shrink-0 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" /> <span className="leading-tight">Gestion de Stock avancée</span></li>
                <li className="flex items-start gap-4 text-sm text-zinc-300"><CheckCircle2 className="w-5 h-5 text-primary shrink-0 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" /> <span className="leading-tight">Planning & Interventions</span></li>
                <li className="flex items-start gap-4 text-sm text-zinc-300"><CheckCircle2 className="w-5 h-5 text-primary shrink-0 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" /> <span className="leading-tight">Multi-utilisateurs (Équipes)</span></li>
              </ul>
              <Link href="/register?plan=expert" className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-center font-bold hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all relative z-20">
                Contacter l'équipe
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <p className="text-4xl font-bold mb-1">+500</p>
            <p className="text-sm text-zinc-500 uppercase tracking-widest">Artisans</p>
          </div>
          <div>
            <p className="text-4xl font-bold mb-1">99.9%</p>
            <p className="text-sm text-zinc-500 uppercase tracking-widest">Disponibilité</p>
          </div>
          <div>
            <p className="text-4xl font-bold mb-1">2M€</p>
            <p className="text-sm text-zinc-500 uppercase tracking-widest">Facturés/mois</p>
          </div>
          <div>
            <p className="text-4xl font-bold mb-1">15min</p>
            <p className="text-sm text-zinc-500 uppercase tracking-widest">Setup moyen</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-primary/5 blur-[100px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">Prêt à transformer votre gestion ?</h2>
          <p className="text-zinc-400 text-lg mb-12 max-w-2xl mx-auto">Rejoignez les artisans qui ont choisi l'excellence opérationnelle. Prenez le contrôle de votre temps et de vos revenus.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-20">
            <Link href="/register" className="group relative px-10 py-5 bg-white text-black rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] overflow-hidden">
              <span className="relative z-10">Démarrer avec Flozy</span>
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <p className="text-zinc-500 text-sm font-medium">Installation en moins de 2 minutes.</p>
          </div>
        </div>
      </section>

      {/* Modern Premium Footer */}
      <footer className="pt-24 pb-12 border-t border-white/5 bg-black relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[200px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-20">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                  <div className="w-4 h-4 bg-black rounded-sm" />
                </div>
                <span className="font-bold text-2xl tracking-tight italic">Flozy</span>
              </div>
              <p className="text-zinc-400 mb-8 max-w-sm leading-relaxed">
                Le système d'exploitation nouvelle génération pour les artisans modernes. Devis, factures, et suivi de chantiers centralisés.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-all cursor-pointer">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-all cursor-pointer">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path></svg>
                </div>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="text-white font-bold mb-6">Produit</h4>
              <ul className="space-y-4 text-zinc-400 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Ressources</h4>
              <ul className="space-y-4 text-zinc-400 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog Artisan</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Tutoriels</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Légal</h4>
              <ul className="space-y-4 text-zinc-400 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Mentions Légales</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">CGV</a></li>
                <Link href="/admin-login" className="block text-zinc-800 hover:text-zinc-600 transition-colors mt-8">. Admin</Link>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-zinc-500 text-sm">
              © {new Date().getFullYear()} Flozy Inc. Tous droits réservés.
            </p>
            <div className="flex items-center gap-2 text-zinc-600 text-sm">
              <span>Conçu pour l'excellence opérationnelle</span>
              <Sparkles className="w-4 h-4 text-primary/50" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

