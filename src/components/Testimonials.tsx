'use client'

import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Jean-Pierre Durand",
    role: "Électricien - Durand & Co",
    content: "Flozy a changé ma vie. Je passe mes soirées avec ma famille au lieu de faire des devis sur Excel. L'interface est incroyablement rapide.",
    rating: 5
  },
  {
    name: "Marc Lefebvre",
    role: "Plombier Chauffagiste",
    content: "Le mode hors-ligne est une pépite. Je prends mes photos sur le chantier et tout se synchronise quand je rentre. Un gain de temps monstrueux.",
    rating: 5
  },
  {
    name: "Sophie Morel",
    role: "Peintre Décoratrice",
    content: "Mes clients sont impressionnés par la qualité des devis PDF. Ça donne une image très pro à mon entreprise dès le premier contact.",
    rating: 5
  },
  {
    name: "Antoine Garcia",
    role: "Maçonnerie Générale",
    content: "Enfin un logiciel qui ne ressemble pas à un logiciel des années 90. C'est beau, c'est simple, et ça marche tout simplement.",
    rating: 5
  },
  {
    name: "Lucie Bernard",
    role: "Menuisière Ébéniste",
    content: "Le support est réactif et l'outil évolue constamment. On sent que c'est fait pour des gens de terrain.",
    rating: 5
  }
];

export function Testimonials() {
  return (
    <div className="py-24 bg-black overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Adopté par les meilleurs.</h2>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Rejoignez des centaines d'artisans qui ont fait le choix de la modernité.</p>
      </div>

      {/* Marquee Animation Container */}
      <div className="relative flex overflow-x-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-12">
          {[...testimonials, ...testimonials].map((t, i) => (
            <div 
              key={i} 
              className="mx-4 w-[350px] md:w-[450px] bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] flex flex-col gap-6 shrink-0 hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-white/5 group-hover:text-primary/20 transition-colors" />
              </div>
              
              <p className="text-zinc-300 text-sm md:text-base leading-relaxed whitespace-normal italic">
                "{t.content}"
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center font-black text-xs">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
