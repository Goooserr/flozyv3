'use client'

import React, { useState, useEffect } from 'react'
import {
  AlertCircle,
  Send,
  CheckCircle2,
  Clock,
  Euro,
  Bell,
  Mail,
  ArrowUpRight,
  Loader2,
  X as XIcon,
  RefreshCw,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useToast } from '@/components/ToastProvider'

interface UnpaidDoc {
  id: string
  document_number: string
  amount: number
  created_at: string
  due_date?: string
  status: string
  last_sent_at?: string
  reminder_count?: number
  clients: {
    full_name: string
    email?: string
    phone?: string
  } | null
}

export default function RelancesPage() {
  const [docs, setDocs] = useState<UnpaidDoc[]>([])
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'overdue' | 'upcoming'>('all')

  async function loadDocs() {
    const { getDocuments } = await import('@/lib/actions')
    const all = await getDocuments()
    const unpaid = all.filter((d: any) => d.type === 'invoice' && d.status === 'pending')
    setDocs(unpaid)
    setLoading(false)
  }

  useEffect(() => { loadDocs() }, [])


  async function handleMarkPaid(docId: string) {
    const { updateDocument } = await import('@/lib/actions') as any
    try {
      if (updateDocument) {
        await updateDocument(docId, { status: 'paid' })
      } else {
        // Fallback: use supabase directly
        const { createClient } = await import('@/lib/supabase')
        const supabase = createClient()
        await supabase.from('documents').update({ status: 'paid' }).eq('id', docId)
      }
      toast('✅ Facture marquée comme payée !', 'success')
      loadDocs()
    } catch (e) {
      toast('Erreur lors de la mise à jour', 'error')
    }
  }

  async function handleSendReminder(doc: UnpaidDoc) {
    if (!doc.clients?.email) {
      toast('⚠️ Aucun email trouvé pour ce client.', 'warning')
      return
    }
    setSending(doc.id)
    try {
      const res = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: doc.id,
          clientEmail: doc.clients.email,
          clientName: doc.clients.full_name,
          amount: doc.amount,
          documentNumber: doc.document_number,
          createdAt: doc.created_at,
        })
      })
      if (res.ok) {
        toast(`📧 Relance envoyée à ${doc.clients.email}`, 'success')
        loadDocs()
      } else {
        const err = await res.json()
        toast(`Erreur: ${err.error || 'Envoi échoué'}`, 'error')
      }
    } finally {
      setSending(null)
    }
  }

  const now = new Date()
  const totalUnpaid = docs.reduce((a, d) => a + d.amount, 0)

  const getDaysOverdue = (doc: UnpaidDoc) => {
    const dueDate = doc.due_date ? new Date(doc.due_date) : new Date(new Date(doc.created_at).getTime() + 30 * 24 * 60 * 60 * 1000)
    return Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  const overdueCount = docs.filter(d => getDaysOverdue(d) > 0).length
  const upcomingCount = docs.filter(d => getDaysOverdue(d) <= 0).length

  const filtered = docs.filter(d => {
    if (filter === 'overdue') return getDaysOverdue(d) > 0
    if (filter === 'upcoming') return getDaysOverdue(d) <= 0
    return true
  }).sort((a, b) => getDaysOverdue(b) - getDaysOverdue(a))

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20 max-w-5xl mx-auto">
      {/* Toast removed — now global */}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-sm uppercase tracking-widest mb-1">
            <Bell className="w-4 h-4" /> Relances & Impayés
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Gérer les Impayés</h2>
          <p className="text-muted-foreground">Relancez en 1 clic. Chaque euro compte.</p>
        </div>
        <button onClick={loadDocs} className="p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Euro className="w-5 h-5 text-rose-400" />
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Total Impayé</p>
          </div>
          <p className="text-3xl font-black text-rose-400">{totalUnpaid.toLocaleString('fr-FR')} €</p>
          <p className="text-xs text-rose-400/60 mt-1">{docs.length} facture{docs.length > 1 ? 's' : ''} en attente</p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">En Retard</p>
          </div>
          <p className="text-3xl font-black text-amber-400">{overdueCount}</p>
          <p className="text-xs text-amber-400/60 mt-1">dépassent l'échéance de 30j</p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Si tout payé</p>
          </div>
          <p className="text-3xl font-black text-emerald-400">+{totalUnpaid.toLocaleString('fr-FR')} €</p>
          <p className="text-xs text-emerald-400/60 mt-1">de trésorerie récupérée</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 bg-secondary/50 p-1.5 rounded-2xl w-fit">
        {(['all', 'overdue', 'upcoming'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all',
              filter === f ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {f === 'all' ? `Tous (${docs.length})` : f === 'overdue' ? `En retard (${overdueCount})` : `À venir (${upcomingCount})`}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 border-dashed rounded-3xl p-16 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-black text-emerald-500 mb-2">Aucun impayé !</h3>
          <p className="text-muted-foreground text-sm">Toutes vos factures sont à jour. Excellent travail.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((doc) => {
            const daysOver = getDaysOverdue(doc)
            const isOverdue = daysOver > 0
            const urgency = daysOver > 60 ? 'critical' : daysOver > 30 ? 'high' : daysOver > 0 ? 'medium' : 'low'
            const urgencyColors = {
              critical: { badge: 'bg-rose-500 text-white', border: 'border-rose-500/30', glow: 'shadow-rose-500/10' },
              high: { badge: 'bg-amber-500 text-white', border: 'border-amber-500/30', glow: 'shadow-amber-500/10' },
              medium: { badge: 'bg-orange-500 text-white', border: 'border-orange-500/30', glow: 'shadow-orange-500/10' },
              low: { badge: 'bg-blue-500/20 text-blue-400', border: 'border-blue-500/20', glow: '' },
            }
            const colors = urgencyColors[urgency]

            return (
              <div
                key={doc.id}
                className={cn(
                  'bg-card border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg transition-all hover:shadow-xl',
                  colors.border,
                  colors.glow
                )}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-black uppercase', urgency === 'low' ? 'bg-blue-500/10' : 'bg-rose-500/10')}>
                    <Clock className={cn('w-5 h-5', isOverdue ? 'text-rose-500' : 'text-blue-500')} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={cn('text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full', colors.badge)}>
                        {isOverdue ? `Retard ${daysOver}j` : `Échéance dans ${Math.abs(daysOver)}j`}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">{doc.document_number}</span>
                    </div>
                    <h3 className="font-bold text-base truncate">{doc.clients?.full_name || 'Client inconnu'}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Émise le {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                      {doc.clients?.email && ` · ${doc.clients.email}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right mr-2">
                    <p className="text-xl font-black">{Number(doc.amount).toLocaleString('fr-FR')} €</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">TTC</p>
                  </div>

                  <button
                    onClick={() => handleMarkPaid(doc.id)}
                    className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                    title="Marquer comme payée"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleSendReminder(doc)}
                    disabled={sending === doc.id || !doc.clients?.email}
                    className={cn(
                      'flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition-all',
                      !doc.clients?.email
                        ? 'bg-secondary text-muted-foreground cursor-not-allowed opacity-50'
                        : isOverdue
                        ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20'
                        : 'bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20'
                    )}
                  >
                    {sending === doc.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Relancer
                      </>
                    )}
                  </button>

                  <Link href={`/p/${doc.id}`} target="_blank" className="p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tip box */}
      <div className="bg-secondary/30 border border-border border-dashed rounded-2xl p-6 flex items-start gap-4">
        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-sm mb-1">💡 Conseil Flozy</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Les relances envoyées dans les 7 jours suivant l'échéance ont un taux de paiement 3x supérieur.
            Activez les relances automatiques dans vos Paramètres pour ne plus jamais les oublier.
          </p>
        </div>
      </div>
    </div>
  )
}
