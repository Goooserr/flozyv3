'use client'

import React from 'react'
import { FileText, Users, Box, Calendar, CheckCircle2, Lock } from 'lucide-react'
import { useTheme } from './DynamicThemeProvider'
import { createClient } from '@/lib/supabase'

const AVAILABLE_MODULES = [
  { id: 'clients', name: 'Gestion Clients', description: 'Répertoire, historique et contacts', icon: Users, plan: 'starter' },
  { id: 'documents', name: 'Facturation & Devis', description: 'Création de documents pro', icon: FileText, plan: 'starter' },
  { id: 'planning', name: 'Planning & RDV', description: 'Calendrier des interventions sur le terrain', icon: Calendar, plan: 'pro' },
  { id: 'stock', name: 'Gestion de Stock', description: 'Suivi des matériaux et fournitures', icon: Box, plan: 'expert' },
]

export function ModuleSettings() {
  const { enabledModules, setEnabledModules, subscriptionPlan } = useTheme()
  const supabase = createClient()

  // Niveaux de plans pour la comparaison
  const planLevels: Record<string, number> = {
    'starter': 1,
    'pro': 2,
    'expert': 3
  }

  const userLevel = planLevels[subscriptionPlan?.toLowerCase() || 'starter'] || 1

  async function toggleModule(moduleId: string, isLocked: boolean) {
    if (isLocked) return;

    const newModules = enabledModules.includes(moduleId)
      ? enabledModules.filter(id => id !== moduleId)
      : [...enabledModules, moduleId]
    
    setEnabledModules(newModules)

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
        const requiredLevel = planLevels[mod.plan] || 1
        const isLocked = userLevel < requiredLevel

        return (
          <div 
            key={mod.id}
            onClick={() => toggleModule(mod.id, isLocked)}
            className={`p-5 rounded-2xl border transition-all flex items-start gap-4 relative overflow-hidden ${
              isLocked 
                ? 'bg-secondary/50 border-border opacity-60 cursor-not-allowed' 
                : isEnabled 
                  ? 'bg-primary/5 border-primary shadow-sm cursor-pointer' 
                  : 'bg-card border-border hover:border-muted-foreground/30 cursor-pointer'
            }`}
          >
            {isLocked && (
              <div className="absolute top-2 right-2">
                <Lock className="w-3 h-3 text-muted-foreground" />
              </div>
            )}

            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isEnabled && !isLocked ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}>
              <mod.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm">{mod.name}</h4>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase ${
                    mod.plan === 'expert' ? 'bg-amber-500/20 text-amber-500' : 
                    mod.plan === 'pro' ? 'bg-blue-500/20 text-blue-500' : 
                    'bg-zinc-500/20 text-zinc-500'
                  }`}>
                    {mod.plan}
                  </span>
                </div>
                {isEnabled && !isLocked && <CheckCircle2 className="w-4 h-4 text-primary animate-in zoom-in duration-300" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {isLocked ? `Débloquez le plan ${mod.plan.toUpperCase()} pour utiliser cet outil.` : mod.description}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className={`w-8 h-4 rounded-full relative transition-colors ${isEnabled && !isLocked ? 'bg-primary' : 'bg-secondary'}`}>
                  <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${isEnabled && !isLocked ? 'left-5' : 'left-1'}`} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {isLocked ? 'Verrouillé' : isEnabled ? 'Activé' : 'Désactivé'}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
