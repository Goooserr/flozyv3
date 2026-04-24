'use client'

import React, { useState, useEffect } from 'react'
import { 
  Box, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Package,
  History,
  X,
  Loader2,
  CheckCircle2,
  Euro,
  Layers,
  MoreVertical,
  Trash2
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

  return (
    <div className="space-y-8 animate-in fade-in duration-700 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black tracking-tight">Catalogue & Stock</h2>
          <p className="text-muted-foreground text-sm">Gérez vos matériaux, vos prix et votre inventaire.</p>
        </div>
        <button 
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-3 px-6 py-3.5 bg-primary text-primary-foreground rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl shadow-primary/20"
        >
          <Plus className="w-5 h-5" /> Ajouter au catalogue
        </button>
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
