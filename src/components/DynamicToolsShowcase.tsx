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
    description: 'Créez des devis et factures professionnels en quelques clics. Transformez un devis signé en facture automatiquement.',
    features: ['Transformation en 1 clic', 'Paiement en ligne', 'Relances automatiques'],
    mock: (
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
           <div>
             <div className="text-xl font-bold">Devis DEV-2024-08</div>
             <div className="text-sm text-zinc-500">Mme. Dubois • Rénovation</div>
           </div>
           <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase rounded-full">Signé</div>
        </div>
        <div className="space-y-2">
           <div className="flex justify-between text-sm"><span className="text-zinc-400">Pose Carrelage</span><span>1 200 €</span></div>
           <div className="flex justify-between text-sm"><span className="text-zinc-400">Matériaux</span><span>850 €</span></div>
           <div className="flex justify-between font-bold pt-2 border-t border-white/5"><span>Total TTC</span><span className="text-blue-400">2 460 €</span></div>
        </div>
        <button className="w-full mt-4 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm">Générer la facture</button>
      </div>
    )
  },
  {
    id: 'crm',
    name: 'CRM Clients',
    icon: Users,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    activeBorder: 'border-purple-500',
    description: 'Un répertoire client intelligent. Retrouvez instantanément l\'historique des chantiers et les coordonnées de vos contacts.',
    features: ['Historique complet', 'Synchronisation mobile', 'Tags personnalisés'],
    mock: (
      <div className="space-y-4">
         <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center font-bold text-purple-400 text-xl">JD</div>
            <div>
               <div className="font-bold">Jean Dupont</div>
               <div className="text-xs text-zinc-500">12 Rue des Lilas, Chambéry</div>
            </div>
         </div>
         <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-black/50 rounded-lg border border-white/5">
               <div className="text-xs text-zinc-500">Chiffre d'Affaires</div>
               <div className="font-bold text-lg">14 500 €</div>
            </div>
            <div className="p-3 bg-black/50 rounded-lg border border-white/5">
               <div className="text-xs text-zinc-500">Dernier Chantier</div>
               <div className="font-bold text-sm">Il y a 2 mois</div>
            </div>
         </div>
      </div>
    )
  },
  {
    id: 'planning',
    name: 'Planning & Terrain',
    icon: Calendar,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    activeBorder: 'border-amber-500',
    description: 'Pilotez vos interventions de la semaine. Joignez des photos de chantier directement depuis votre smartphone.',
    features: ['Vue Kanban', 'Upload de photos', 'Assignation d\'équipes'],
    mock: (
      <div className="space-y-4 flex flex-col h-full">
         <div className="flex gap-2 mb-2">
            <div className="px-3 py-1 bg-amber-500/20 text-amber-500 text-xs font-bold rounded-lg border border-amber-500/30">En cours</div>
            <div className="px-3 py-1 bg-white/5 text-zinc-400 text-xs font-bold rounded-lg border border-white/10">À venir</div>
         </div>
         <div className="p-4 bg-white/5 rounded-xl border border-white/10 border-l-2 border-l-amber-500">
            <div className="text-xs font-bold text-amber-500 mb-1">Aujourd'hui, 09:00</div>
            <div className="font-bold mb-2">Réparation Fuite Toiture</div>
            <div className="text-xs text-zinc-400 flex items-center gap-2">
               <Users className="w-3 h-3" /> M. Renard
            </div>
         </div>
         <div className="p-4 bg-white/5 rounded-xl border border-white/5 opacity-50">
            <div className="text-xs font-bold text-zinc-500 mb-1">Demain, 14:00</div>
            <div className="font-bold mb-2">Devis Installation Pompe</div>
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
