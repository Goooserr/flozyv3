'use client'

import React, { useState } from 'react'
import { Plus, UserPlus, FileText, Calendar, Box, X } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function QuickActionFAB() {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    { label: 'Facture/Devis', icon: FileText, href: '/invoices/new', color: 'bg-blue-500' },
    { label: 'Client', icon: UserPlus, href: '/clients', color: 'bg-emerald-500' },
    { label: 'Intervention', icon: Calendar, href: '/planning', color: 'bg-purple-500' },
    { label: 'Matériau', icon: Box, href: '/stock', color: 'bg-amber-500' },
  ]

  return (
    <div className="fixed bottom-6 right-6 md:hidden z-50">
      {/* Action Buttons */}
      {isOpen && (
        <div className="flex flex-col gap-3 mb-4 items-end animate-in slide-in-from-bottom-4 duration-300">
          {actions.map((action, i) => (
            <Link 
              key={i} 
              href={action.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 group"
            >
              <span className="bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                {action.label}
              </span>
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl", action.color)}>
                <action.icon className="w-5 h-5" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Main Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300",
          isOpen ? "bg-zinc-800 rotate-45" : "bg-primary shadow-primary/30"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  )
}
