'use client'

import React, { useState, useEffect } from 'react'
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Plus,
  RefreshCw,
  Edit3,
  Loader2,
  X as XIcon,
  CheckCircle2,
  BarChart3,
  ShoppingCart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/DynamicThemeProvider'

interface StockItem {
  id: string
  name: string
  quantity: number
  min_quantity?: number
  purchase_price: number
  selling_price: number
  category?: string
  unit?: string
}

export default function StockAlertsPage() {
  const { primaryColor } = useTheme()
  const [items, setItems] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editMinQty, setEditMinQty] = useState<number>(0)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [showOrderSheet, setShowOrderSheet] = useState(false)

  async function loadItems() {
    const { getStock } = await import('@/lib/actions')
    const data = await getStock()
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { loadItems() }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function saveMinQty(id: string) {
    setSaving(true)
    try {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      await supabase.from('stock').update({ min_quantity: editMinQty }).eq('id', id)
      showToast('✅ Seuil d\'alerte mis à jour !')
      setEditingId(null)
      loadItems()
    } catch (e) {
      showToast('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const lowStock = items.filter(i => i.min_quantity && i.quantity <= i.min_quantity)
  const outOfStock = items.filter(i => i.quantity === 0)
  const healthy = items.filter(i => !i.min_quantity || i.quantity > i.min_quantity)

  const getStatusConfig = (item: StockItem) => {
    if (item.quantity === 0) return { label: 'Rupture', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', bar: 'bg-rose-500', pct: 0 }
    if (item.min_quantity && item.quantity <= item.min_quantity) return { label: 'Stock bas', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', bar: 'bg-amber-500', pct: (item.quantity / (item.min_quantity * 2)) * 100 }
    return { label: 'OK', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', bar: 'bg-emerald-500', pct: 100 }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20 max-w-5xl mx-auto">
      {toast && (
        <div className="fixed top-6 right-6 z-[200] bg-zinc-900 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 flex items-center gap-3">
          {toast}
          <button onClick={() => setToast(null)}><XIcon className="w-4 h-4 opacity-60" /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-1">
            <Package className="w-4 h-4" /> Alertes Stock
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Surveillance du Stock</h2>
          <p className="text-muted-foreground">Ne manquez plus jamais de matériel sur un chantier.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadItems} className="p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          {lowStock.length + outOfStock.length > 0 && (
            <button
              onClick={() => setShowOrderSheet(true)}
              className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20"
            >
              <ShoppingCart className="w-4 h-4" /> Bon de commande
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={cn('rounded-3xl p-6 border', outOfStock.length > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-secondary/30 border-border')}>
          <AlertTriangle className={cn('w-6 h-6 mb-3', outOfStock.length > 0 ? 'text-rose-500' : 'text-muted-foreground')} />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Ruptures</p>
          <p className={cn('text-3xl font-black', outOfStock.length > 0 ? 'text-rose-500' : 'text-foreground')}>{outOfStock.length}</p>
          <p className="text-xs text-muted-foreground mt-1">articles à 0 en stock</p>
        </div>
        <div className={cn('rounded-3xl p-6 border', lowStock.length > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-secondary/30 border-border')}>
          <TrendingDown className={cn('w-6 h-6 mb-3', lowStock.length > 0 ? 'text-amber-500' : 'text-muted-foreground')} />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Stock Bas</p>
          <p className={cn('text-3xl font-black', lowStock.length > 0 ? 'text-amber-500' : 'text-foreground')}>{lowStock.length}</p>
          <p className="text-xs text-muted-foreground mt-1">sous le seuil d'alerte</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-3" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Articles OK</p>
          <p className="text-3xl font-black text-emerald-500">{healthy.length}</p>
          <p className="text-xs text-muted-foreground mt-1">au-dessus du seuil</p>
        </div>
      </div>

      {/* Priority alerts */}
      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6">
          <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2 mb-4 text-amber-500">
            <AlertTriangle className="w-4 h-4" /> Articles nécessitant une action
          </h3>
          <div className="space-y-2">
            {[...outOfStock, ...lowStock].slice(0, 6).map(item => {
              const cfg = getStatusConfig(item)
              return (
                <div key={item.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className={cn('text-[9px] font-black uppercase px-2 py-0.5 rounded-full', cfg.bg, cfg.color)}>{cfg.label}</span>
                    <span className="font-bold text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black">{item.quantity} {item.unit || 'unités'}</span>
                    {item.min_quantity && <span className="text-xs text-muted-foreground">/ min {item.min_quantity}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Full stock table */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-black flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Tous les Articles ({items.length})
          </h3>
          <p className="text-xs text-muted-foreground">Définissez un seuil d'alerte par article</p>
        </div>
        <div className="divide-y divide-border">
          {items.map(item => {
            const cfg = getStatusConfig(item)
            const isEditing = editingId === item.id
            return (
              <div key={item.id} className="p-5 flex items-center gap-4 hover:bg-secondary/10 transition-colors">
                {/* Status bar */}
                <div className="w-2 h-10 rounded-full bg-border overflow-hidden shrink-0">
                  <div className={cn('w-full rounded-full transition-all', cfg.bar)} style={{ height: `${Math.min(cfg.pct, 100)}%` }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-sm truncate">{item.name}</p>
                    <span className={cn('text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full shrink-0', cfg.bg, cfg.color)}>{cfg.label}</span>
                  </div>
                  {item.category && <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.category}</p>}
                </div>

                {/* Qty */}
                <div className="text-center shrink-0">
                  <p className="text-xl font-black">{item.quantity}</p>
                  <p className="text-[10px] text-muted-foreground">{item.unit || 'unités'}</p>
                </div>

                {/* Min qty editor */}
                <div className="flex items-center gap-2 shrink-0">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editMinQty}
                        onChange={e => setEditMinQty(Number(e.target.value))}
                        className="w-20 bg-secondary border border-primary/50 rounded-xl px-3 py-2 text-sm text-center font-bold outline-none"
                        autoFocus
                        min={0}
                      />
                      <button
                        onClick={() => saveMinQty(item.id)}
                        disabled={saving}
                        className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-2 text-muted-foreground hover:text-foreground">
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingId(item.id); setEditMinQty(item.min_quantity || 0) }}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-xl transition-all"
                    >
                      <Edit3 className="w-3 h-3" />
                      Seuil: {item.min_quantity ?? '—'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Order Sheet Modal */}
      {showOrderSheet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-black flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" /> Bon de Commande
              </h3>
              <button onClick={() => setShowOrderSheet(false)} className="p-2 bg-secondary rounded-xl">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-sm text-muted-foreground mb-4">Articles à commander pour remettre le stock au niveau minimum :</p>
              {[...outOfStock, ...lowStock].map(item => {
                const toOrder = Math.max(0, (item.min_quantity || 5) * 2 - item.quantity)
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border">
                    <div>
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Stock actuel: {item.quantity} · Seuil: {item.min_quantity || '?'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-primary">+{toOrder}</p>
                      <p className="text-[10px] text-muted-foreground">à commander</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <button
                onClick={() => {
                  const lines = [...outOfStock, ...lowStock]
                    .map(i => `${i.name}: ${Math.max(0, (i.min_quantity || 5) * 2 - i.quantity)} ${i.unit || 'unités'} (Prix achat: ${i.purchase_price}€)`)
                    .join('\n')
                  const blob = new Blob([`BON DE COMMANDE FLOZY\n${new Date().toLocaleDateString('fr-FR')}\n\n${lines}`], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url; a.download = `bon-commande-${new Date().toISOString().slice(0, 10)}.txt`; a.click()
                  showToast('📄 Bon de commande exporté !')
                }}
                className="flex-1 py-4 bg-secondary rounded-2xl font-black text-sm hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
              >
                Exporter TXT
              </button>
              <button onClick={() => window.print()} className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-sm hover:opacity-90 shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                Imprimer PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
