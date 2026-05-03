'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  FileText,
  Plus,
  Trash2,
  Send,
  Download,
  CheckCircle2,
  User,
  Package,
  Loader2,
  PenTool,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  Clock,
  Euro,
  X as XIcon,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SignaturePad } from '@/components/SignaturePad'
import { useTheme } from '@/components/DynamicThemeProvider'
import { useToast } from '@/components/ToastProvider'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface QuoteItem {
  description: string
  quantity: number
  price: number
  purchasePrice: number
  syncStock: boolean
  mode: 'manual' | 'catalog'
  catalogItemId?: string
}

export default function QuoteInstantPage() {
  const router = useRouter()
  const { primaryColor, companyName, logoUrl, siret, apeCode, hourlyRate } = useTheme()
  const { toast } = useToast()
  const [step, setStep] = useState<1 | 2 | 3>(1) // 1: Client, 2: Items, 3: Sign & Send
  const [clients, setClients] = useState<any[]>([])
  const [catalogItems, setCatalogItems] = useState<any[]>([])
  const [client, setClient] = useState({ id: '', name: '', address: '', email: '', phone: '' })
  const [items, setItems] = useState<QuoteItem[]>([
    { description: '', quantity: 1, price: 0, purchasePrice: 0, syncStock: false, mode: 'manual' }
  ])
  const [signature, setSignature] = useState<string | null>(null)
  const [showSignature, setShowSignature] = useState(false)
  const [showCatalogPicker, setShowCatalogPicker] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [savedDocId, setSavedDocId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { getClients, getStock } = await import('@/lib/actions')
      const [c, s] = await Promise.all([getClients(), getStock()])
      setClients(c || [])
      setCatalogItems(s || [])
    }
    load()
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const totalHT = items.reduce((a, i) => a + i.quantity * i.price, 0)
  const totalTTC = totalHT * 1.2
  const totalCost = items.reduce((a, i) => a + i.quantity * i.purchasePrice, 0)
  const margin = totalHT - totalCost

  const addItem = (mode: 'manual' | 'catalog' = 'manual') => {
    setItems([...items, { description: '', quantity: 1, price: 0, purchasePrice: 0, syncStock: false, mode }])
  }

  const updateItem = (i: number, field: keyof QuoteItem, val: any) => {
    const n = [...items]
    n[i] = { ...n[i], [field]: val }
    setItems(n)
  }

  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))

  const addFromCatalog = (cat: any) => {
    setItems([...items, {
      description: cat.name,
      quantity: 1,
      price: Number(cat.selling_price || 0),
      purchasePrice: Number(cat.purchase_price || 0),
      syncStock: true,
      mode: 'catalog',
      catalogItemId: cat.id
    }])
    setShowCatalogPicker(false)
  }

  async function handleSave(sendEmail = false) {
    if (!client.name) { showToast('⚠️ Sélectionnez un client'); return }
    if (items.some(i => !i.description)) { showToast('⚠️ Complétez toutes les lignes'); return }

    setIsSaving(true)
    try {
      const { createDocument } = await import('@/lib/actions')
      const docNum = `DEV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`
      const doc = await createDocument({
        type: 'quote',
        document_number: docNum,
        amount: totalTTC,
        status: signature ? 'accepted' : 'pending',
        client_id: client.id || null,
        metadata: {
          client_info: { name: client.name, address: client.address, email: client.email },
          items: items.map(i => ({ ...i })),
          signature,
          subtotal: totalHT,
          tax: totalHT * 0.2,
          total_cost: totalCost,
        }
      })
      setSavedDocId(doc.id)

      // Bug #3 FIX — Sync stock par catalogItemId
      for (const item of items) {
        if (item.syncStock && item.catalogItemId) {
          const stock = await getStock()
          const product = stock.find((s: any) => s.id === item.catalogItemId)
          if (product) {
            await updateStockQuantity(product.id, Math.max(0, product.quantity - item.quantity))
          }
        }
      }

      if (sendEmail && client.email && doc.id) {
        setIsSending(true)
        await fetch('/api/send-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId: doc.id,
            clientEmail: client.email,
            clientName: client.name,
            amount: totalTTC,
            documentNumber: docNum,
            type: 'quote',
          })
        })
        setIsSending(false)
        toast(`📧 Devis envoyé à ${client.email} !`, 'success')
      } else {
        toast('✅ Devis sauvegardé !', 'success')
      }

      setStep(3)
    } catch (e: any) {
      toast('Erreur: ' + e.message, 'error')
    } finally {
      setIsSaving(false)
      setIsSending(false)
    }
  }

  async function convertToInvoice() {
    if (!savedDocId) return
    localStorage.setItem('invoice_draft', JSON.stringify({
      items: items.map(i => ({ ...i })),
      client,
      intervention_id: null,
      from_quote_id: savedDocId
    }))
    router.push('/invoices/new')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-700 pb-24">
      {/* Toast */}
      {/* Toasts removed — now global */}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/invoices" className="p-2 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-1">
            <Zap className="w-4 h-4" /> Devis Instantané
          </div>
          <h1 className="text-2xl font-black tracking-tight">Nouveau Devis Terrain</h1>
        </div>
        {/* Live margin widget */}
        <div className="hidden md:flex items-center gap-4 bg-zinc-900 text-white rounded-2xl px-6 py-3">
          <div className="text-center">
            <p className="text-[9px] font-black uppercase text-zinc-500">Marge</p>
            <p className="text-lg font-black text-emerald-400">+{margin.toFixed(0)}€</p>
          </div>
          <div className="w-px h-8 bg-zinc-700" />
          <div className="text-center">
            <p className="text-[9px] font-black uppercase text-zinc-500">Total TTC</p>
            <p className="text-lg font-black">{totalTTC.toFixed(2)}€</p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {[
          { n: 1, label: 'Client' },
          { n: 2, label: 'Prestations' },
          { n: 3, label: 'Finaliser' }
        ].map((s, idx) => (
          <React.Fragment key={s.n}>
            <button
              onClick={() => step > s.n && setStep(s.n as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all',
                step === s.n
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : step > s.n
                  ? 'bg-emerald-500/10 text-emerald-500 cursor-pointer hover:bg-emerald-500/20'
                  : 'text-muted-foreground cursor-default'
              )}
            >
              {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[9px]">{s.n}</span>}
              {s.label}
            </button>
            {idx < 2 && <div className={cn('flex-1 h-0.5 mx-2 rounded-full', step > s.n ? 'bg-emerald-500/40' : 'bg-border')} />}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 1 — CLIENT */}
      {step === 1 && (
        <div className="bg-card border border-border rounded-3xl p-8 space-y-6 animate-in slide-in-from-right-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black">Qui est le client ?</h2>
              <p className="text-sm text-muted-foreground">Sélectionnez ou saisissez manuellement</p>
            </div>
          </div>

          {clients.length > 0 && (
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Client existant</label>
              <select
                className="w-full bg-secondary/50 border border-border rounded-2xl px-4 py-4 text-sm outline-none focus:border-primary transition-colors"
                value={client.id}
                onChange={e => {
                  const c = clients.find(cl => cl.id === e.target.value)
                  if (c) setClient({ id: c.id, name: c.full_name, address: c.address || '', email: c.email || '', phone: c.phone || '' })
                  else setClient({ id: '', name: '', address: '', email: '', phone: '' })
                }}
              >
                <option value="">— Choisir dans la liste —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Nom *</label>
              <input
                required
                placeholder="Martin Dupont"
                className="w-full bg-secondary/50 border border-border rounded-2xl px-4 py-4 text-sm outline-none focus:border-primary transition-colors font-medium"
                value={client.name}
                onChange={e => setClient({ ...client, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Email</label>
              <input
                type="email"
                placeholder="martin@exemple.fr"
                className="w-full bg-secondary/50 border border-border rounded-2xl px-4 py-4 text-sm outline-none focus:border-primary transition-colors font-medium"
                value={client.email}
                onChange={e => setClient({ ...client, email: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Adresse</label>
              <input
                placeholder="12 rue de la Paix, 75001 Paris"
                className="w-full bg-secondary/50 border border-border rounded-2xl px-4 py-4 text-sm outline-none focus:border-primary transition-colors font-medium"
                value={client.address}
                onChange={e => setClient({ ...client, address: e.target.value })}
              />
            </div>
          </div>

          <button
            onClick={() => { if (!client.name) { showToast('⚠️ Nom requis'); return } setStep(2) }}
            className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.01] text-sm"
          >
            Suivant — Ajouter les prestations <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* STEP 2 — ITEMS */}
      {step === 2 && (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          <div className="bg-card border border-border rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black">Prestations & Matériaux</h2>
                  <p className="text-sm text-muted-foreground">Pour <span className="text-foreground font-bold">{client.name}</span></p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCatalogPicker(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Catalogue
                </button>
                <button
                  onClick={() => addItem('manual')}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl text-xs font-bold hover:bg-secondary/80 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Manuel
                </button>
              </div>
            </div>

            {showCatalogPicker && (
              <div className="mb-6 bg-secondary/30 border border-border rounded-2xl p-4 max-h-48 overflow-y-auto">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Articles du catalogue :</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {catalogItems.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => addFromCatalog(cat)}
                      className="text-left p-3 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <p className="text-xs font-bold truncate">{cat.name}</p>
                      <p className="text-[10px] text-primary font-black mt-0.5">{Number(cat.selling_price || 0)} €</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex gap-3 items-start p-4 bg-secondary/20 rounded-2xl border border-border/50 animate-in slide-in-from-left-4">
                  <div className="flex-1 grid grid-cols-6 gap-3">
                    <input
                      placeholder="Description de la prestation..."
                      className="col-span-6 md:col-span-3 bg-transparent border-b border-border py-2 text-sm outline-none focus:border-primary transition-colors font-medium"
                      value={item.description}
                      onChange={e => updateItem(i, 'description', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Qté"
                      className="col-span-2 md:col-span-1 bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm outline-none text-center font-bold"
                      value={item.quantity || ''}
                      onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      placeholder="Prix HT"
                      className="col-span-2 md:col-span-1 bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-3 py-2 text-sm outline-none text-center font-black text-emerald-500"
                      value={item.price || ''}
                      onChange={e => updateItem(i, 'price', Number(e.target.value))}
                    />
                    <div className="col-span-2 md:col-span-1 flex items-center justify-end">
                      <p className="text-xs font-black text-muted-foreground">{(item.quantity * item.price).toFixed(0)} €</p>
                    </div>
                  </div>
                  <button onClick={() => removeItem(i)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t border-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">{items.length} ligne{items.length > 1 ? 's' : ''}</span> · Marge brute : <span className="text-emerald-500 font-black">+{margin.toFixed(0)} €</span>
              </div>
              <div className="text-right space-y-1">
                <div className="flex justify-end gap-8 text-xs text-muted-foreground">
                  <span>HT</span><span className="font-bold text-foreground">{totalHT.toFixed(2)} €</span>
                </div>
                <div className="flex justify-end gap-8 text-xs text-muted-foreground">
                  <span>TVA 20%</span><span className="font-bold text-foreground">{(totalHT * 0.2).toFixed(2)} €</span>
                </div>
                <div className="flex justify-end gap-8 text-xl font-black">
                  <span>TTC</span><span style={{ color: primaryColor }}>{totalTTC.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 py-5 bg-secondary border border-border rounded-2xl font-black text-sm hover:bg-secondary/80 transition-all"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Download className="w-5 h-5" /> Sauvegarder</>}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving || !client.email}
              className={cn(
                'flex items-center justify-center gap-2 py-5 rounded-2xl font-black text-sm transition-all',
                client.email
                  ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 hover:scale-[1.01]'
                  : 'bg-secondary text-muted-foreground cursor-not-allowed opacity-60'
              )}
              title={!client.email ? 'Ajoutez un email client pour envoyer' : ''}
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Envoyer par Email</>}
            </button>
          </div>

          {/* Signature CTA */}
          {!signature ? (
            <button
              onClick={() => setShowSignature(true)}
              className="w-full py-4 border-2 border-dashed border-primary/30 rounded-2xl text-primary font-bold text-sm hover:border-primary/60 hover:bg-primary/5 transition-all flex items-center justify-center gap-3"
            >
              <PenTool className="w-5 h-5" /> Faire signer le client maintenant (optionnel)
            </button>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              <div>
                <p className="font-bold text-sm text-emerald-500">Signature cliente obtenue ✓</p>
                <p className="text-xs text-muted-foreground">Le devis sera marqué comme accepté lors de la sauvegarde.</p>
              </div>
              <img src={signature} className="h-10 ml-auto invert dark:invert-0 opacity-80" alt="Signature" />
            </div>
          )}
        </div>
      )}

      {/* STEP 3 — SUCCESS */}
      {step === 3 && (
        <div className="bg-card border border-border rounded-3xl p-10 text-center animate-in zoom-in-95 space-y-6">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-3xl font-black mb-2">Devis Créé ! 🎉</h2>
            <p className="text-muted-foreground">
              Le devis pour <span className="font-bold text-foreground">{client.name}</span> a été sauvegardé.
              {client.email && ' Un email a été envoyé automatiquement.'}
            </p>
          </div>

          <div className="bg-secondary/30 border border-border rounded-2xl p-6 text-left">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-muted-foreground">Montant total TTC</span>
              <span className="text-2xl font-black">{totalTTC.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Marge brute estimée</span>
              <span className="text-lg font-black text-emerald-500">+{margin.toFixed(0)} €</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link
              href={savedDocId ? `/p/${savedDocId}` : '/invoices'}
              target={savedDocId ? '_blank' : undefined}
              className="flex items-center justify-center gap-2 py-4 bg-secondary rounded-2xl font-bold text-sm hover:bg-secondary/80 transition-colors"
            >
              <FileText className="w-5 h-5" /> Voir le devis
            </Link>
            <button
              onClick={convertToInvoice}
              className="flex items-center justify-center gap-2 py-4 bg-secondary rounded-2xl font-bold text-sm hover:bg-secondary/80 transition-colors"
            >
              <Euro className="w-5 h-5" /> Convertir en facture
            </button>
            <Link
              href="/invoices/new"
              onClick={() => {
                localStorage.removeItem('invoice_draft')
                setStep(1)
                setClient({ id: '', name: '', address: '', email: '', phone: '' })
                setItems([{ description: '', quantity: 1, price: 0, purchasePrice: 0, syncStock: false, mode: 'manual' }])
                setSignature(null)
                setSavedDocId(null)
              }}
              className="flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-sm hover:opacity-90 transition-all"
            >
              <Plus className="w-5 h-5" /> Nouveau Devis
            </Link>
          </div>
        </div>
      )}

      {showSignature && (
        <SignaturePad
          onSave={(data) => { setSignature(data); setShowSignature(false); toast('✍️ Signature enregistrée !', 'success') }}
          onCancel={() => setShowSignature(false)}
        />
      )}
    </div>
  )
}
