'use client'

import React from 'react';
import { 
  Target, 
  MessageSquare, 
  Euro, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  Users,
  Clock,
  Smartphone,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

export default function SalesPage() {
  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="border-b border-white/5 py-10 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-black italic">FLOZY <span className="text-primary not-italic text-sm ml-2 uppercase tracking-[0.3em] font-bold">Kit Commercial</span></h1>
              <p className="text-zinc-500 text-sm mt-1 font-medium">Document de prospection terrain v1.0</p>
            </div>
            <Link href="/" className="px-6 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors">
              Retour au site
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-20">
        
        {/* 1. Le Pitch */}
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
            01. L'Accroche
          </div>
          <div className="bg-zinc-900/50 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
               <Target className="w-32 h-32 text-primary" />
             </div>
             <blockquote className="text-2xl md:text-3xl font-bold leading-tight relative z-10">
              "Monsieur [Nom], vous avez passé combien d'heures sur vos devis dimanche dernier ? Et si je vous disais qu'avec Flozy, vos devis sont finis avant même que vous ayez quitté le chantier ?"
             </blockquote>
          </div>
        </section>

        {/* 2. Les Douleurs */}
        <section className="space-y-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
            02. Les Problèmes qu'on résout
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                title: "L'Enfer Administratif", 
                desc: "Fini les soirées à taper des devis sur Excel ou Word après une journée de 10h.", 
                icon: Clock,
                color: "text-orange-400"
              },
              { 
                title: "L'Image de Marque", 
                desc: "Un devis envoyé par SMS en 30s avec votre logo fait la différence face à la concurrence.", 
                icon: Zap,
                color: "text-yellow-400"
              },
              { 
                title: "Le Perte d'Info", 
                desc: "Fini les post-it perdus. Tout est dans votre poche : clients, photos, planning.", 
                icon: Smartphone,
                color: "text-blue-400"
              }
            ].map((item, i) => (
              <div key={i} className="p-8 bg-zinc-900/30 rounded-3xl border border-white/5 hover:border-primary/30 transition-colors group">
                <item.icon className={`w-10 h-10 mb-6 ${item.color}`} />
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Les Tarifs */}
        <section className="space-y-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
            03. Offre Commerciale
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl border border-white/5 bg-zinc-900/20">
               <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Starter</p>
               <p className="text-4xl font-black mb-6">0€</p>
               <ul className="space-y-3 text-sm text-zinc-400">
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 10 Devis / mois</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Gestion Clients</li>
               </ul>
            </div>
            <div className="p-8 rounded-3xl border-2 border-primary bg-primary/5 relative">
               <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase">Populaire</div>
               <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Professionnel</p>
               <p className="text-4xl font-black mb-6">29€<span className="text-sm font-normal text-zinc-500">/mois</span></p>
               <ul className="space-y-3 text-sm text-zinc-300">
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Devis illimités</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Planning Chantier</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Branding complet</li>
               </ul>
            </div>
            <div className="p-8 rounded-3xl border border-white/5 bg-zinc-900/20">
               <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Expert</p>
               <p className="text-4xl font-black mb-6">49€<span className="text-sm font-normal text-zinc-500">/mois</span></p>
               <ul className="space-y-3 text-sm text-zinc-400">
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Multi-utilisateurs</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Gestion de Stock</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Support Prioritaire</li>
               </ul>
            </div>
          </div>
        </section>

        {/* 4. Objections */}
        <section className="space-y-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
            04. Traitement des Objections
          </div>
          <div className="space-y-4">
            {[
              { q: "C'est trop cher", a: "C'est le prix d'un petit dépannage. Si Flozy vous fait gagner 1h par semaine, il est déjà remboursé 10 fois." },
              { q: "J'ai déjà mon habitude sur Excel", a: "Excel ne vous rappelle pas quand un client n'a pas payé. Flozy s'occupe des relances pour vous." },
              { q: "Je ne suis pas doué avec la technologie", a: "Si vous savez envoyer un SMS, vous savez utiliser Flozy. On l'installe ensemble en 2 minutes ?" }
            ].map((obj, i) => (
              <div key={i} className="p-6 bg-zinc-900/50 rounded-2xl border border-white/5 flex gap-6">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center font-black shrink-0">?</div>
                <div>
                   <p className="font-bold text-lg mb-2">"{obj.q}"</p>
                   <p className="text-zinc-400 text-sm leading-relaxed italic">➡️ {obj.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="text-center py-20 bg-primary/10 rounded-[3rem] border border-primary/20">
          <h2 className="text-3xl font-black mb-8 italic">"Le meilleur outil, c'est celui qui est dans votre poche."</h2>
          <Link href="/register" className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xl hover:scale-105 transition-all">
            Créer un compte de test
            <ArrowRight className="w-6 h-6" />
          </Link>
        </section>

      </div>
    </div>
  );
}
