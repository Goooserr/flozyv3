'use client'

import React from 'react'
import { Download, Signature } from 'lucide-react'

export function PublicActions({ documentId, artisanColor }: { documentId: string, artisanColor: string }) {
  const handleSign = () => {
    alert("La signature en ligne depuis l'espace public sera disponible très prochainement ! Veuillez contacter votre artisan directement pour valider ce devis.")
  }

  return (
    <div className="flex gap-4 w-full md:w-auto">
      <button 
        onClick={() => window.print()}
        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
      >
        <Download className="w-4 h-4" /> PDF
      </button>
      <button 
        onClick={handleSign}
        style={{ backgroundColor: artisanColor || '#10b981' }}
        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white hover:opacity-90 transition-opacity shadow-lg"
      >
        <Signature className="w-4 h-4" /> Signer en ligne
      </button>
    </div>
  )
}
