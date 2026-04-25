'use client'

import React, { useState } from 'react'
import { Plus, UserPlus, FileText, Calendar, Box, X, Lock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useTheme } from './DynamicThemeProvider'

export function QuickActionFAB() {
  const [isOpen, setIsOpen] = useState(false)
  const { enabledModules } = useTheme()

  const actions = [
    { label: 'Facture / Devis', icon: FileText, href: '/invoices/new', color: 'bg-blue-500', module: 'documents' },
    { label: 'Nouveau Client', icon: UserPlus, href: '/clients', color: 'bg-emerald-500', module: 'clients' },
    { label: 'Intervention', icon: Calendar, href: '/planning', color: 'bg-purple-500', module: 'planning' },
    { label: 'Matériau Stock', icon: Box, href: '/stock', color: 'bg-amber-500', module: 'stock' },
  ]

  return (
    <div className="fixed bottom-6 right-4 md:hidden z-50">
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[-1]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action Buttons */}
      {isOpen && (
        <div className="flex flex-col gap-3 mb-4 items-end animate-in slide-in-from-bottom-4 duration-200">
          {actions.map((action, i) => {
            const isEnabled = !action.module || enabledModules.includes(action.module);
            
            return (
              <Link
                key={i}
                href={isEnabled ? action.href : '/billing'}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3",
                  !isEnabled && "opacity-50"
                )}
              >
                {/* Label pill — toujours visible */}
                <span className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg border border-white/10">
                  {action.label}
                </span>

                {/* Icon button */}
                <div className={cn(
                  "w-13 h-13 w-[52px] h-[52px] rounded-full flex items-center justify-center text-white shadow-xl shrink-0",
                  isEnabled ? action.color : "bg-zinc-700"
                )}>
                  {isEnabled ? (
                    <action.icon className="w-5 h-5" />
                  ) : (
                    <Lock className="w-4 h-4 text-zinc-300" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Main Toggle Button */}
      <button
        id="fab-main-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all duration-300 gap-0.5",
          isOpen
            ? "bg-zinc-800 rotate-45 shadow-zinc-900/50"
            : "bg-primary shadow-primary/40"
        )}
        aria-label={isOpen ? 'Fermer le menu' : 'Actions rapides'}
      >
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <>
            <Plus className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-wider leading-none">Action</span>
          </>
        )}
      </button>
    </div>
  )
}
