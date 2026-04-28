'use client'

import React, { useState } from 'react'
import { FileText, Users, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react'

const tools = [
  {
    id: 'invoicing',
    name: 'Facturation & Devis',
    icon: FileText,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    activeBorder: 'border-blue-500',
    description: 'Émettez des documents conformes en 30 secondes. Transformez vos devis en factures et suivez les paiements en temps réel.',
    features: ['Modèles personnalisables', 'Signature électronique', 'Paiement Stripe'],
    mock: (
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
           <div>
             <div className="text-xl font-bold">Facture #2024-012</div>
             <div className="text-xs text-zinc-500">SARL Menuiserie • Cuisine</div>
           </div>
           <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase rounded-full">Payée</div>
        </div>
        <div className="space-y-2">
           <div className="flex justify-between text-sm"><span className="text-zinc-400">Main d'œuvre</span><span>1 850 €</span></div>
           <div className="flex justify-between text-sm"><span className="text-zinc-400">Fournitures</span><span>2 400 €</span></div>
           <div className="flex justify-between font-bold pt-2 border-t border-white/5"><span>Total Net</span><span className="text-blue-400">4 250 €</span></div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 py-2 bg-white/5 border border-white/10 text-white rounded-lg font-bold text-xs">Télécharger PDF</button>
          <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-bold text-xs">Relancer client</button>
        </div>
      </div>
    )
  },
  {
    id: 'planning',
    name: 'Planning & Équipes',
    icon: Calendar,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    activeBorder: 'border-amber-500',
    description: 'Une vue d\'ensemble sur vos chantiers. Gérez vos équipes, assignez des tâches et suivez l\'avancement sur le terrain.',
    features: ['Multi-intervenants', 'Géolocalisation', 'Rapports photos'],
    mock: (
      <div className="space-y-4">
         <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Semaine 18</span>
            <div className="flex -space-x-2">
               {[1,2,3].map(i => <div key={i} className={`w-6 h-6 rounded-full border-2 border-black bg-zinc-700 flex items-center justify-center text-[8px]`}>T{i}</div>)}
            </div>
         </div>
         <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 border-l-4 border-l-amber-500">
            <div className="flex justify-between items-start mb-2">
               <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">EN COURS</span>
               <span className="text-[10px] text-zinc-500">09:00 - 17:00</span>
            </div>
            <div className="font-bold text-sm">Installation Solaire</div>
            <div className="text-[10px] text-zinc-400 mt-1">Chantier : Résidence les Pins</div>
         </div>
         <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="aspect-square rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center overflow-hidden">
               <div className="text-[8px] text-zinc-500 text-center px-2 italic">Photo avant intervention</div>
            </div>
            <div className="aspect-square rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center overflow-hidden">
               <div className="text-[8px] text-zinc-500 text-center px-2 italic">Photo après (signée)</div>
            </div>
         </div>
      </div>
    )
  },
  {
    id: 'stock',
    name: 'Gestion de Stock',
    icon: Zap,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    activeBorder: 'border-emerald-500',
    description: 'Ne soyez jamais à court de matériel. Suivez vos stocks, recevez des alertes de niveau bas et gérez vos fournisseurs.',
    features: ['Inventaire QR Code', 'Alertes stock bas', 'Historique sorties'],
    mock: (
      <div className="space-y-4">
         <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
            <div className="flex justify-between items-center mb-4">
               <div className="font-bold text-sm">Câble R2V 3G2.5</div>
               <span className="text-xs font-black text-emerald-500">12 couronnes</span>
            </div>
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 w-[40%]" />
            </div>
            <p className="text-[10px] text-amber-500 mt-2 font-bold flex items-center gap-1 italic">
              ⚠ Seuil d'alerte atteint (Min: 15)
            </p>
         </div>
         <div className="space-y-2">
            {[
               { item: 'Prises RJ45', qty: '45', status: 'OK' },
               { item: 'Tableau 3 rangées', qty: '3', status: 'OK' }
            ].map((s, i) => (
               <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-[10px]">
                  <span>{s.item}</span>
                  <span className="font-bold text-zinc-400">{s.qty}</span>
               </div>
            ))}
         </div>
      </div>
    )
  },
  {
    id: 'branding',
    name: 'Marque Blanche',
    icon: Users,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    activeBorder: 'border-purple-500',
    description: 'Renforcez votre image de marque. Personnalisez chaque aspect de l\'interface et des documents aux couleurs de votre entreprise.',
    features: ['Logo & Couleurs', 'Domaine personnalisé', 'Espace client dédié'],
    mock: (
      <div className="space-y-6 text-center py-4">
         <div className="inline-block p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
               <div className="w-6 h-6 bg-black rotate-45" />
            </div>
            <p className="text-[8px] font-bold mt-2 text-white">VOTRE LOGO</p>
         </div>
         <div className="space-y-2">
            <div className="h-1.5 w-3/4 bg-zinc-800 rounded-full mx-auto" />
            <div className="h-1.5 w-1/2 bg-zinc-800 rounded-full mx-auto" />
         </div>
         <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 border-dashed">
            <p className="text-[10px] text-purple-400 font-bold italic">https://votre-entreprise.flozy.fr</p>
         </div>
         <div className="flex justify-center gap-2">
            {[1,2,3,4].map(i => <div key={i} className="w-4 h-4 rounded-full bg-purple-500/40" />)}
         </div>
      </div>
    )
  }
]

export function DynamicToolsShowcase() {
  const [activeTool, setActiveTool] = useState(tools[0].id)

  const activeData = tools.find(t => t.id === activeTool)!

  return (
    <div className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
         <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Vos outils de tous les jours.</h2>
         <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Découvrez comment Flozy simplifie chaque étape de votre journée de travail, de la prise de contact à l'encaissement.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         {/* Navigation Tabs */}
         <div className="lg:col-span-5 flex flex-col gap-4">
            {tools.map((tool) => (
               <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  className={`text-left p-6 rounded-3xl border transition-all duration-300 ${
                     activeTool === tool.id 
                     ? `bg-white/5 ${tool.activeBorder} shadow-[0_0_30px_rgba(255,255,255,0.05)]` 
                     : 'bg-transparent border-white/5 hover:bg-white/5'
                  }`}
               >
                  <div className="flex items-center gap-4 mb-3">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeTool === tool.id ? tool.bgColor : 'bg-white/5'} ${activeTool === tool.id ? tool.color : 'text-zinc-400'}`}>
                        <tool.icon className="w-6 h-6" />
                     </div>
                     <h3 className={`text-xl font-bold ${activeTool === tool.id ? 'text-white' : 'text-zinc-400'}`}>{tool.name}</h3>
                  </div>
                  {activeTool === tool.id && (
                     <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">{tool.description}</p>
                        <ul className="space-y-2">
                           {tool.features.map((f, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                                 <CheckCircle2 className={`w-4 h-4 ${tool.color}`} /> {f}
                              </li>
                           ))}
                        </ul>
                     </div>
                  )}
               </button>
            ))}
         </div>

         {/* Visual Mock Showcase */}
         <div className="lg:col-span-7">
            <div className="relative w-full h-full min-h-[400px] rounded-[2.5rem] bg-zinc-900 border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center p-8">
               {/* Ambient background glow based on active tool */}
               <div className={`absolute inset-0 opacity-20 blur-3xl transition-colors duration-1000 ${activeData.bgColor.replace('/10', '')}`} />
               
               {/* Mock Container */}
               <div className="relative z-10 w-full max-w-md bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl transition-all duration-500">
                  <div className="absolute top-4 right-4 flex gap-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                     <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                     <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  </div>
                  <div className="mt-6" key={activeData.id}>
                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {activeData.mock}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
