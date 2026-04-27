'use client'

import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  Shield, 
  Mail, 
  Globe, 
  Palette, 
  Zap, 
  Activity, 
  Lock,
  Database,
  Cloud,
  Bell,
  Save,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/DynamicThemeProvider'
import { useRouter } from 'next/navigation'

export default function NexusSettings() {
  const { isAdmin } = useTheme()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('branding')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Redirection de sécurité
  useEffect(() => {
    if (!isAdmin) {
      // Un petit délai pour laisser le theme provider charger
      const timer = setTimeout(() => {
        if (!isAdmin) router.push('/dashboard')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isAdmin, router])

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 1000)
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-amber-500 font-bold text-[10px] uppercase tracking-widest bg-amber-500/10 w-fit px-3 py-1 rounded-full border border-amber-500/20">
          <Shield className="w-3 h-3" /> Zone Nexus Haute Sécurité
        </div>
        <h2 className="text-3xl font-black tracking-tight mt-2 text-white">Réglages Nexus</h2>
        <p className="text-zinc-400 text-sm">Configurez les paramètres globaux de la plateforme Flozy.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation latérale des réglages */}
        <div className="space-y-1">
          <SettingsNavButton 
            active={activeSection === 'branding'} 
            onClick={() => setActiveSection('branding')} 
            icon={<Palette className="w-4 h-4" />} 
            label="Identité & Branding" 
          />
          <SettingsNavButton 
            active={activeSection === 'access'} 
            onClick={() => setActiveSection('access')} 
            icon={<Lock className="w-4 h-4" />} 
            label="Gestion des Accès" 
          />
          <SettingsNavButton 
            active={activeSection === 'system'} 
            onClick={() => setActiveSection('system')} 
            icon={<Activity className="w-4 h-4" />} 
            label="État du Système" 
          />
          <SettingsNavButton 
            active={activeSection === 'notifications'} 
            onClick={() => setActiveSection('notifications')} 
            icon={<Bell className="w-4 h-4" />} 
            label="Notifications Globales" 
          />
        </div>

        {/* Panneau de contenu */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
              <Zap className="w-64 h-64 -rotate-12" />
            </div>

            {activeSection === 'branding' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <section className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                    <Globe className="w-5 h-5 text-amber-500" /> Identité Plateforme
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nom du SaaS</label>
                      <input 
                        type="text" 
                        defaultValue="Flozy" 
                        className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Couleur Maître Nexus</label>
                      <div className="flex gap-3">
                        <input 
                          type="color" 
                          defaultValue="#f59e0b" 
                          className="w-14 h-14 bg-black/50 border border-white/10 rounded-2xl p-1 cursor-pointer"
                        />
                        <input 
                          type="text" 
                          defaultValue="#f59e0b" 
                          className="flex-1 bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                    <Cloud className="w-5 h-5 text-amber-500" /> Logos & Assets
                  </h3>
                  <div className="p-12 border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4 hover:border-amber-500/20 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Cloud className="w-8 h-8 text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Logo Flozy Nexus (SVG/PNG)</p>
                      <p className="text-xs text-zinc-500 mt-1">Glissez-déposez le nouveau logo ici</p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeSection === 'access' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                      <Shield className="w-5 h-5 text-amber-500" /> Admins Permanents
                    </h3>
                    <button className="text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-all">
                      Ajouter un accès
                    </button>
                  </div>
                  <div className="space-y-3">
                    <AdminAccount email="florian.benoit73@gmail.com" role="Propriétaire" />
                    <AdminAccount email="support@flozy.com" role="Système" />
                  </div>
                </section>

                <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl">
                  <p className="text-xs text-amber-500/80 leading-relaxed italic">
                    Note : Les admins permanents ont un accès total sans vérification de plan d'abonnement. 
                    Ils peuvent suspendre et supprimer n'importe quel compte artisan.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'system' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                  <Activity className="w-5 h-5 text-amber-500" /> État des Services
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ServiceStatus label="Base de données (Supabase)" status="Opérationnel" latency="24ms" icon={<Database className="w-4 h-4" />} />
                  <ServiceStatus label="Authentification" status="Opérationnel" latency="12ms" icon={<Lock className="w-4 h-4" />} />
                  <ServiceStatus label="Paiements (Stripe)" status="Connecté" latency="--" icon={<CreditCard className="w-4 h-4" />} />
                  <ServiceStatus label="Stockage Assets" status="Opérationnel" latency="31ms" icon={<Cloud className="w-4 h-4" />} />
                </div>
              </div>
            )}

            {/* Footer de sauvegarde */}
            <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
              <p className="text-xs text-zinc-500">Dernière modification : Aujourd'hui à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
              <button 
                onClick={handleSave}
                disabled={loading}
                className={cn(
                  "flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl",
                  saved ? "bg-emerald-500 text-white" : "bg-white text-black hover:bg-zinc-200"
                )}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                 saved ? <><CheckCircle2 className="w-5 h-5" /> Sauvegardé</> : 
                 <><Save className="w-5 h-5" /> Appliquer les changements</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsNavButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all border",
        active 
          ? "bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-lg shadow-amber-500/5" 
          : "text-zinc-500 border-transparent hover:bg-white/5 hover:text-zinc-300"
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function AdminAccount({ email, role }: { email: string, role: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-black/30 border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-amber-500 transition-colors">
          <Mail className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">{email}</p>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{role}</p>
        </div>
      </div>
      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
    </div>
  )
}

function ServiceStatus({ label, status, latency, icon }: any) {
  return (
    <div className="p-5 bg-black/30 border border-white/5 rounded-2xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/5 rounded-lg text-zinc-500">
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-white">{label}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{status}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-mono text-zinc-600">{latency}</p>
      </div>
    </div>
  )
}

function CreditCard(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}
