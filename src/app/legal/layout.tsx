'use client'

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">
      {/* Header Minimaliste */}
      <nav className="fixed top-0 left-0 right-0 h-20 z-[9999] border-b border-white/5 bg-black/50 backdrop-blur-xl flex items-center justify-between px-6 md:px-12">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center transition-transform group-hover:scale-105 duration-500">
            <div className="w-3.5 h-3.5 bg-black rounded-sm" />
          </div>
          <span className="font-bold text-lg tracking-tight italic">Flozy</span>
        </Link>
        
        <Link href="/" className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour au site
        </Link>
      </nav>

      {/* Contenu */}
      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-8">
          <ShieldCheck className="w-3 h-3 text-primary" />
          Centre de conformité
        </div>
        {children}
      </main>

      {/* Footer Minimaliste */}
      <footer className="py-12 border-t border-white/5 bg-black">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Flozy Inc. — Expertise & Transparence
          </p>
        </div>
      </footer>
    </div>
  );
}
