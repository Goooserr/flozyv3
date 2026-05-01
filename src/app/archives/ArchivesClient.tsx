'use client'

import React, { useState, useEffect } from 'react'
import { 
  History, 
  Search, 
  FileText, 
  Calendar, 
  ChevronRight,
  Archive,
  Download,
  Filter,
  CheckCircle2,
  Euro
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/DynamicThemeProvider'

export default function ArchivesClient() {
  const { primaryColor } = useTheme()
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<any[]>([])
  const [interventions, setInterventions] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'invoices' | 'interventions'>('all')

  useEffect(() => {
    async function loadData() {
      const { getDocuments, getInterventions } = await import('@/lib/actions')
      const [docs, inters] = await Promise.all([getDocuments(), getInterventions()])
      
      // On ne garde que ce qui est finalisé pour les archives
      setInvoices(docs?.filter((d: any) => d.status === 'paid' || d.status === 'accepted') || [])
      setInterventions(inters?.filter((i: any) => i.status === 'completed' || i.status === 'archived') || [])
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredInvoices = invoices.filter(i => 
    i.metadata?.client_info?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.document_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredInterventions = interventions.filter(i => 
    i.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.clients?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Archives du Cabinet</h1>
          <p className="text-muted-foreground text-sm">Consultez l'historique sécurisé de vos activités finalisées.</p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-xl border border-border w-fit">
          <button onClick={() => setActiveTab('all')} className={cn("px-4 py-2 text-xs font-bold rounded-lg transition-all", activeTab === 'all' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>Tout</button>
          <button onClick={() => setActiveTab('invoices')} className={cn("px-4 py-2 text-xs font-bold rounded-lg transition-all", activeTab === 'invoices' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>Factures</button>
          <button onClick={() => setActiveTab('interventions')} className={cn("px-4 py-2 text-xs font-bold rounded-lg transition-all", activeTab === 'interventions' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>Chantiers</button>
        </div>
      </div>

      {/* Barre de recherche premium */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Rechercher un client, un numéro de facture ou un chantier..."
          className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Section Factures */}
        {(activeTab === 'all' || activeTab === 'invoices') && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <FileText className="w-4 h-4" />
              <h2 className="text-xs font-black uppercase tracking-widest">Factures & Devis Archivés ({filteredInvoices.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInvoices.map((doc) => (
                <div key={doc.id} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-all group relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-secondary rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md border border-emerald-500/20">Archivé</span>
                  </div>
                  <h3 className="font-bold mb-1">{doc.metadata?.client_info?.name || 'Client Inconnu'}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{doc.document_number} — {new Date(doc.created_at).toLocaleDateString()}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <span className="font-black text-lg">{doc.amount.toLocaleString()} €</span>
                    <button className="p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredInvoices.length === 0 && (
                <div className="col-span-full py-12 text-center bg-secondary/20 border border-dashed border-border rounded-3xl">
                  <Archive className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                  <p className="text-sm text-muted-foreground">Aucun document archivé trouvé.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section Chantiers */}
        {(activeTab === 'all' || activeTab === 'interventions') && (
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <Calendar className="w-4 h-4" />
              <h2 className="text-xs font-black uppercase tracking-widest">Chantiers Terminés ({filteredInterventions.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInterventions.map((inter) => (
                <div key={inter.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex gap-6 hover:border-zinc-700 transition-all group">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0">
                    <History className="w-8 h-8 text-zinc-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-white">{inter.title}</h3>
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-800 px-2 py-1 rounded">Historique</span>
                    </div>
                    <p className="text-xs text-zinc-500 mb-3">{inter.clients?.full_name} — {new Date(inter.start_time).toLocaleDateString()}</p>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold">
                          <CheckCircle2 className={cn("w-3 h-3", inter.status === 'archived' ? "text-amber-500" : "text-emerald-500")} /> {inter.status === 'archived' ? 'Archivé' : 'Succès'}
                       </div>
                       <div className="h-3 w-px bg-zinc-800" />
                       <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Voir détails</button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredInterventions.length === 0 && (
                <div className="col-span-full py-12 text-center bg-secondary/20 border border-dashed border-border rounded-3xl">
                  <Archive className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                  <p className="text-sm text-muted-foreground">Aucun chantier terminé trouvé.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
