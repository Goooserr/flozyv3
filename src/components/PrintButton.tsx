'use client'

import React from 'react'
import { Download } from 'lucide-react'

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
    >
      <Download className="w-4 h-4" /> PDF
    </button>
  )
}
