'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  CheckCircle2, 
  MapPin,
  Camera,
  Loader2,
  FileText,
  Navigation,
  Package,
  Euro,
  TrendingUp,
  ChevronDown,
  Archive,
  Play,
  Square,
  PenTool,
  Check
} from 'lucide-react'
import { SignaturePad } from '@/components/SignaturePad'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useTheme } from '@/components/DynamicThemeProvider'

export default function PlanningPage() {
  const { userRole } = useTheme()
  const [interventions, setInterventions] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [catalogItems, setCatalogItems] = useState<any[]>([])
  const [selectedCatalogLines, setSelectedCatalogLines] = useState<{id: string, name: string, qty: number, selling_price: number, purchase_price: number}[]>([])
  const [showCatalogPicker, setShowCatalogPicker] = useState(false)
  const [newIntervention, setNewIntervention] = useState({
    title: '',
    client_id: '',
    status: 'scheduled',
    start_time: '',
    address: '',
    description: ''
  })

  async function loadData() {
    const { getInterventions, getClients, getStock } = await import('@/lib/actions')
    const [intData, clientData, stockData] = await Promise.all([
      getInterventions(),
      getClients(),
      getStock()
    ])
    setInterventions(intData || [])
    setClients(clientData || [])
    setCatalogItems(stockData || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const totalSell = selectedCatalogLines.reduce((a, l) => a + l.qty * l.selling_price, 0)
  const totalCost = selectedCatalogLines.reduce((a, l) => a + l.qty * l.purchase_price, 0)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (userRole === 'employee') return
    setSaving(true)
    try {
      const { createIntervention } = await import('@/lib/actions')
      const descriptionPayload = selectedCatalogLines.length > 0
        ? JSON.stringify({ catalog_lines: selectedCatalogLines, total_sell: totalSell, total_cost: totalCost })
        : newIntervention.description

      if (!newIntervention.start_time) {
        alert("Veuillez sélectionner une date et une heure.")
        setSaving(false)
        return
      }

      // Calcul auto de l'heure de fin (1h plus tard) sécurisé
      const start = new Date(newIntervention.start_time)
      if (isNaN(start.getTime())) {
        alert("Date invalide.")
        setSaving(false)
        return
      }
      
      const end = new Date(start.getTime() + (60 * 60 * 1000))
      
      const result = await createIntervention({ 
        ...newIntervention, 
        description: descriptionPayload,
        start_time: start.toISOString(), // On s'assure du format ISO pour Supabase
        end_time: end.toISOString()
      })

      if (result?.error) throw new Error(result.error)

      setIsModalOpen(false)
      setNewIntervention({ title: '', client_id: '', status: 'scheduled', start_time: '', address: '', description: '' })
      setSelectedCatalogLines([])
      await loadData()
    } catch (err: any) {
      console.error("Détails de l'erreur creation planning:", err)
      alert("Erreur lors de la création : " + (err?.message || "Vérifiez les champs"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  const scheduled = interventions.filter(i => i.status === 'scheduled')
  const inProgress = interventions.filter(i => i.status === 'in_progress')
  const completed = interventions.filter(i => i.status === 'completed')

  return (
    <div className="space-y-8 animate-in fade-in duration-700 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-1">
            <CalendarIcon className="w-4 h-4" /> Carnet de Chantier
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Interventions & Photos</h2>
          <p className="text-muted-foreground">Pilotez vos chantiers et stockez vos preuves visuelles.</p>
        </div>
        {userRole !== 'employee' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Nouvelle Intervention
          </button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden pb-4">
        <KanbanColumn title="À Faire" icon={<Clock className="w-4 h-4" />} count={scheduled.length} color="text-amber-500" bgColor="bg-amber-500/10" borderColor="border-amber-500/20">
          {scheduled.map(item => <InterventionCard key={item.id} data={item} reload={loadData} />)}
          {scheduled.length === 0 && <EmptyColumnState />}
        </KanbanColumn>
        <KanbanColumn title="En Cours" icon={<Loader2 className="w-4 h-4" />} count={inProgress.length} color="text-blue-500" bgColor="bg-blue-500/10" borderColor="border-blue-500/20">
          {inProgress.map(item => <InterventionCard key={item.id} data={item} reload={loadData} />)}
          {inProgress.length === 0 && <EmptyColumnState />}
        </KanbanColumn>
        <KanbanColumn title="Terminé (Prêt à facturer)" icon={<CheckCircle2 className="w-4 h-4" />} count={completed.length} color="text-emerald-500" bgColor="bg-emerald-500/10" borderColor="border-emerald-500/20">
          {completed.map(item => <InterventionCard key={item.id} data={item} reload={loadData} />)}
          {completed.length === 0 && <EmptyColumnState />}
        </KanbanColumn>
      </div>

      {/* Modal Nouvelle Intervention */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black">Planifier un chantier</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                <Plus className="w-5 h-5 text-muted-foreground rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Type d'intervention</label>
                <input required placeholder="Ex: Remplacement Chauffe-eau"
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  value={newIntervention.title}
                  onChange={e => setNewIntervention({...newIntervention, title: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Client</label>
                <select required
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  value={newIntervention.client_id}
                  onChange={e => {
                    const c = clients.find(cl => cl.id === e.target.value)
                    setNewIntervention({...newIntervention, client_id: e.target.value, address: c?.address || ''})
                  }}
                >
                  <option value="">Sélectionner un client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Date / Heure</label>
                  <input type="datetime-local" required
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    value={newIntervention.start_time}
                    onChange={e => setNewIntervention({...newIntervention, start_time: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Statut Initial</label>
                  <select
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    value={newIntervention.status}
                    onChange={e => setNewIntervention({...newIntervention, status: e.target.value})}
                  >
                    <option value="scheduled">À faire</option>
                    <option value="in_progress">En cours</option>
                    <option value="completed">Terminé</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Adresse</label>
                <input placeholder="Lieu de l'intervention"
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  value={newIntervention.address}
                  onChange={e => setNewIntervention({...newIntervention, address: e.target.value})}
                />
              </div>

              {/* Catalogue Chiffrage */}
              <div className="space-y-2 bg-secondary/30 rounded-2xl p-4 border border-border/50">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                    <Package className="w-3 h-3" /> Articles du Catalogue
                  </label>
                  <button type="button" onClick={() => setShowCatalogPicker(!showCatalogPicker)}
                    className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-lg hover:bg-primary/20 transition-all flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Ajouter
                  </button>
                </div>

                {showCatalogPicker && (
                  <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar mt-2">
                    {catalogItems.map(item => (
                      <button key={item.id} type="button"
                        onClick={() => {
                          const exists = selectedCatalogLines.find(l => l.id === item.id)
                          if (!exists) setSelectedCatalogLines(prev => [...prev, { id: item.id, name: item.name, qty: 1, selling_price: Number(item.selling_price || 0), purchase_price: Number(item.purchase_price || 0) }])
                          setShowCatalogPicker(false)
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 bg-card rounded-lg border border-border/50 hover:border-primary/40 text-left text-xs">
                        <span className="font-semibold truncate max-w-[180px]">{item.name}</span>
                        <span className="text-primary font-black shrink-0">{Number(item.selling_price || 0)} €</span>
                      </button>
                    ))}
                  </div>
                )}

                {selectedCatalogLines.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {selectedCatalogLines.map((line, i) => (
                      <div key={i} className="flex items-center gap-2 bg-card rounded-xl px-3 py-2 border border-border/50">
                        <span className="flex-1 text-xs font-semibold truncate">{line.name}</span>
                        <input type="number" min={1} value={line.qty}
                          onChange={e => setSelectedCatalogLines(prev => prev.map((l, idx) => idx === i ? {...l, qty: Number(e.target.value)} : l))}
                          className="w-12 text-center bg-secondary/50 border border-border rounded-lg py-1 text-xs outline-none" />
                        <span className="text-xs font-black text-primary w-14 text-right">{(line.qty * line.selling_price).toFixed(0)} €</span>
                        <button type="button" onClick={() => setSelectedCatalogLines(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-muted-foreground hover:text-rose-500 transition-colors"><XIcon className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Euro className="w-3 h-3" /> Coût : <span className="font-black text-foreground">{totalCost.toFixed(0)} €</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-500">
                          <TrendingUp className="w-3 h-3" /> Vente : <span className="font-black">{totalSell.toFixed(0)} €</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-primary">Marge: {totalSell > 0 ? ((totalSell - totalCost) / totalSell * 100).toFixed(0) : 0}%</span>
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20 mt-4 disabled:opacity-50">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Planifier maintenant"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyColumnState() {
  return (
    <div className="h-32 border border-dashed border-border rounded-2xl flex items-center justify-center text-xs text-muted-foreground italic text-center px-4">
      Aucun chantier dans cette colonne.
    </div>
  )
}

function KanbanColumn({ title, icon, count, color, bgColor, borderColor, children }: any) {
  return (
    <div className="flex flex-col h-full bg-card/30 border border-border rounded-[2rem] overflow-hidden">
      <div className="p-4 border-b border-border/50 flex items-center justify-between shrink-0 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg", bgColor, color)}>{icon}</div>
          <h3 className="font-bold text-sm">{title}</h3>
        </div>
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border", bgColor, color, borderColor)}>{count}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">{children}</div>
    </div>
  )
}

function NavigationMenu({ address }: { address: string }) {
  const [open, setOpen] = useState(false)
  const enc = encodeURIComponent(address)
  const options = [
    { label: 'Waze', icon: '🚗', url: `https://waze.com/ul?q=${enc}&navigate=yes` },
    { label: 'Google Maps', icon: '🗺️', url: `https://maps.google.com/?daddr=${enc}` },
    { label: 'Plans Apple', icon: '🍎', url: `maps://?daddr=${enc}` },
  ]
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md text-[10px] font-bold hover:bg-blue-500/20 transition-colors">
        <Navigation className="w-3 h-3" /> Itinéraire
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-[91] min-w-[160px] animate-in slide-in-from-bottom-2 duration-150">
            {options.map(opt => (
              <a key={opt.label} href={opt.url} target="_blank" rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-sm font-medium">
                <span>{opt.icon}</span> {opt.label}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function InterventionCard({ data, reload }: { data: any, reload: () => void }) {
  const { userRole, subscriptionPlan } = useTheme()
  const [uploading, setUploading] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [hours, setHours] = useState<string>('')
  const [isEditingHours, setIsEditingHours] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  // Chrono Tick
  useEffect(() => {
    let interval: any;
    try {
      const parsed = JSON.parse(data.description || '{}')
      if (parsed.timer_start) {
        interval = setInterval(() => {
          const start = new Date(parsed.timer_start).getTime()
          const now = new Date().getTime()
          setElapsed(Math.floor((now - start) / 1000))
        }, 1000)
      } else {
        setElapsed(0)
      }
    } catch {}
    return () => clearInterval(interval)
  }, [data.description])

  useEffect(() => {
    async function loadPhotos() {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { data: photoRows } = await supabase
        .from('intervention_photos').select('url').eq('intervention_id', data.id).order('created_at', { ascending: true })
      setPhotos((photoRows || []).map((r: any) => r.url))
    }
    loadPhotos()
  }, [data.id])

  const formattedDate = new Date(data.date || data.start_time).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short'
  })
  const formattedTime = new Date(data.date || data.start_time).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit'
  })

  const updateStatus = async (newStatus: string) => {
    const { updateIntervention } = await import('@/lib/actions')
    await updateIntervention(data.id, { status: newStatus })
    reload()
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { uploadInterventionPhoto } = await import('@/lib/actions')
      const result = await uploadInterventionPhoto(data.id, file)
      if (result?.url) setPhotos(prev => [...prev, result.url])
    } catch (err: any) {
      alert("Erreur lors de l'envoi : " + (err?.message || err))
    } finally {
      setUploading(false)
    }
  }

  let catalogLines: any[] = []
  let catalogTotalSell = 0
  let catalogTotalCost = 0
  let hoursWorked = 0
  let parsedDesc: any = {}
  try {
    parsedDesc = JSON.parse(data.description || '{}')
    if (parsedDesc.catalog_lines) {
      catalogLines = parsedDesc.catalog_lines
      catalogTotalSell = parsedDesc.total_sell || 0
      catalogTotalCost = parsedDesc.total_cost || 0
    }
    hoursWorked = parsedDesc.hours_worked || 0
  } catch {}

  const handleSaveHours = async () => {
    const { updateIntervention } = await import('@/lib/actions')
    await updateIntervention(data.id, { 
      description: JSON.stringify({ ...parsedDesc, hours_worked: Number(hours) }) 
    })
    setIsEditingHours(false)
    reload()
  }

  const hourlyRate = typeof window !== 'undefined' ? Number(localStorage.getItem('flozy_hourly_rate') || 50) : 50
  const realCost = catalogTotalCost + (hoursWorked * hourlyRate)
  const netMargin = catalogTotalSell - realCost

  const handleToggleTimer = async () => {
    const { updateIntervention } = await import('@/lib/actions')
    const now = new Date().toISOString()
    
    if (parsedDesc.timer_start) {
      // STOP TIMER
      const start = new Date(parsedDesc.timer_start).getTime()
      const end = new Date().getTime()
      const diffHours = (end - start) / (1000 * 60 * 60)
      const newTotalHours = Number((hoursWorked + diffHours).toFixed(2))
      
      const newDesc = { ...parsedDesc }
      delete newDesc.timer_start
      await updateIntervention(data.id, { 
        description: JSON.stringify({ ...newDesc, hours_worked: newTotalHours }) 
      })
    } else {
      // START TIMER
      await updateIntervention(data.id, { 
        description: JSON.stringify({ ...parsedDesc, timer_start: now }) 
      })
    }
    reload()
  }

  const handleSaveSignature = async (signatureUrl: string) => {
    const { updateIntervention } = await import('@/lib/actions')
    await updateIntervention(data.id, { 
      description: JSON.stringify({ ...parsedDesc, signature_url: signatureUrl }) 
    })
    setIsSigning(false)
    reload()
  }

  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`
  }

  const handleGenerateInvoice = () => {
    // 1. Préparer les articles (Catalogue)
    const invoiceItems = catalogLines.map((line: any) => ({
      description: line.name || line.description,
      quantity: 1,
      price: line.selling_price || 0,
      purchasePrice: line.purchase_price || 0,
      syncStock: true,
      mode: 'catalog'
    }))

    // 2. Ajouter la Main d'Oeuvre si applicable
    if (hoursWorked > 0) {
      invoiceItems.push({
        description: `Main d'œuvre (${hoursWorked}h)`,
        quantity: hoursWorked,
        price: hourlyRate,
        purchasePrice: 0,
        syncStock: false,
        mode: 'manual'
      })
    }

    // 3. Préparer le client
    const invoiceClient = {
      id: data.client_id || '',
      name: data.clients?.full_name || '',
      address: data.address || '',
      email: data.clients?.email || ''
    }

    // 4. Sauvegarder en brouillon et rediriger
    localStorage.setItem('invoice_draft', JSON.stringify({ items: invoiceItems, client: invoiceClient }))
    window.location.href = '/invoices/new'
  }

  const statusColors: any = {
    scheduled: 'bg-amber-500 text-white',
    in_progress: 'bg-blue-500 text-white',
    completed: 'bg-emerald-500 text-white',
  }

  return (
    <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
      {/* Top Info Bar */}
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="bg-secondary/50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
              {formattedDate} • {formattedTime}
            </div>
            {subscriptionPlan === 'expert' && netMargin !== 0 && (
              <div className={cn(
                "px-2 py-1 rounded-full text-[9px] font-black uppercase",
                netMargin > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
              )}>
                {netMargin > 0 ? '+' : ''}{netMargin.toFixed(0)}€
              </div>
            )}
          </div>
          <select
            value={data.status}
            onChange={e => updateStatus(e.target.value)}
            className={cn(
              "text-[10px] font-black uppercase tracking-widest rounded-full px-3 py-1 outline-none cursor-pointer transition-all appearance-none text-center min-w-[90px]",
              statusColors[data.status] || statusColors.scheduled
            )}
          >
            <option value="scheduled">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminé</option>
          </select>
        </div>

        <div>
          <h4 className="text-lg font-bold leading-tight mb-1 group-hover:text-primary transition-colors">{data.title}</h4>
          <div className="flex flex-col gap-1.5 bg-secondary/20 p-3 rounded-2xl border border-border/40">
            <p className="text-xs font-semibold flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-black">
                {data.clients?.full_name?.substring(0, 1) || 'C'}
              </span>
              {data.clients?.full_name || 'Client Direct'}
            </p>
            {data.address && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-2 pl-1">
                <MapPin className="w-3.5 h-3.5 text-primary/60" />
                <span className="truncate">{data.address}</span>
              </p>
            )}
          </div>
        </div>

        {/* Expert Stats Row */}
        {subscriptionPlan === 'expert' && userRole !== 'employee' && (
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                 <Clock className={cn("w-3.5 h-3.5", parsedDesc.timer_start ? "text-blue-500 animate-pulse" : "text-primary")} />
                 {isEditingHours ? (
                   <div className="flex items-center gap-1">
                     <input type="number" value={hours} onChange={e => setHours(e.target.value)} className="w-10 bg-secondary border-none rounded px-1 text-[10px]" />
                     <button onClick={handleSaveHours} className="text-emerald-500"><CheckCircle2 className="w-3 h-3" /></button>
                   </div>
                 ) : (
                   <div className="flex items-center gap-2">
                     <span onClick={() => {setHours(hoursWorked.toString()); setIsEditingHours(true)}} className="cursor-pointer border-b border-dotted border-primary/50">
                       {hoursWorked > 0 ? hoursWorked + 'h' : '0h'}
                     </span>
                     {parsedDesc.timer_start && (
                       <span className="text-blue-500 font-mono">({formatElapsed(elapsed)})</span>
                     )}
                   </div>
                 )}
               </div>
               {catalogLines.length > 0 && (
                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                   <Package className="w-3.5 h-3.5 text-primary" />
                   {catalogTotalSell.toFixed(0)}€
                 </div>
               )}
            </div>
            
            <button 
              onClick={handleToggleTimer}
              className={cn(
                "p-2 rounded-full transition-all shadow-sm",
                parsedDesc.timer_start ? "bg-rose-500 text-white animate-pulse" : "bg-secondary text-primary hover:bg-primary/10"
              )}
            >
              {parsedDesc.timer_start ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
          </div>
        )}
      </div>

      {/* Photo Strip (Horizontal Scroll) */}
      <div className="relative group/photos">
        <div className="flex gap-2 overflow-x-auto px-5 pb-4 no-scrollbar scroll-smooth">
          {photos.map((url, idx) => (
            <button key={idx} onClick={() => setShowGallery(true)} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-border/50 shrink-0 hover:scale-105 transition-transform duration-300">
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
          <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-secondary/30 transition-all shrink-0">
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            {uploading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Camera className="w-5 h-5 text-muted-foreground" />}
            <span className="text-[8px] font-black uppercase text-muted-foreground">{uploading ? '...' : 'Ajouter'}</span>
          </label>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 bg-secondary/10 border-t border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {data.address && <NavigationMenu address={data.address} />}
          {userRole !== 'employee' && (
            <button 
              onClick={() => setIsSigning(true)}
              className={cn(
                "p-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-bold",
                parsedDesc.signature_url ? "bg-emerald-500/10 text-emerald-600" : "bg-secondary text-muted-foreground hover:text-primary"
              )}
            >
              <PenTool className="w-4 h-4" />
              {parsedDesc.signature_url ? "Signé" : "Signature"}
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {data.status === 'completed' && userRole !== 'employee' && (
            <>
              <button onClick={() => updateStatus('archived')} className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl hover:bg-amber-500/20 transition-all" title="Archiver">
                <Archive className="w-4 h-4" />
              </button>
              <button onClick={handleGenerateInvoice} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-[11px] shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:scale-105 transition-all">
                <FileText className="w-4 h-4" /> Facturer (Auto)
              </button>
            </>
          )}
        </div>
      </div>

      {/* Gallery Overlay */}
      {showGallery && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex flex-col p-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-white font-bold text-xl">{data.title}</h3>
              <p className="text-white/40 text-sm">{photos.length} photos enregistrées</p>
            </div>
            <button onClick={() => setShowGallery(false)} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all">
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-y-auto custom-scrollbar pb-10">
            {photos.map((url, idx) => (
              <div key={idx} className="aspect-square rounded-3xl overflow-hidden border border-white/10 relative group">
                <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <a href={url} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="text-[10px] text-white font-black uppercase tracking-widest border border-white/20 px-3 py-1.5 rounded-full">HD</span>
                </a>
              </div>
            ))}
          </div>
          {parsedDesc.signature_url && (
            <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center">
               <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-2">Signature du client</p>
               <img src={parsedDesc.signature_url} alt="Signature" className="h-20 invert grayscale contrast-200" />
            </div>
          )}
        </div>
      )}

      {/* Signature Pad Overlay */}
      {isSigning && (
        <SignaturePad 
          onCancel={() => setIsSigning(false)}
          onSave={handleSaveSignature}
        />
      )}
    </div>
  )
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  )
}
