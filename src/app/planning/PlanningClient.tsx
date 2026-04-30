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
  ChevronDown
} from 'lucide-react'
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
    notes: ''
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
      const notesPayload = selectedCatalogLines.length > 0
        ? JSON.stringify({ catalog_lines: selectedCatalogLines, total_sell: totalSell, total_cost: totalCost })
        : newIntervention.notes

      // Calcul auto de l'heure de fin (1h plus tard)
      const start = new Date(newIntervention.start_time)
      const end = new Date(start.getTime() + (60 * 60 * 1000))
      
      await createIntervention({ 
        ...newIntervention, 
        notes: notesPayload,
        end_time: end.toISOString()
      })
      setIsModalOpen(false)
      setNewIntervention({ title: '', client_id: '', status: 'scheduled', start_time: '', address: '', notes: '' })
      setSelectedCatalogLines([])
      await loadData()
    } catch (err) {
      console.error(err)
      alert("Erreur lors de la création")
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
  const { userRole } = useTheme()
  const [uploading, setUploading] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])

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
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
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

  // Parse catalog lines if stored in notes as JSON
  let catalogLines: any[] = []
  let catalogTotalSell = 0
  let catalogTotalCost = 0
  try {
    const parsed = JSON.parse(data.notes || '{}')
    if (parsed.catalog_lines) {
      catalogLines = parsed.catalog_lines
      catalogTotalSell = parsed.total_sell || 0
      catalogTotalCost = parsed.total_cost || 0
    }
  } catch {}

  const statusLabels: any = { scheduled: 'À faire', in_progress: 'En cours', completed: 'Terminé' }
  const statusColors: any = {
    scheduled: 'border-amber-500/40 text-amber-600 bg-amber-50 dark:bg-amber-500/10',
    in_progress: 'border-blue-500/40 text-blue-600 bg-blue-50 dark:bg-blue-500/10',
    completed: 'border-emerald-500/40 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10',
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{formattedDate}</p>
          <h4 className="font-bold leading-tight group-hover:text-primary transition-colors">{data.title}</h4>
        </div>
        {/* Statut dropdown — toujours visible, même sur mobile */}
        <select
          value={data.status}
          onChange={e => updateStatus(e.target.value)}
          className={cn(
            "text-[10px] font-black uppercase tracking-widest border rounded-lg px-2 py-1.5 outline-none cursor-pointer transition-all min-h-[32px]",
            statusColors[data.status] || statusColors.scheduled
          )}
        >
          <option value="scheduled">À faire</option>
          <option value="in_progress">En cours</option>
          <option value="completed">Terminé</option>
        </select>
      </div>

      <div className="space-y-2 mb-3">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center font-bold text-[8px]">
            {data.clients?.full_name?.substring(0, 1) || 'C'}
          </div>
          <span className="truncate">{data.clients?.full_name || 'Client Direct'}</span>
        </p>
        {data.address && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{data.address}</span>
          </p>
        )}
      </div>

      {/* Résumé chiffrage catalogue — CACHÉ POUR LES EMPLOYÉS */}
      {userRole !== 'employee' && catalogLines.length > 0 && (
        <div className="flex items-center gap-3 mb-3 bg-secondary/30 rounded-xl px-3 py-2">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Euro className="w-3 h-3" /> Coût : <span className="font-black text-foreground ml-0.5">{catalogTotalCost.toFixed(0)} €</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
            <TrendingUp className="w-3 h-3" /> Vente : {catalogTotalSell.toFixed(0)} €
          </div>
        </div>
      )}

      {/* Photo thumbnails */}
      {photos.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {photos.slice(0, 4).map((url, idx) => (
            <button key={idx} onClick={() => setShowGallery(true)}
              className="w-14 h-14 rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-all group relative shrink-0">
              <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              {idx === 3 && photos.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-[10px] font-black">+{photos.length - 4}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            <div className={cn("flex items-center gap-1 px-2 py-1 bg-secondary text-muted-foreground rounded-md text-[10px] font-medium hover:bg-secondary/80 hover:text-foreground transition-colors", uploading && "opacity-50")}>
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
              <span>{uploading ? 'Envoi...' : photos.length > 0 ? `Photo (${photos.length})` : 'Photo'}</span>
            </div>
          </label>
          {data.address && <NavigationMenu address={data.address} />}
        </div>
        {data.status === 'completed' && userRole !== 'employee' && (
          <Link href="/invoices/new" className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-[10px] font-bold hover:opacity-90 shadow-sm shadow-primary/20 transition-all hover:scale-105">
            <FileText className="w-3 h-3" /> Facturer
          </Link>
        )}
      </div>

      {/* Galerie Lightbox */}
      {showGallery && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex flex-col p-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold">{data.title} — Photos</h3>
            <button onClick={() => setShowGallery(false)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto">
            {photos.map((url: string, idx: number) => (
              <div key={idx} className="aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 group relative">
                <img src={url} alt={`Chantier ${idx}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                <a href={url} target="_blank" className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-white font-bold uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full">Voir HD</span>
                </a>
              </div>
            ))}
          </div>
        </div>
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
