'use client'

import React from 'react';
import Link from 'next/link';
import { 
  Smartphone, 
  Palette, 
  FileText, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  PlayCircle,
  LayoutDashboard,
  Calendar,
  CloudOff
} from 'lucide-react';

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 text-sm font-bold">
            <LayoutDashboard className="w-4 h-4" /> Retour au tableau de bord
          </Link>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
            Bienvenue sur <span className="italic">Flozy</span>.
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Le guide simple pour reprendre le contrôle de votre entreprise en moins de 5 minutes.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-16 space-y-24">
        
        {/* Étape 1 : Installation */}
        <section className="relative">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black text-xl shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.2)]">1</div>
            <div className="space-y-6">
              <h2 className="text-3xl font-black flex items-center gap-3">
                <Smartphone className="w-8 h-8 text-primary" />
                Mettre Flozy sur votre téléphone
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Pas besoin d'aller sur l'App Store. Flozy s'installe directement depuis votre navigateur pour être accessible d'un seul clic sur votre chantier.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl">
                  <p className="font-bold mb-3 flex items-center gap-2 text-primary">
                    <span className="w-2 h-2 rounded-full bg-primary" /> Sur iPhone (Safari)
                  </p>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Cliquez sur l'icône **"Partager"** (le carré avec une flèche vers le haut) en bas de votre écran, puis faites défiler et appuyez sur **"Sur l'écran d'accueil"**.
                  </p>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl">
                  <p className="font-bold mb-3 flex items-center gap-2 text-blue-400">
                    <span className="w-2 h-2 rounded-full bg-blue-400" /> Sur Android (Chrome)
                  </p>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Cliquez sur les **3 petits points** en haut à droite, puis appuyez sur **"Installer l'application"** ou **"Ajouter à l'écran d'accueil"**.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Étape 2 : Branding */}
        <section className="relative">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black text-xl shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.2)]">2</div>
            <div className="space-y-6">
              <h2 className="text-3xl font-black flex items-center gap-3">
                <Palette className="w-8 h-8 text-purple-400" />
                Personnaliser vos documents
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Vos clients doivent vous reconnaître. Un devis avec un beau logo, c'est 50% de chances en plus de signer le chantier.
              </p>
              <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3 text-sm font-bold text-zinc-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Ajoutez votre logo (PNG ou JPG)
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-zinc-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Choisissez votre couleur de marque
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-zinc-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Vos factures s'adaptent toutes seules !
                  </div>
                </div>
                <Link href="/settings" className="px-6 py-4 bg-white text-black rounded-2xl font-black text-sm hover:scale-105 transition-all flex items-center gap-2">
                  Aller aux réglages <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Étape 3 : Devis */}
        <section className="relative">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black text-xl shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.2)]">3</div>
            <div className="space-y-6">
              <h2 className="text-3xl font-black flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-400" />
                Créer votre premier devis
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                C'est le cœur de Flozy. Nous avons supprimé toutes les étapes inutiles pour que vous puissiez faire un devis entre deux rendez-vous.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 font-bold text-xs shrink-0">A</div>
                  <p className="text-sm text-zinc-300">Créez votre client dans l'onglet **Clients**.</p>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 font-bold text-xs shrink-0">B</div>
                  <p className="text-sm text-zinc-300">Allez dans **Documents**, cliquez sur **"Nouveau"** et sélectionnez votre client.</p>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 font-bold text-xs shrink-0">C</div>
                  <p className="text-sm text-zinc-300">Ajoutez vos lignes de prestations. Une fois fini, cliquez sur **"Générer le PDF"**.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Expert : Planning & Équipe */}
        <section className="relative p-12 bg-primary/5 border border-primary/20 rounded-[3rem] overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-20 -mt-20" />
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              Abonnés Pro & Expert
            </div>
            <h2 className="text-3xl font-black">Piloter votre équipe sur le terrain</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-bold">Le Planning Partagé</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Planifiez vos chantiers sur le calendrier. Vos employés verront instantanément leur emploi du temps sur leur propre téléphone.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-bold">Accès Employés</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Invitez vos gars via un **Lien Magique**. Ils pourront voir les adresses de chantier et prendre des photos, mais ils ne verront jamais vos tarifs ni votre chiffre d'affaires.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mode Hors-Ligne */}
        <section className="text-center py-12 border-t border-white/5">
           <div className="inline-flex items-center gap-4 text-zinc-500 mb-6">
              <CloudOff className="w-6 h-6" />
              <span className="font-bold uppercase tracking-widest text-xs">Technologie "Offline-First"</span>
           </div>
           <p className="text-zinc-400 max-w-xl mx-auto italic leading-relaxed">
             "Même dans une cave ou un immeuble neuf sans réseau, Flozy fonctionne. Vos modifications seront sauvegardées et envoyées dès que vous retrouverez de la 4G."
           </p>
        </section>

        {/* CTA */}
        <div className="text-center pt-12">
          <Link href="/dashboard" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)]">
            C'est parti, au boulot !
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </div>
  );
}
