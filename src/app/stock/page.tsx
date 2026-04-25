'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Box, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingUp,
  Package,
  X,
  Loader2,
  CheckCircle2,
  Euro,
  Layers,
  Trash2,
  Upload,
  FileSpreadsheet,
  Download
} from 'lucide-react'
import { getStock, updateStockQuantity } from '@/lib/actions'
import { createClient } from '@/lib/supabase'
import { useTheme } from '@/components/DynamicThemeProvider'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function StockPage() {
  const { subscriptionPlan } = useTheme()
  const [stock, setStock] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importData, setImportData] = useState<any[]>([])
  const [importError, setImportError] = useState('')
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newItem, setNewItem] = useState({ 
    name: '', 
    quantity: 0, 
    unit: 'unité', 
    min_stock: 5,
    category: 'Matériaux',
    purchase_price: 0,
    selling_price: 0
  })
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const supabase = createClient()

  async function load() {
    const data = await getStock()
    setStock(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  if (subscriptionPlan !== 'expert' && subscriptionPlan !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6">
        <div className="w-20 h-20 bg-amber-500/10 rounded-[2rem] flex items-center justify-center mb-6 animate-pulse">
          <Box className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-3xl font-black mb-4">Espace Stock Réservé</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          La gestion de catalogue et l'inventaire en temps réel sont des outils exclusifs au plan <b>Expert</b>.
        </p>
        <Link href="/billing" className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl shadow-primary/20">
          Débloquer le plan Expert
        </Link>
      </div>
    )
  }

  const filteredStock = stock.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    const isLow = Number(item.quantity) <= Number(item.min_stock)
    if (filter === 'low') return matchesSearch && isLow
    return matchesSearch
  })

  const totalValue = stock.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.purchase_price || 0)), 0)

  async function handleQuantityUpdate(id: string, current: number, change: number) {
    const newQty = Math.max(0, current + change)
    setStock(stock.map(item => item.id === id ? { ...item, quantity: newQty } : item))
    try {
      await updateStockQuantity(id, newQty)
    } catch (e) {
      load()
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.from('stock').insert([{ 
        ...newItem, 
        artisan_id: user.id
      }])
      
      if (error) {
        alert("Erreur lors de l'ajout : " + error.message)
      } else {
        setSidebarOpen(false)
        setNewItem({ 
          name: '', 
          quantity: 0, 
          unit: 'unité', 
          min_stock: 5,
          category: 'Matériaux',
          purchase_price: 0,
          selling_price: 0
        })
        load()
      }
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet article ?')) return
    const { error } = await supabase.from('stock').delete().eq('id', id)
    if (!error) load()
  }

  function handleCSVFile(e: React.ChangeEvent<HTMLInputElement>) {
    setImportError('')
    setImportData([])
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string
        const lines = text.split(/\r?\n/).filter(Boolean)
        if (lines.length < 2) { setImportError('Le fichier CSV est vide ou invalide.'); return }
        const headers = lines[0].split(';').map(h => h.trim().toLowerCase().replace(/["']/g, ''))
        const rows = lines.slice(1).map(line => {
          const vals = line.split(';').map(v => v.trim().replace(/["']/g, ''))
          const obj: any = {}
          headers.forEach((h, i) => { obj[h] = vals[i] || '' })
          return obj
        }).filter(r => r.name || r['désignation'] || r['designation'])
        if (rows.length === 0) { setImportError('Aucun article valide trouvé.'); return }
        // Normalise les colonnes
        const normalized = rows.map(r => ({
          name: r.name || r['désignation'] || r['designation'] || '',
          category: r.category || r['catégorie'] || r['categorie'] || 'Matériaux',
          unit: r.unit || r['unité'] || r['unite'] || 'unité',
          purchase_price: parseFloat(r.purchase_price || r["prix d'achat"] || r['prix_achat'] || '0') || 0,
          selling_price: parseFloat(r.selling_price || r['prix de vente'] || r['prix_vente'] || '0') || 0,
          quantity: parseInt(r.quantity || r['quantité'] || r['quantite'] || '0') || 0,
          min_stock: parseInt(r.min_stock || r['alerte'] || r['min'] || '5') || 5,
        }))
        setImportData(normalized)
      } catch {
        setImportError('Erreur lors de la lecture du fichier.')
      }
    }
    reader.readAsText(file, 'utf-8')
  }

  async function handleImportConfirm() {
    if (importData.length === 0) return
    setImporting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setImporting(false); return }
    const rows = importData.map(item => ({ ...item, artisan_id: user.id }))
    const { error } = await supabase.from('stock').insert(rows)
    if (error) {
      setImportError('Erreur import : ' + error.message)
    } else {
      setIsImportOpen(false)
      setImportData([])
      if (fileInputRef.current) fileInputRef.current.value = ''
      load()
    }
    setImporting(false)
  }

  function downloadTemplate() {
    const csv = 'name;category;unit;purchase_price;selling_price;quantity;min_stock\nCâble RO2V 3G2.5;Électricité;mètre;1.20;2.50;100;10\nDisjoncteur 16A;Électricité;unité;8.00;15.00;20;5'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'modele_catalogue.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black tracking-tight">Catalogue & Stock</h2>
          <p className="text-muted-foreground text-sm">Gérez vos matériaux, vos prix et votre inventaire.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-secondary border border-border text-foreground rounded-2xl font-bold hover:bg-secondary/80 transition-all"
          >
            <Upload className="w-4 h-4" /> Importer CSV
          </button>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-5 py-3.5 bg-primary text-primary-foreground rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
         <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm flex flex-col gap-2">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl w-fit"><Euro className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Valeur du Stock</p>
              <p className="text-2xl font-black">{totalValue.toLocaleString()} €</p>
            </div>
         </div>
         <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm flex flex-col gap-2">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl w-fit"><Layers className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Catégories</p>
              <p className="text-2xl font-black">{new Set(stock.map(s => s.category)).size}</p>
            </div>
         </div>
         <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm flex flex-col gap-2">
            <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl w-fit"><AlertTriangle className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Alertes Rupture</p>
              <p className="text-2xl font-black text-rose-500">{stock.filter(s => s.quantity <= s.min_stock).length}</p>
            </div>
         </div>
         <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm flex flex-col gap-2">
            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl w-fit"><Package className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Réf. Catalogue</p>
              <p className="text-2xl font-black">{stock.length}</p>
            </div>
         </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom ou catégorie..."
            className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
          />
        </div>
        <div className="flex bg-secondary/50 p-1 rounded-2xl border border-border">
          <button 
            onClick={() => setFilter('all')}
            className={cn("px-6 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all", filter === 'all' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
          >
            Catalogue Complet
          </button>
          <button 
            onClick={() => setFilter('low')}
            className={cn("px-6 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all", filter === 'low' ? "bg-rose-500 text-white shadow-sm" : "text-muted-foreground")}
          >
            Alerte Rupture
          </button>
        </div>
      </div>

      {/* Stock List */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {filteredStock.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card border border-dashed border-border rounded-[3rem] text-center px-6">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
              <Package className="w-12 h-12 text-primary opacity-20" />
            </div>
            <h3 className="text-xl font-bold mb-2">Aucun article trouvé</h3>
            <p className="text-muted-foreground max-w-sm mb-8">Commencez à construire votre catalogue de matériaux.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 pb-10">
            {filteredStock.map((item) => {
              const isLow = Number(item.quantity) <= Number(item.min_stock)
              return (
                <div key={item.id} className="bg-card border border-border p-6 rounded-[2rem] flex items-center justify-between group hover:border-primary/40 transition-all shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0", isLow ? "bg-rose-500/10 text-rose-500" : "bg-secondary text-muted-foreground")}>
                      <Box className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1 block">{item.category || 'Général'}</span>
                      <h4 className="font-bold text-xl leading-tight">{item.name}</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Euro className="w-3.5 h-3.5" /> 
                          <span className="font-medium">Achat: {item.purchase_price || 0}€</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold">
                          <TrendingUp className="w-3.5 h-3.5" /> 
                          <span>Vente: {item.selling_price || 0}€</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-10">
                    <div className="flex items-center gap-4 bg-secondary/30 rounded-2xl p-1.5 border border-border/50">
                       <button onClick={() => handleQuantityUpdate(item.id, item.quantity, -1)} className="w-10 h-10 flex items-center justify-center bg-card rounded-xl shadow-sm hover:bg-secondary transition-colors text-xl font-black">-</button>
                       <div className="text-center min-w-[4rem]">
                         <p className={cn("text-2xl font-black", isLow ? "text-rose-500" : "text-foreground")}>
                           {item.quantity}
                         </p>
                         <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{item.unit}</p>
                       </div>
                       <button onClick={() => handleQuantityUpdate(item.id, item.quantity, 1)} className="w-10 h-10 flex items-center justify-center bg-card rounded-xl shadow-sm hover:bg-secondary transition-colors text-xl font-black">+</button>
                    </div>
                    
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-3 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* === MODAL IMPORT CSV === */}
      {isImportOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card border border-border rounded-[2rem] p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black">Importer un catalogue</h3>
                  <p className="text-sm text-muted-foreground">Fichier CSV avec séparateur point-virgule ( ; )</p>
                </div>
              </div>
              <button onClick={() => { setIsImportOpen(false); setImportData([]); setImportError('') }} className="p-2 hover:bg-secondary rounded-xl text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template download */}
            <button onClick={downloadTemplate} className="flex items-center gap-3 p-4 border border-dashed border-primary/30 rounded-2xl text-primary hover:bg-primary/5 transition-colors text-sm font-bold">
              <Download className="w-4 h-4" /> Télécharger le modèle CSV
            </button>

            {/* Colonnes attendues */}
            <div className="bg-secondary/40 rounded-2xl p-4 text-xs text-muted-foreground space-y-1">
              <p className="font-black text-foreground text-sm mb-2">Colonnes acceptées (séparateur <code>;</code>)</p>
              <div className="grid grid-cols-2 gap-1">
                {['name', 'category', 'unit', 'purchase_price', 'selling_price', 'quantity', 'min_stock'].map(col => (
                  <span key={col} className="font-mono bg-card border border-border px-2 py-1 rounded-lg">{col}</span>
                ))}
              </div>
            </div>

            {/* File input */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-8 text-center cursor-pointer transition-colors group"
            >
              <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary mx-auto mb-2 transition-colors" />
              <p className="font-semibold text-sm">Cliquez pour sélectionner un fichier CSV</p>
              <p className="text-xs text-muted-foreground mt-1">Encodage UTF-8 recommandé</p>
              <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCSVFile} />
            </div>

            {importError && (
              <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl p-4 text-sm font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {importError}
              </div>
            )}

            {/* Preview */}
            {importData.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-black">{importData.length} articles détectés — Aperçu :</p>
                <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
                  {importData.slice(0, 8).map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-secondary/30 rounded-xl px-4 py-2.5 text-sm">
                      <span className="font-semibold truncate max-w-[200px]">{item.name}</span>
                      <span className="text-muted-foreground text-xs">{item.category}</span>
                      <span className="font-mono text-xs">{item.quantity} {item.unit}</span>
                      <span className="text-emerald-500 font-bold text-xs">{item.selling_price}€</span>
                    </div>
                  ))}
                  {importData.length > 8 && <p className="text-xs text-muted-foreground text-center">...et {importData.length - 8} autres articles</p>}
                </div>
                <button
                  onClick={handleImportConfirm}
                  disabled={importing}
                  className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground font-black py-4 rounded-[1.5rem] hover:opacity-90 transition-all shadow-xl shadow-primary/20"
                >
                  {importing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  Importer {importData.length} articles dans le catalogue
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sidebar Modal for adding items */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex justify-end">
          <div className="w-full max-w-lg bg-card border-l border-border h-full p-10 animate-in slide-in-from-right-full duration-500 relative flex flex-col shadow-2xl">
            <button 
              onClick={() => setSidebarOpen(false)}
              className="absolute top-8 right-8 p-2.5 hover:bg-secondary rounded-xl text-muted-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 mb-12">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center"><Plus className="w-7 h-7 text-primary" /></div>
              <div>
                <h3 className="text-2xl font-black">Nouvelle Référence</h3>
                <p className="text-sm text-muted-foreground">Enrichissez votre catalogue professionnel.</p>
              </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Désignation du produit</label>
                 <input 
                   required
                   value={newItem.name}
                   onChange={e => setNewItem({...newItem, name: e.target.value})}
                   placeholder="ex: Câble RO2V 3G2.5"
                   className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                 />
               </div>

               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Catégorie</label>
                   <input 
                     value={newItem.category}
                     onChange={e => setNewItem({...newItem, category: e.target.value})}
                     placeholder="ex: Électricité"
                     className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Unité</label>
                   <input 
                     value={newItem.unit}
                     onChange={e => setNewItem({...newItem, unit: e.target.value})}
                     placeholder="ex: mètre, kg, sac..."
                     className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                   />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6 p-6 bg-secondary/30 rounded-[2rem] border border-border/50">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 ml-1">Prix d'Achat (€)</label>
                   <input 
                     type="number"
                     step="0.01"
                     value={newItem.purchase_price}
                     onChange={e => setNewItem({...newItem, purchase_price: Number(e.target.value)})}
                     className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Prix de Vente (€)</label>
                   <input 
                     type="number"
                     step="0.01"
                     value={newItem.selling_price}
                     onChange={e => setNewItem({...newItem, selling_price: Number(e.target.value)})}
                     className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                   />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Quantité en stock</label>
                   <input 
                     type="number"
                     required
                     value={newItem.quantity}
                     onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                     className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-rose-500 ml-1">Alerte Rupture</label>
                   <input 
                     type="number"
                     value={newItem.min_stock}
                     onChange={e => setNewItem({...newItem, min_stock: Number(e.target.value)})}
                     className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                   />
                 </div>
               </div>

               <div className="pt-10">
                 <button 
                   disabled={saving}
                   className="w-full bg-primary text-primary-foreground font-black py-5 rounded-[2rem] hover:opacity-90 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                 >
                   {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                   Enregistrer au catalogue
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
