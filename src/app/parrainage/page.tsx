'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  Gift,
  Copy,
  Check,
  Share2,
  Trophy,
  ArrowRight,
  Loader2,
  Star,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/DynamicThemeProvider'
import { useToast } from '@/components/ToastProvider'

export default function ParrainagePage() {
  const { primaryColor, companyName } = useTheme()
  const { toast } = useToast()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
      setLoading(false)
    }
    load()
  }, [])

  const referralCode = profile?.id ? `FLOZY-${profile.id.slice(0, 8).toUpperCase()}` : 'FLOZY-XXXXXXXX'
  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://flozy.app'}/register?ref=${referralCode}`

  function copyLink() {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast('✅ Lien copié !', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  function shareLink() {
    if (navigator.share) {
      navigator.share({
        title: 'Rejoins Flozy !',
        text: `Je gère mon activité avec Flozy — devis, factures, planning en 2 clics. Essaie gratuitement avec mon lien et on a tous les deux 1 mois offert !`,
        url: referralLink
      })
    } else {
      copyLink()
    }
  }

  const steps = [
    {
      num: '01',
      title: 'Partagez votre lien',
      desc: 'Envoyez votre lien unique à un collègue artisan par SMS, WhatsApp ou email.',
      icon: Share2,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      num: '02',
      title: 'Il crée son compte',
      desc: 'Votre filleul s\'inscrit via votre lien et commence son essai Flozy.',
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      num: '03',
      title: 'Vous êtes récompensés',
      desc: '1 mois offert pour vous, 1 mois offert pour lui. Gagnant-gagnant.',
      icon: Gift,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    }
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="relative bg-zinc-900 rounded-[2.5rem] p-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-4">
            <Gift className="w-4 h-4" /> Programme Parrainage
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Gagnez <span style={{ color: primaryColor }}>1 mois</span><br />en parrainant un artisan
          </h1>
          <p className="text-zinc-400 text-lg max-w-lg leading-relaxed">
            Vous connaissez d'autres artisans qui galèrent avec leur administration ? Partagez Flozy. Si ils s'abonnent, vous avez tous les deux 1 mois offert.
          </p>
        </div>
      </div>

      {/* Referral Link Box */}
      <div className="bg-card border-2 border-primary/30 rounded-3xl p-8 shadow-lg shadow-primary/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-black text-xl">Votre lien de parrainage</h2>
            <p className="text-sm text-muted-foreground">Partagez ce lien — il est unique et traçable.</p>
          </div>
        </div>

        <div className="bg-secondary/50 border border-border rounded-2xl p-4 mb-4 flex items-center gap-3 group">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Votre code</p>
            <p className="font-black text-lg text-primary tracking-wider">{referralCode}</p>
          </div>
          <div className="w-px h-12 bg-border" />
          <div className="flex-2 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Lien complet</p>
            <p className="text-xs text-muted-foreground truncate font-mono">{referralLink}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={copyLink}
            className={cn(
              'flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all',
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-secondary hover:bg-secondary/80 text-foreground'
            )}
          >
            {copied ? <><Check className="w-5 h-5" /> Copié !</> : <><Copy className="w-5 h-5" /> Copier le lien</>}
          </button>
          <button
            onClick={shareLink}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
          >
            <Share2 className="w-5 h-5" /> Partager maintenant
          </button>
        </div>

        {/* WhatsApp quick share */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Salut ! Je gère mon activité avec Flozy — devis, factures, planning en 2 clics depuis mon téléphone. Tu peux essayer gratuitement avec mon lien, on a tous les deux 1 mois offert : ${referralLink}`)}`}
          target="_blank"
          className="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
          Envoyer sur WhatsApp
        </a>
      </div>

      {/* How it works */}
      <div>
        <h2 className="text-2xl font-black mb-6">Comment ça marche ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <React.Fragment key={step.num}>
              <div className="bg-card border border-border rounded-3xl p-6 relative">
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mb-4', step.bg)}>
                  <step.icon className={cn('w-6 h-6', step.color)} />
                </div>
                <div className="absolute top-4 right-4 text-4xl font-black text-border">{step.num}</div>
                <h3 className="font-black text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center -mx-2">
                  <ArrowRight className="w-6 h-6 text-muted-foreground/40" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Rewards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8">
          <Trophy className="w-8 h-8 text-primary mb-4" />
          <h3 className="font-black text-xl mb-2">Pour vous</h3>
          <p className="text-4xl font-black mb-2">1 mois <span className="text-primary">offert</span></p>
          <p className="text-sm text-muted-foreground">par filleul qui souscrit à un abonnement payant.</p>
          <div className="mt-4 space-y-2">
            {['Valable sur tous les plans (Pro & Expert)', 'Sans limite de parrainages', 'Crédité automatiquement'].map(t => (
              <div key={t} className="flex items-center gap-2 text-xs font-medium">
                <Check className="w-4 h-4 text-primary shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-secondary/30 border border-border rounded-3xl p-8">
          <Star className="w-8 h-8 text-amber-500 mb-4" />
          <h3 className="font-black text-xl mb-2">Pour votre filleul</h3>
          <p className="text-4xl font-black mb-2">1 mois <span className="text-amber-500">offert</span></p>
          <p className="text-sm text-muted-foreground">dès sa première souscription payante.</p>
          <div className="mt-4 space-y-2">
            {['Essai 14 jours gratuit inclus', 'Accès à toutes les fonctionnalités', 'Support onboarding personnalisé'].map(t => (
              <div key={t} className="flex items-center gap-2 text-xs font-medium">
                <Check className="w-4 h-4 text-amber-500 shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share messages templates */}
      <div className="bg-card border border-border rounded-3xl p-8">
        <h3 className="font-black text-lg mb-6">Messages prêts à envoyer</h3>
        <div className="space-y-4">
          {[
            {
              label: 'Pour un plombier / électricien',
              text: `Salut ! Je gère mes devis et factures avec Flozy depuis mon téléphone — plus de paperasse le soir. Tu peux essayer gratuitement : ${referralLink}`
            },
            {
              label: 'Pour un artisan avec des employés',
              text: `J'utilise Flozy pour gérer mes chantiers et mes équipes. Chrono, photos, planning... tout depuis le téléphone. Si tu t'inscris avec mon lien, on a tous les deux 1 mois offert : ${referralLink}`
            }
          ].map((template, i) => (
            <div key={i} className="bg-secondary/30 rounded-2xl p-4 border border-border">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">{template.label}</p>
              <p className="text-sm text-foreground/80 leading-relaxed mb-3">{template.text}</p>
              <button
                onClick={() => { navigator.clipboard.writeText(template.text); toast('✅ Message copié !', 'success') }}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Copier ce message
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
