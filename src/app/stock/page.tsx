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
  CheckCircle2
} from 'lucide-react'
import { getStock, updateStockQuantity } from '@/lib/actions'
import { createClient } from '@/lib/supabase'

export default function StockPage() {
  const [stock, setStock] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', quantity: 0, unit: 'm', min_stock: 5 })
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // 'all', 'low', 'ok'
  const supabase = createClient()

  async function load() {
    const data = await getStock()
    setStock(data)
    setLoading(false)
  }

  const filteredStock = stock.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const isLow = Number(item.quantity) <= Number(item.min_stock)
    if (filter === 'low') return matchesSearch && isLow
    if (filter === 'ok') return matchesSearch && !isLow
    return matchesSearch
  })

  useEffect(() => {
    load()
  }, [])

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
      await supabase.from('stock').insert([{ ...newItem, artisan_id: user.id }])
      setSidebarOpen(false)
      setNewItem({ name: '', quantity: 0, unit: 'm', min_stock: 5 })
      load()
    }
    setSaving(false)
  }

  return (
    <div className="flex gap-8 animate-in fade-in duration-700 h-[calc(100vh-140px)]">
      {/* Main List Area */}
      <div className="flex-1 space-y-8 overflow-y-auto pr-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight">Gestion de Stock</h2>
            <p className="text-muted-foreground text-sm">Contrôlez vos ressources pour ne jamais manquer de matériel.</p>
          </div>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Ajouter un article
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-6">
           <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><TrendingUp className="w-5 h-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase">Total Articles</p>
                <p className="text-xl font-bold">{stock.length}</p>
              </div>
           </div>
           <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl"><AlertTriangle className="w-5 h-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase">Alertes Stock</p>
                <p className="text-xl font-bold text-rose-500">{stock.filter(s => s.quantity <= s.min_stock).length}</p>
              </div>
           </div>
           <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><History className="w-5 h-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase">Mouvements/Mois</p>
                <p className="text-xl font-bold">14</p>
              </div>
           </div>
        </div>

        {/* Instant Search & Filters */}
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 delay-200">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher un matériau (ex: Câble, Peinture...)"
              className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex bg-secondary/50 p-1 rounded-xl border border-border">
            <button 
              onClick={() => setFilter('all')}
              className={cn("px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all", filter === 'all' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
            >
              Tous
            </button>
            <button 
              onClick={() => setFilter('low')}
              className={cn("px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all", filter === 'low' ? "bg-rose-500 text-white shadow-sm" : "text-muted-foreground")}
            >
              Alertes
            </button>
          </div>
        </div>

        {filteredStock.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card border border-dashed border-border rounded-[2.5rem] text-center px-6">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Inventaire vierge</h3>
            <p className="text-muted-foreground max-w-sm mb-8">
              Saisissez vos fournitures récurrentes pour activer le suivi automatique.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 pb-10">
            {filteredStock.map((item) => {
              const isLow = Number(item.quantity) <= Number(item.min_stock)
              return (
                <div key={item.id} className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-all cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className={cn("p-4 rounded-xl", isLow ? "bg-rose-500/10 text-rose-500" : "bg-secondary text-muted-foreground")}>
                      <Box className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{item.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Dernière mise à jour : Aujourd'hui</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4 bg-secondary/50 rounded-xl px-2 py-1">
                       <button onClick={(e) => { e.stopPropagation(); handleQuantityUpdate(item.id, item.quantity, -1) }} className="w-8 h-8 flex items-center justify-center bg-card rounded-lg shadow-sm hover:bg-secondary transition-colors font-bold text-lg">-</button>
                       <div className="text-center min-w-[3rem]">
                         <p className={cn("text-xl font-black", isLow ? "text-rose-500" : "text-foreground")}>
                           {item.quantity} <span className="text-xs font-normal text-muted-foreground">{item.unit}</span>
                         </p>
                         <p className="text-[10px] text-muted-foreground uppercase font-bold">Qté</p>
                       </div>
                       <button onClick={(e) => { e.stopPropagation(); handleQuantityUpdate(item.id, item.quantity, 1) }} className="w-8 h-8 flex items-center justify-center bg-card rounded-lg shadow-sm hover:bg-secondary transition-colors font-bold text-lg">+</button>
                    </div>
                    {isLow && (
                       <div className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                         <AlertTriangle className="w-3 h-3" /> Critique
                       </div>
                    )}
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Sidebar Modal for adding items */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-card border-l border-border h-full p-10 animate-in slide-in-from-right-full duration-500 relative flex flex-col">
            <button 
              onClick={() => setSidebarOpen(false)}
              className="absolute top-6 right-6 p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-10">
              <div className="p-3 bg-primary/10 rounded-2xl"><Plus className="w-6 h-6 text-primary" /></div>
              <div>
                <h3 className="text-xl font-bold">Nouvel Article</h3>
                <p className="text-sm text-muted-foreground">Ajouter une référence à votre inventaire.</p>
              </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-6 flex-1">
               <div className="space-y-2">
                 <label className="text-sm font-bold ml-1">Nom du matériau</label>
                 <input 
                   required
                   value={newItem.name}
                   onChange={e => setNewItem({...newItem, name: e.target.value})}
                   placeholder="ex: Câble 2.5mm²"
                   className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                 />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-sm font-bold ml-1">Quantité initiale</label>
                   <input 
                     type="number"
                     required
                     value={newItem.quantity}
                     onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                     className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold ml-1">Unité</label>
                   <select 
                     value={newItem.unit}
                     onChange={e => setNewItem({...newItem, unit: e.target.value})}
                     className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                   >
                     <option value="unité">Unité(s)</option>
                     <option value="m">Mètre(s)</option>
                     <option value="L">Litre(s)</option>
                     <option value="kg">Kg</option>
                     <option value="sac">Sac(s)</option>
                   </select>
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-sm font-bold ml-1 flex items-center justify-between">
                   Seuil d'alerte
                   <span className="text-[10px] text-rose-500 font-black uppercase">Notification si inférieur</span>
                 </label>
                 <input 
                   type="number"
                   value={newItem.min_stock}
                   onChange={e => setNewItem({...newItem, min_stock: Number(e.target.value)})}
                   className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                 />
               </div>

               <div className="pt-10">
                 <button 
                   disabled={saving}
                   className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
                 >
                   {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                   Enregistrer l'article
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import { cn } from '@/lib/utils'
