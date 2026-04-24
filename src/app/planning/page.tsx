'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  CheckCircle2, 
  MapPin,
  Camera,
  Image as ImageIcon,
  Loader2,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function PlanningPage() {
  const [interventions, setInterventions] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newIntervention, setNewIntervention] = useState({
    title: '',
    client_id: '',
    status: 'scheduled',
    date: '',
    address: '',
    notes: ''
  })

  async function loadData() {
    const { getInterventions, getClients } = await import('@/lib/actions')
    const [intData, clientData] = await Promise.all([
      getInterventions(),
      getClients()
    ])
    setInterventions(intData || [])
    setClients(clientData || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { createIntervention } = await import('@/lib/actions')
      await createIntervention(newIntervention)
      setIsModalOpen(false)
      setNewIntervention({ title: '', client_id: '', status: 'scheduled', date: '', address: '', notes: '' })
      await loadData()
    } catch (err) {
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
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Nouvelle Intervention
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden pb-4">
        <KanbanColumn 
          title="À Faire" 
          icon={<Clock className="w-4 h-4" />} 
          count={scheduled.length}
          color="text-amber-500"
          bgColor="bg-amber-500/10"
          borderColor="border-amber-500/20"
        >
          {scheduled.map(item => <InterventionCard key={item.id} data={item} reload={loadData} />)}
          {scheduled.length === 0 && <EmptyColumnState />}
        </KanbanColumn>

        <KanbanColumn 
          title="En Cours" 
          icon={<Loader2 className="w-4 h-4" />} 
          count={inProgress.length}
          color="text-blue-500"
          bgColor="bg-blue-500/10"
          borderColor="border-blue-500/20"
        >
          {inProgress.map(item => <InterventionCard key={item.id} data={item} reload={loadData} />)}
          {inProgress.length === 0 && <EmptyColumnState />}
        </KanbanColumn>

        <KanbanColumn 
          title="Terminé (Prêt à facturer)" 
          icon={<CheckCircle2 className="w-4 h-4" />} 
          count={completed.length}
          color="text-emerald-500"
          bgColor="bg-emerald-500/10"
          borderColor="border-emerald-500/20"
        >
          {completed.map(item => <InterventionCard key={item.id} data={item} reload={loadData} />)}
          {completed.length === 0 && <EmptyColumnState />}
        </KanbanColumn>
      </div>

      {/* Modal Nouvelle Intervention */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black">Planifier un chantier</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors"><XIcon className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Type d'intervention</label>
                <input 
                  required
                  placeholder="Ex: Remplacement Chauffe-eau"
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  value={newIntervention.title}
                  onChange={e => setNewIntervention({...newIntervention, title: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Client</label>
                <select 
                  required
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
                  <input 
                    type="datetime-local"
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    value={newIntervention.date}
                    onChange={e => setNewIntervention({...newIntervention, date: e.target.value})}
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
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Adresse</label>
                <input 
                  placeholder="Lieu de l'intervention"
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  value={newIntervention.address}
                  onChange={e => setNewIntervention({...newIntervention, address: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20 mt-4 disabled:opacity-50"
              >
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
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border", bgColor, color, borderColor)}>
          {count}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {children}
      </div>
    </div>
  )
}

function InterventionCard({ data, reload }: { data: any, reload: () => void }) {
  const [uploading, setUploading] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])

  // Charger les photos depuis la table dédiée
  useEffect(() => {
    async function loadPhotos() {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { data: photoRows } = await supabase
        .from('intervention_photos')
        .select('url')
        .eq('intervention_id', data.id)
        .order('created_at', { ascending: true })
      setPhotos((photoRows || []).map((r: any) => r.url))
    }
    loadPhotos()
  }, [data.id])

  const photosCount = photos.length
  const formattedDate = new Date(data.date || data.start_time).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
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
      // Ajouter immédiatement l'URL en local (affichage instantané)
      if (result?.url) {
        setPhotos(prev => [...prev, result.url])
      } else {
        // Recharger depuis la table en fallback
        const { createClient } = await import('@/lib/supabase')
        const supabase = createClient()
        const { data: photoRows } = await supabase
          .from('intervention_photos')
          .select('url')
          .eq('intervention_id', data.id)
          .order('created_at', { ascending: true })
        setPhotos((photoRows || []).map((r: any) => r.url))
      }
    } catch (err: any) {
      alert("Erreur lors de l'envoi de la photo : " + (err?.message || err))
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{formattedDate}</p>
          <h4 className="font-bold leading-tight group-hover:text-primary transition-colors">{data.title}</h4>
        </div>
        <div className="flex gap-1">
           {data.status === 'scheduled' && <button onClick={() => updateStatus('in_progress')} className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Loader2 className="w-3 h-3" /></button>}
           {data.status === 'in_progress' && <button onClick={() => updateStatus('completed')} className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><CheckCircle2 className="w-3 h-3" /></button>}
        </div>
      </div>

      <div className="space-y-2 mb-4">
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

      {/* Miniatures photos inline */}
      {photos.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {photos.slice(0, 4).map((url, idx) => (
            <button
              key={idx}
              onClick={() => setShowGallery(true)}
              className="w-14 h-14 rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-all group relative shrink-0"
            >
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
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 bg-secondary text-muted-foreground rounded-md text-[10px] font-medium hover:bg-secondary/80 hover:text-foreground transition-colors",
              uploading && "opacity-50"
            )}>
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
              <span>{uploading ? 'Envoi...' : photos.length > 0 ? `Photo (${photos.length})` : 'Photo'}</span>
            </div>
          </label>
        </div>
        
        {data.status === 'completed' && (
          <Link href="/invoices/new" className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-[10px] font-bold hover:opacity-90 shadow-sm shadow-primary/20 transition-all hover:scale-105">
            <FileText className="w-3 h-3" /> Facturer
          </Link>
        )}
      </div>

      {/* Galerie Lightbox Simplifiée */}
      {showGallery && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex flex-col p-6 animate-in fade-in duration-300">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold">{data.title} - Photos</h3>
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
