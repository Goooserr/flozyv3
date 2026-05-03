'use client'

import React, { useState, useEffect } from 'react'
import {
  Download,
  FileSpreadsheet,
  Filter,
  Loader2,
  Euro,
  CheckCircle2,
  Calendar,
  Building2,
  X as XIcon,
  BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ToastProvider'

export default function ExportComptablePage() {
  const [docs, setDocs] = useState<any[]>([])
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear())
  const [docType, setDocType] = useState<'all' | 'invoice' | 'quote'>('invoice')
  const [status, setStatus] = useState<'all' | 'paid' | 'pending'>('all')

  async function loadDocs() {
    const { getDocuments } = await import('@/lib/actions')
    const all = await getDocuments()
    setDocs(all || [])
    setLoading(false)
  }

  useEffect(() => { loadDocs() }, [])


  const filtered = docs.filter(d => {
    const docYear = new Date(d.created_at).getFullYear()
    if (docYear !== year) return false
    if (docType !== 'all' && d.type !== docType) return false
    if (status !== 'all' && d.status !== status) return false
    return true
  })

  const totalCA = filtered.filter(d => d.type === 'invoice').reduce((a, d) => a + Number(d.amount || 0), 0)
  const totalPaid = filtered.filter(d => d.status === 'paid').reduce((a, d) => a + Number(d.amount || 0), 0)
  const totalPending = filtered.filter(d => d.status === 'pending').reduce((a, d) => a + Number(d.amount || 0), 0)

  function exportCSV() {
    setExporting(true)
    const headers = ['Date', 'Numéro', 'Type', 'Client', 'Montant HT', 'TVA 20%', 'Montant TTC', 'Statut']
    const rows = filtered.map(d => {
      const ht = Number(d.amount || 0) / 1.2
      const tva = Number(d.amount || 0) - ht
      return [
        new Date(d.created_at).toLocaleDateString('fr-FR'),
        d.document_number || d.id.slice(0, 8).toUpperCase(),
        d.type === 'invoice' ? 'Facture' : 'Devis',
        d.clients?.full_name || d.metadata?.client_info?.name || 'Inconnu',
        ht.toFixed(2),
        tva.toFixed(2),
        Number(d.amount || 0).toFixed(2),
        d.status === 'paid' ? 'Payée' : d.status === 'pending' ? 'En attente' : d.status
      ]
    })

    const csv = [headers, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n')
    const BOM = '\uFEFF' // UTF-8 BOM for Excel compatibility
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flozy-export-${year}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
    toast(`✅ Export CSV prêt — ${filtered.length} documents`, 'success')
  }

  function exportFEC() {
    setExporting(true)
    // FEC (Fichier des Écritures Comptables) — Format imposé par la DGFiP
    const headers = 'JournalCode|JournalLib|EcritureNum|EcritureDate|CompteNum|CompteLib|CompAuxNum|CompAuxLib|PieceRef|PieceDate|EcritureLib|Debit|Credit|EcritureLet|DateLet|ValidDate|Montantdevise|Idevise'
    const invoices = filtered.filter(d => d.type === 'invoice')
    let num = 1
    const rows: string[] = []

    invoices.forEach(doc => {
      const date = new Date(doc.created_at).toISOString().slice(0, 10).replace(/-/g, '')
      const ht = (Number(doc.amount || 0) / 1.2).toFixed(2)
      const tva = (Number(doc.amount || 0) - Number(ht)).toFixed(2)
      const ttc = Number(doc.amount || 0).toFixed(2)
      const ref = doc.document_number || `FAC${num.toString().padStart(5, '0')}`
      const client = doc.clients?.full_name || 'CLIENT'
      const ecritureNum = `VT${num.toString().padStart(5, '0')}`

      // Ligne 1: Crédit Vente HT
      rows.push([
        'VT', 'VENTES', ecritureNum, date,
        '706000', 'Prestations de services', '', '',
        ref, date, `Facture ${client}`,
        '0', ht.replace('.', ','), '', '', date, '', ''
      ].join('|'))

      // Ligne 2: Débit TVA
      rows.push([
        'VT', 'VENTES', ecritureNum, date,
        '445710', 'TVA collectée 20%', '', '',
        ref, date, `TVA ${client}`,
        '0', tva.replace('.', ','), '', '', date, '', ''
      ].join('|'))

      // Ligne 3: Débit Client
      rows.push([
        'VT', 'VENTES', ecritureNum, date,
        '411000', 'Clients', doc.client_id || '', client.toUpperCase().slice(0, 17),
        ref, date, `Client ${client}`,
        ttc.replace('.', ','), '0', '', '', date, '', ''
      ].join('|'))

      num++
    })

    const fec = [headers, ...rows].join('\n')
    const blob = new Blob([fec], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `FEC-${year}-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
    toast(`✅ FEC exporté — Compatible Pennylane, Sage, QuickBooks`, 'success')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  const years = [...new Set(docs.map(d => new Date(d.created_at).getFullYear()))].sort((a, b) => b - a)
  if (!years.includes(year) && years.length > 0) setYear(years[0])

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20 max-w-4xl mx-auto">
      {/* Toast removed — now global */}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-1">
          <BookOpen className="w-4 h-4" /> Exports Comptables
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Export pour la Comptabilité</h2>
        <p className="text-muted-foreground">Compatible Pennylane, Sage, QuickBooks, et votre expert-comptable.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6">
          <Euro className="w-5 h-5 text-primary mb-3" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">CA Total {year}</p>
          <p className="text-2xl font-black">{totalCA.toLocaleString('fr-FR')} €</p>
          <p className="text-xs text-muted-foreground mt-1">TTC · {filtered.filter(d => d.type === 'invoice').length} factures</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-3" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Encaissé</p>
          <p className="text-2xl font-black text-emerald-500">{totalPaid.toLocaleString('fr-FR')} €</p>
          <p className="text-xs text-muted-foreground mt-1">factures payées</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6">
          <Calendar className="w-5 h-5 text-amber-500 mb-3" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">En attente</p>
          <p className="text-2xl font-black text-amber-500">{totalPending.toLocaleString('fr-FR')} €</p>
          <p className="text-xs text-muted-foreground mt-1">non encore encaissé</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-primary" />
          <h3 className="font-bold">Filtres d'export</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Exercice fiscal</label>
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
            >
              {(years.length ? years : [new Date().getFullYear()]).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Type de document</label>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value as any)}
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="all">Tous</option>
              <option value="invoice">Factures seulement</option>
              <option value="quote">Devis seulement</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Statut</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="all">Tous</option>
              <option value="paid">Payées uniquement</option>
              <option value="pending">En attente</option>
            </select>
          </div>
        </div>
        <div className="pt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{filtered.length}</span> document{filtered.length > 1 ? 's' : ''} correspondant aux filtres
        </div>
      </div>

      {/* Export Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-3xl p-8 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-black">Export CSV / Excel</h3>
              <p className="text-xs text-muted-foreground">Format universel, compatible Excel</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Export tabulaire avec toutes vos colonnes : date, numéro, client, montant HT, TVA, TTC, statut. Ouvre directement dans Excel ou Google Sheets.
          </p>
          <div className="flex flex-wrap gap-2">
            {['Excel', 'Google Sheets', 'LibreOffice', 'Pennylane'].map(t => (
              <span key={t} className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-md">{t}</span>
            ))}
          </div>
          <button
            onClick={exportCSV}
            disabled={exporting || filtered.length === 0}
            className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500 text-white font-black rounded-2xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            Télécharger le CSV ({filtered.length} docs)
          </button>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-black">Export FEC</h3>
              <p className="text-xs text-muted-foreground">Format officiel DGFiP français</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Fichier des Écritures Comptables au format imposé par l'administration fiscale française. Transmettez directement à votre expert-comptable.
          </p>
          <div className="flex flex-wrap gap-2">
            {['Sage', 'QuickBooks', 'EBP', 'Ciel Compta', 'Expert-comptable'].map(t => (
              <span key={t} className="text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md">{t}</span>
            ))}
          </div>
          <button
            onClick={exportFEC}
            disabled={exporting || filtered.filter(d => d.type === 'invoice').length === 0}
            className="w-full flex items-center justify-center gap-2 py-4 bg-blue-500 text-white font-black rounded-2xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            Télécharger le FEC ({filtered.filter(d => d.type === 'invoice').length} factures)
          </button>
        </div>
      </div>

      {/* Tip */}
      <div className="bg-secondary/30 border border-border border-dashed rounded-2xl p-6 flex items-start gap-4">
        <Building2 className="w-8 h-8 text-primary shrink-0 mt-1" />
        <div>
          <p className="font-bold text-sm mb-1">💡 Partagez avec votre expert-comptable</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Envoyez le fichier FEC à votre expert-comptable en fin d'exercice. Il est compatible avec tous les logiciels de comptabilité professionnels.
            Si votre comptable utilise Pennylane, le CSV suffit — il importera tout automatiquement.
          </p>
        </div>
      </div>
    </div>
  )
}
