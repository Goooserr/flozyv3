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
  Box,
  Loader2,
  ShieldAlert
} from 'lucide-react'
import { useTheme } from '@/components/DynamicThemeProvider'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { SignaturePad } from '@/components/SignaturePad'

export default function NewInvoicePage() {
  const router = useRouter()
  const { primaryColor, companyName, logoUrl } = useTheme()
  const [items, setItems] = useState([{ description: '', quantity: 1, price: 0, purchasePrice: 0, syncStock: false }])
  const [client, setClient] = useState({ id: '', name: '', address: '' })
  const [clients, setClients] = useState<any[]>([])
  const [catalogItems, setCatalogItems] = useState<any[]>([])
  const [showCatalog, setShowCatalog] = useState(false)
  const [loadingCatalog, setLoadingCatalog] = useState(false)
  const [showSignature, setShowSignature] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [docType, setDocType] = useState<'invoice' | 'quote'>('invoice')

  useEffect(() => {
    async function loadClients() {
      const { getClients } = await import('@/lib/actions')
      const data = await getClients()
      setClients(data)
    }
    loadClients()
  }, [])

  async function openCatalog() {
    setShowCatalog(true)
    if (catalogItems.length > 0) return
    setLoadingCatalog(true)
    const { getStock } = await import('@/lib/actions')
    const stock = await getStock()
    // Garder uniquement les articles qui ont un prix de vente
    setCatalogItems(stock || [])
    setLoadingCatalog(false)
  }

  const handleSave = async () => {
    if (!client.name) {
      alert("Veuillez sélectionner ou saisir un client")
      return
    }

    setIsSaving(true)
    try {
      const totalHT = items.reduce((acc, item) => acc + (item.quantity * item.price), 0)
      const totalTTC = totalHT * 1.2
      const prefix = docType === 'invoice' ? 'FAC' : 'DEV'
      
      const { createDocument, updateStockQuantity, getStock } = await import('@/lib/actions')
      
      await createDocument({
        type: docType,
        document_number: `${prefix}-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        amount: totalTTC,
        status: signature ? (docType === 'invoice' ? 'paid' : 'accepted') : 'pending',
        client_id: client.id || null,
        metadata: {
          client_info: { name: client.name, address: client.address },
          items: items,
          signature: signature,
          subtotal: totalHT,
          tax: totalHT * 0.2,
          total_cost: items.reduce((acc, item) => acc + (item.quantity * (item.purchasePrice || 0)), 0)
        }
      })

      // Sync Stock Logic
      for (const item of items) {
        if (item.syncStock) {
           const stock = await getStock()
           const product = stock.find((s: any) => s.name === item.description)
           if (product) {
              await updateStockQuantity(product.id, Math.max(0, product.quantity - item.quantity))
           }
        }
      }
      
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
    { name: 'Main d\'œuvre Standard', description: 'Une heure de travail qualifié', price: 65, purchasePrice: 20 },
    { name: 'Forfait Diagnostic', description: 'Déplacement + 1h de recherche de panne', price: 120, purchasePrice: 30 },
    { name: 'Prise Legrand Dooxie', description: 'Prise de courant complète blanche', price: 15, purchasePrice: 8.5 },
    { name: 'Câble RO2V 3G2.5', description: 'Prix au mètre linéaire', price: 2.50, purchasePrice: 1.10 },
  ]

  const selectFromCatalog = (catalogItem: any) => {
    setItems([...items, { 
      description: catalogItem.name, 
      quantity: 1, 
      price: Number(catalogItem.selling_price || catalogItem.price || 0), 
      purchasePrice: Number(catalogItem.purchase_price || catalogItem.purchasePrice || 0), 
      syncStock: true 
    }])
    setShowCatalog(false)
  }

  const totalHT = items.reduce((acc, item) => acc + (item.quantity * item.price), 0)
  const totalCost = items.reduce((acc, item) => acc + (item.quantity * (item.purchasePrice || 0)), 0)
  const margin = totalHT - totalCost
  const marginPercent = totalHT > 0 ? (margin / totalHT) * 100 : 0
  const tva = totalHT * 0.2
  const totalTTC = totalHT + tva

  const addItem = () => setItems([...items, { description: '', quantity: 1, price: 0, purchasePrice: 0, syncStock: false }])
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
        {/* Rendement Widget (Artisan Only) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex items-center justify-between overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="w-32 h-32 rotate-12" />
           </div>
           <div className="flex gap-12 items-center relative z-10">
              <div>
                 <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Coût Matériel Estimé</p>
                 <p className="text-2xl font-black text-white">{totalCost.toLocaleString()} €</p>
              </div>
              <div className="h-10 w-px bg-zinc-800" />
              <div>
                 <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Marge Brute HT</p>
                 <p className="text-2xl font-black text-emerald-400">+{margin.toLocaleString()} €</p>
              </div>
              <div className="h-10 w-px bg-zinc-800" />
              <div>
                 <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Rendement</p>
                 <div className="flex items-center gap-2">
                    <p className="text-2xl font-black text-white">{marginPercent.toFixed(1)} %</p>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter",
                      marginPercent > 40 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                    )}>
                      {marginPercent > 40 ? 'Excellent' : 'À surveiller'}
                    </span>
                 </div>
              </div>
           </div>
           <div className="hidden md:block text-right">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Visible uniquement par vous</p>
              <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs justify-end">
                 <ShieldAlert className="w-3 h-3 text-amber-500" /> Analyse de rentabilité active
              </div>
           </div>
        </div>
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
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
            {isSaving ? 'Enregistrement...' : 'Finaliser le Document'}
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Informations Client</h3>
              </div>
              {clients.length > 0 && (
                <select 
                  className="bg-secondary/50 border border-border rounded-lg px-2 py-1 text-[10px] font-bold outline-none"
                  onChange={(e) => {
                    const c = clients.find(cl => cl.id === e.target.value)
                    if (c) setClient({ id: c.id, name: c.full_name, address: c.address || '' })
                  }}
                >
                  <option value="">Sélectionner un client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              )}
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
                  onClick={() => openCatalog()}
                  className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3" /> Catalogue
                </button>
                <button 
                  onClick={addItem}
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3" /> Manuel
                </button>
              </div>
            </div>

            {/* Catalog Modal - Vrais articles du stock */}
            {showCatalog && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold">Votre Catalogue</h3>
                      <p className="text-xs text-muted-foreground">Articles ajoutés dans votre espace Stock</p>
                    </div>
                    <button onClick={() => setShowCatalog(false)} className="p-2 hover:bg-secondary rounded-lg"><XIcon className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                  {loadingCatalog ? (
                    <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                  ) : catalogItems.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Box className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="font-bold">Aucun article dans le catalogue</p>
                      <p className="text-xs mt-1">Ajoutez des articles dans votre espace Stock pour les retrouver ici.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 max-h-[420px] overflow-y-auto pr-2">
                      {catalogItems.map((item: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => selectFromCatalog(item)}
                          className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group text-left"
                        >
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary">{item.category || 'Général'}</span>
                            <p className="font-bold">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Stock : {item.quantity} {item.unit}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-primary text-lg">{Number(item.selling_price || 0)} €</p>
                            <p className="text-[9px] text-muted-foreground">Prix de vente</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="space-y-3 p-4 bg-secondary/20 rounded-2xl border border-border/50 animate-in slide-in-from-left-4 duration-300">
                  <div className="flex gap-4">
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
                    <button 
                      onClick={() => removeItem(index)}
                      className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Qté</label>
                      <input 
                        type="number"
                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        value={item.quantity}
                        onChange={e => {
                          const newItems = [...items]
                          newItems[index].quantity = Number(e.target.value)
                          setItems(newItems)
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Prix Vente HT</label>
                      <input 
                        type="number"
                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        value={item.price}
                        onChange={e => {
                          const newItems = [...items]
                          newItems[index].price = Number(e.target.value)
                          setItems(newItems)
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-primary ml-1">Prix Achat HT</label>
                      <input 
                        type="number"
                        className="w-full bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                        value={item.purchasePrice}
                        onChange={e => {
                          const newItems = [...items]
                          newItems[index].purchasePrice = Number(e.target.value)
                          setItems(newItems)
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-center pt-5 gap-2">
                       <button 
                        title="Lier au stock"
                        onClick={() => {
                          const newItems = [...items]
                          newItems[index].syncStock = !newItems[index].syncStock
                          setItems(newItems)
                        }}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all text-[10px] font-bold uppercase", 
                          item.syncStock ? "text-primary bg-primary/10 border border-primary/20" : "text-muted-foreground bg-secondary/50 border border-border"
                        )}
                      >
                        <Box className="w-3 h-3" /> {item.syncStock ? 'Lié' : 'Stock'}
                      </button>
                    </div>
                  </div>
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
              <h1 className="text-9xl font-black italic">{companyName || 'FLOZY'}</h1>
            </div>

            <div className="flex justify-between items-start mb-20 relative z-10">
              <div className="space-y-4">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
                ) : (
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                    <Sparkles className="w-10 h-10" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter">{companyName || 'Votre Entreprise'}</h2>
                  <p className="text-[10px] text-zinc-500 max-w-[200px]">SIRET: 123 456 789 00010<br/>Code APE: 4321A</p>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-4xl font-black tracking-tighter mb-1">{docType === 'quote' ? 'DEVIS' : 'FACTURE'}</h1>
                <p className="text-xs font-bold text-zinc-400">#DRAFT-{new Date().getFullYear()}</p>
                <div className="mt-8 text-xs text-right">
                  <p className="font-bold uppercase text-[10px] text-zinc-400 mb-1 tracking-widest">Facturé à :</p>
                  <p className="font-bold text-base">{client.name || 'Nom Client'}</p>
                  <p className="text-zinc-500 whitespace-pre-line">{client.address || 'Adresse Client'}</p>
                </div>
              </div>
            </div>

            <table className="w-full text-left border-collapse relative z-10">
              <thead>
                <tr className="border-b-2 border-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <th className="py-4">Description</th>
                  <th className="py-4 w-16 text-center">Qté</th>
                  <th className="py-4 w-24 text-right">Prix HT</th>
                  <th className="py-4 w-24 text-right">Total HT</th>
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

            <div className="mt-auto pt-12 flex justify-between items-end relative z-10">
               <div className="text-[10px] space-y-1">
                 <p className="font-bold text-zinc-400 uppercase tracking-widest mb-2">Bon pour accord</p>
                 <p className="text-zinc-300 italic">Mention "Bon pour accord" manuscrite</p>
                 <div className="w-48 h-20 border-b-2 border-zinc-900/10 mt-2 flex items-center justify-center relative">
                    {signature ? (
                      <img src={signature} alt="Signature Client" className="max-h-full max-w-full mix-blend-multiply relative z-10" />
                    ) : (
                      <span className="text-[8px] text-zinc-200 uppercase font-bold">Signature client attendue</span>
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
               Dispositions légales - {docType === 'quote' ? 'Devis valable 30 jours' : 'Facture payable sous 30 jours'}. <br/>
               Aucun escompte consenti pour paiement anticipé. {companyName || 'Flozy'} - Logiciel de gestion artisan.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
