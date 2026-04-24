'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Trash2, 
  Download, 
  Send, 
  FileText, 
  User, 
  ChevronLeft,
  Sparkles,
  Box
} from 'lucide-react'
import { useTheme } from '@/components/DynamicThemeProvider'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { createDocument } from '@/lib/actions'
import { SignaturePad } from '@/components/SignaturePad'

export default function NewInvoicePage() {
  const router = useRouter()
  const { primaryColor } = useTheme()
  const [items, setItems] = useState([{ description: 'Installation tableau électrique', quantity: 1, price: 1200, syncStock: false }])
  const [client, setClient] = useState({ name: 'Jean Dupont', address: '12 rue de la Paix, Chambéry' })
  const [showCatalog, setShowCatalog] = useState(false)
  const [showSignature, setShowSignature] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [docType, setDocType] = useState<'invoice' | 'quote'>('invoice')

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const totalHT = items.reduce((acc, item) => acc + (item.quantity * item.price), 0)
      const totalTTC = totalHT * 1.2
      const prefix = docType === 'invoice' ? 'FAC' : 'DEV'
      
      await createDocument({
        type: docType,
        document_number: `${prefix}-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        amount: totalTTC,
        status: signature ? (docType === 'invoice' ? 'paid' : 'accepted') : 'pending',
        metadata: {
          client_info: client,
          items: items,
          signature: signature,
          subtotal: totalHT,
          tax: totalHT * 0.2
        }
      })
      
      localStorage.removeItem('invoice_draft')
      router.push('/invoices')
    } catch (error) {
      console.error(error)
      alert("Erreur lors de la sauvegarde")
    } finally {
      setIsSaving(false)
    }
  }

  // Effet pour charger le brouillon local (Anti-Coupure)
  useEffect(() => {
    const draft = localStorage.getItem('invoice_draft')
    if (draft) {
      const { items: dItems, client: dClient } = JSON.parse(draft)
      setItems(dItems)
      setClient(dClient)
    }
  }, [])

  // Effet pour sauvegarder le brouillon (Anti-Coupure)
  useEffect(() => {
    localStorage.setItem('invoice_draft', JSON.stringify({ items, client }))
  }, [items, client])
  
  // Catalogue factice pour la démo
  const catalog = [
    { name: 'Main d\'œuvre Standard', description: 'Une heure de travail qualifié', price: 65 },
    { name: 'Forfait Diagnostic', description: 'Déplacement + 1h de recherche de panne', price: 120 },
    { name: 'Prise Legrand Dooxie', description: 'Prise de courant complète blanche', price: 15 },
    { name: 'Câble RO2V 3G2.5', description: 'Prix au mètre linéaire', price: 2.50 },
  ]

  const selectFromCatalog = (catalogItem: any) => {
    setItems([...items, { description: catalogItem.name, quantity: 1, price: catalogItem.price, syncStock: true }])
    setShowCatalog(false)
  }

  const totalHT = items.reduce((acc, item) => acc + (item.quantity * item.price), 0)
  const tva = totalHT * 0.2
  const totalTTC = totalHT + tva

  const addItem = () => setItems([...items, { description: '', quantity: 1, price: 0, syncStock: false }])
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Link href="/invoices" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="w-4 h-4" /> Retour
              </Link>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md text-[8px] font-black uppercase border border-emerald-500/20">
                 <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Brouillon Sécurisé
              </div>
            </div>
          </div>
          
          <div className="flex bg-secondary/50 p-1 rounded-xl border border-border w-fit">
            <button 
              onClick={() => setDocType('quote')}
              className={cn("px-6 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all", docType === 'quote' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              Devis
            </button>
            <button 
              onClick={() => setDocType('invoice')}
              className={cn("px-6 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all", docType === 'invoice' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              Facture
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSignature(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800 text-white rounded-xl font-bold hover:bg-zinc-700 transition-all text-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-500" /> Signer
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-foreground rounded-xl font-bold hover:bg-secondary/80 transition-all text-sm"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            style={{ backgroundColor: primaryColor }}
            className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl font-bold hover:opacity-90 transition-all text-sm shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {isSaving ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
            {isSaving ? 'Enregistrement...' : 'Finaliser'}
          </button>
        </div>

      {/* Signature Modal */}
      {showSignature && (
        <SignaturePad 
          onSave={(data) => {
            setSignature(data)
            setShowSignature(false)
          }} 
          onCancel={() => setShowSignature(false)} 
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Éditeur */}
        <div className="space-y-8">
          <section className="bg-card border border-border rounded-3xl p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-bold">Informations Client</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <input 
                placeholder="Nom du client"
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={client.name}
                onChange={e => setClient({...client, name: e.target.value})}
              />
              <textarea 
                placeholder="Adresse de facturation"
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                value={client.address}
                onChange={e => setClient({...client, address: e.target.value})}
              />
            </div>
          </section>

          <section className="bg-card border border-border rounded-3xl p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Détails des prestations</h3>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowCatalog(true)}
                  className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Catalogue
                </button>
                <button 
                  onClick={addItem}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Manuel
                </button>
              </div>
            </div>

            {/* Catalog Modal */}
            {showCatalog && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold">Votre Catalogue</h3>
                    <button onClick={() => setShowCatalog(false)} className="p-2 hover:bg-secondary rounded-lg"><Trash2 className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {catalog.map((cat, i) => (
                      <button 
                        key={i}
                        onClick={() => selectFromCatalog(cat)}
                        className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                      >
                        <div className="text-left">
                          <p className="font-bold">{cat.name}</p>
                          <p className="text-xs text-muted-foreground">{cat.description}</p>
                        </div>
                        <span className="font-bold text-primary">{cat.price} €</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-8 text-center text-xs text-muted-foreground italic">
                    Astuce : Configurez vos prestations récurrentes dans les réglages pour gagner du temps.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 animate-in slide-in-from-left-4 duration-300">
                  <input 
                    placeholder="Description"
                    className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    value={item.description}
                    onChange={e => {
                      const newItems = [...items]
                      newItems[index].description = e.target.value
                      setItems(newItems)
                    }}
                  />
                  <input 
                    type="number"
                    placeholder="Qté"
                    className="w-20 bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    value={item.quantity}
                    onChange={e => {
                      const newItems = [...items]
                      newItems[index].quantity = Number(e.target.value)
                      setItems(newItems)
                    }}
                  />
                  <input 
                    type="number"
                    placeholder="Prix"
                    className="w-28 bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={item.price}
                    onChange={e => {
                      const newItems = [...items]
                      newItems[index].price = Number(e.target.value)
                      setItems(newItems)
                    }}
                  />
                  <div className="flex flex-col items-center justify-center px-2">
                    <button 
                      title="Lier au stock"
                      onClick={() => {
                        const newItems = [...items]
                        newItems[index].syncStock = !newItems[index].syncStock
                        setItems(newItems)
                      }}
                      className={cn(
                        "p-2 rounded-lg transition-all", 
                        item.syncStock ? "text-primary bg-primary/10" : "text-muted-foreground bg-secondary/50"
                      )}
                    >
                      <Box className="w-4 h-4" />
                    </button>
                    <span className="text-[8px] font-black uppercase mt-1">Stock</span>
                  </div>
                  <button 
                    onClick={() => removeItem(index)}
                    className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Aperçu PDF */}
        <div className="sticky top-24 h-fit">
          <div className="bg-white text-black rounded-sm shadow-2xl p-12 min-h-[800px] flex flex-col relative overflow-hidden ring-1 ring-black/5">
            {/* Filigrane discret */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-[-45deg] pointer-events-none select-none">
              <h1 className="text-9xl font-black italic">FLOZY</h1>
            </div>

            <div className="flex justify-between items-start mb-20 relative z-10">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                   <Sparkles className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter">Votre Entreprise</h2>
                  <p className="text-[10px] text-zinc-500 max-w-[200px]">SIRET: 123 456 789 00010<br/>Code APE: 4321A</p>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-4xl font-black tracking-tighter mb-1">DEVIS</h1>
                <p className="text-xs font-bold text-zinc-400">#DEV-2024-001</p>
                <div className="mt-8 text-xs">
                  <p className="font-bold">Facturé à :</p>
                  <p className="text-zinc-500 mt-1">{client.name || 'Nom Client'}</p>
                  <p className="text-zinc-500">{client.address || 'Adresse Client'}</p>
                </div>
              </div>
            </div>

            <table className="w-full text-left border-collapse relative z-10">
              <thead>
                <tr className="border-b-2 border-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <th className="py-4">Description</th>
                  <th className="py-4 w-16 text-center">Qté</th>
                  <th className="py-4 w-24 text-right">Prix Unitaire</th>
                  <th className="py-4 w-24 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {items.map((item, i) => (
                  <tr key={i} className="text-sm">
                    <td className="py-4 font-medium">{item.description || 'Prestation sans nom'}</td>
                    <td className="py-4 text-center">{item.quantity}</td>
                    <td className="py-4 text-right">{item.price.toLocaleString()} €</td>
                    <td className="py-4 text-right font-bold">{(item.quantity * item.price).toLocaleString()} €</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-12 flex justify-between items-end relative z-10">
               <div className="text-[10px] space-y-1">
                 <p className="font-bold text-zinc-400 uppercase">Bon pour accord</p>
                 <p className="text-zinc-300 italic">Mention "Bon pour accord" manuscrite</p>
                 <div className="w-48 h-20 border-b border-zinc-100 mt-4 flex items-center justify-center">
                    {signature ? (
                      <img src={signature} alt="Signature Client" className="max-h-full max-w-full mix-blend-multiply" />
                    ) : (
                      <span className="text-[8px] text-zinc-200">Signature électronique attendue</span>
                    )}
                 </div>
               </div>
               <div className="w-64 space-y-2">
                 <div className="flex justify-between text-xs text-zinc-500">
                   <span>Total HT</span>
                   <span className="font-bold">{totalHT.toLocaleString()} €</span>
                 </div>
                 <div className="flex justify-between text-xs text-zinc-500">
                   <span>TVA (20%)</span>
                   <span className="font-bold">{tva.toLocaleString()} €</span>
                 </div>
                 <div className="flex justify-between text-xl font-black border-t-2 border-zinc-900 pt-4 mt-4">
                   <span>TOTAL TTC</span>
                   <span style={{ color: primaryColor }}>{totalTTC.toLocaleString()} €</span>
                 </div>
               </div>
            </div>

            <div className="mt-10 text-[8px] text-zinc-400 text-center border-t border-zinc-100 pt-6 relative z-10">
               Dispositions légales - Devis valable 30 jours à compter de sa date d'émission. 
               Payable sous 30 jours. Aucun escompte consenti pour paiement anticipé.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
