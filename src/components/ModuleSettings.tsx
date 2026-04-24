'use client'

import React from 'react'
import { FileText, Users, Box, Calendar, CheckCircle2 } from 'lucide-react'
import { useTheme } from './DynamicThemeProvider'
import { createClient } from '@/lib/supabase'

const AVAILABLE_MODULES = [
  { id: 'clients', name: 'Gestion Clients', description: 'Répertoire, historique et contacts', icon: Users, plan: 'Starter' },
  { id: 'documents', name: 'Facturation & Devis', description: 'Création de documents pro', icon: FileText, plan: 'Starter' },
  { id: 'planning', name: 'Planning & RDV', description: 'Calendrier des interventions sur le terrain', icon: Calendar, plan: 'Expert' },
  { id: 'stock', name: 'Gestion de Stock', description: 'Suivi des matériaux et fournitures', icon: Box, plan: 'Expert' },
]

export function ModuleSettings() {
  const { enabledModules, setEnabledModules } = useTheme()
  const supabase = createClient()

  async function toggleModule(moduleId: string) {
    const newModules = enabledModules.includes(moduleId)
      ? enabledModules.filter(id => id !== moduleId)
      : [...enabledModules, moduleId]
    
    // Update local state
    setEnabledModules(newModules)

    // Update DB
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({ enabled_modules: newModules })
        .eq('id', user.id)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {AVAILABLE_MODULES.map((mod) => {
        const isEnabled = enabledModules.includes(mod.id)
        return (
          <div 
            key={mod.id}
            onClick={() => toggleModule(mod.id)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer group flex items-start gap-4 ${
              isEnabled 
                ? 'bg-primary/5 border-primary shadow-sm' 
                : 'bg-card border-border hover:border-muted-foreground/30'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isEnabled ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}>
              <mod.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm">{mod.name}</h4>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase ${
                    mod.plan === 'Expert' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'
                  }`}>
                    {mod.plan}
                  </span>
                </div>
                {isEnabled && <CheckCircle2 className="w-4 h-4 text-primary animate-in zoom-in duration-300" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {mod.description}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className={`w-8 h-4 rounded-full relative transition-colors ${isEnabled ? 'bg-primary' : 'bg-secondary'}`}>
                  <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${isEnabled ? 'left-5' : 'left-1'}`} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {isEnabled ? 'Activé' : 'Désactivé'}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
