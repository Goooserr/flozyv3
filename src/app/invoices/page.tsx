'use client'

import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  BellRing,
  ArrowUpRight,
  Download,
  Loader2,
  FileCheck
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getDocuments, convertQuoteToInvoice } from '@/lib/actions'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilter, setShowFilter] = useState(false)

  async function load() {
    const data = await getDocuments()
    setInvoices(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleConvert = async (id: string, docNumber: string) => {
    try {
      await convertQuoteToInvoice(id, docNumber)
      alert("Le devis a été converti en facture !")
      load()
    } catch (e) {
      alert("Erreur lors de la conversion")
    }
  }

  const sendReminder = (id: string) => {
    // Keep local logic for reminder UI for now
    setInvoices(invoices.map(inv => 
      inv.id === id ? { ...inv, reminders: (inv.reminders || 0) + 1 } : inv
    ))
    alert(`Relance automatique envoyée pour la facture ${id}`)
  }

  const totalFacture = invoices.reduce((acc, curr) => acc + (curr.amount || 0), 0)
  const totalPaye = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + (curr.amount || 0), 0)
  const totalAttente = invoices.filter(i => i.status === 'pending').reduce((acc, curr) => acc + (curr.amount || 0), 0)
  const totalRetard = invoices.filter(i => i.status === 'overdue').reduce((acc, curr) => acc + (curr.amount || 0), 0)

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">Factures & Devis</h2>
          <p className="text-muted-foreground text-sm">Gérez vos revenus et relancez vos impayés.</p>
        </div>
        <Link href="/invoices/new" className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" /> Nouveau Document
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <StatCard label="Total Facturé" value={`${totalFacture.toLocaleString()} €`} color="text-foreground" />
         <StatCard label="Payé" value={`${totalPaye.toLocaleString()} €`} color="text-emerald-500" />
         <StatCard label="En attente" value={`${totalAttente.toLocaleString()} €`} color="text-amber-500" />
         <StatCard label="Retard" value={`${totalRetard.toLocaleString()} €`} color="text-rose-500" />
      </div>

      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border flex items-center gap-4">
           <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher une facture..." 
                className="w-full bg-secondary/50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" 
              />
           </div>
           <button 
             onClick={() => setShowFilter(!showFilter)}
             className={cn("p-2.5 rounded-xl border transition-all", showFilter ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground hover:text-foreground border-border")}
           >
              <Filter className="w-4 h-4" />
           </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border bg-secondary/30">
                <th className="px-8 py-4">Document</th>
                <th className="px-8 py-4">Client</th>
                <th className="px-8 py-4">Montant</th>
                <th className="px-8 py-4">Statut</th>
                <th className="px-8 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {invoices.filter(inv => 
                (inv.document_number || inv.id).toLowerCase().includes(searchQuery.toLowerCase()) || 
                (inv.clients?.full_name || inv.metadata?.client_info?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
              ).map((inv) => (
                <tr key={inv.id} className="text-sm hover:bg-secondary/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold">{inv.document_number || inv.id.split('-')[0]}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {inv.created_at ? new Date(inv.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Récent'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-medium">
                    {inv.clients?.full_name || inv.metadata?.client_info?.name || 'Client Inconnu'}
                  </td>
                  <td className="px-8 py-6 font-bold">{(inv.amount || 0).toLocaleString()} €</td>
                  <td className="px-8 py-6">
                    <StatusBadge status={inv.status || 'pending'} />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       {inv.type === 'quote' && inv.status === 'accepted' && (
                         <button 
                           onClick={() => handleConvert(inv.id, inv.document_number || inv.id)}
                           className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                           title="Convertir en facture"
                         >
                            <FileCheck className="w-3 h-3" /> Convertir
                         </button>
                       )}
                       {inv.type === 'invoice' && (inv.status === 'overdue' || inv.status === 'pending') && (
                         <button 
                           onClick={() => sendReminder(inv.id)}
                           className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 text-rose-500 rounded-lg text-[10px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all animate-pulse shadow-sm"
                         >
                            <BellRing className="w-3 h-3" /> Relancer {(inv.reminders || 0) > 0 && `(${inv.reminders})`}
                         </button>
                       )}
                       <Link href={`/p/${inv.id}`} target="_blank" className="p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-colors hover:text-primary" title="Voir la page publique">
                          <ArrowUpRight className="w-4 h-4" />
                       </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: any) {
  return (
    <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
      <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">{label}</p>
      <p className={cn("text-2xl font-black", color)}>{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    paid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    overdue: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    accepted: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  }
  const icons: any = {
    paid: CheckCircle2,
    pending: Clock,
    overdue: AlertCircle,
    accepted: FileCheck,
  }
  const Icon = icons[status] || Clock
  const labels: any = { paid: 'Payée', pending: 'En attente', overdue: 'En retard', accepted: 'Signé' }

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wide", styles[status] || styles.pending)}>
      <Icon className="w-3 h-3" />
      {labels[status] || 'Inconnu'}
    </div>
  )
}
