'use client'

import React, { useState, useEffect } from 'react'
import { getInterventions, createIntervention } from '@/lib/actions'
import { 
  Calendar as CalendarIcon, 
  Plus, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  MapPin,
  Camera,
  Image as ImageIcon,
  Loader2,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PlanningPage() {
  const [interventions, setInterventions] = useState<any[]>([])
<<<<<<< HEAD
  const [loading, setLoading] = useState(true)

  // Mock data for the visual wow effect if DB is empty
  const mockInterventions = [
    { id: '1', title: 'Rénovation Salle de Bain', client_name: 'Mme Martin', status: 'in_progress', date: 'Aujourd\'hui', address: '12 Rue des Lilas', photos: 2 },
    { id: '2', title: 'Dépannage Chaudière', client_name: 'Jean Dupont', status: 'scheduled', date: 'Demain, 09:00', address: '45 Av. Jean Jaurès', photos: 0 },
    { id: '3', title: 'Installation Électrique', client_name: 'Boulangerie Paul', status: 'completed', date: 'Hier', address: 'Place Centrale', photos: 4 },
  ]

  useEffect(() => {
    async function load() {
      const data = await getInterventions()
      // Fallback to mock data for the demo if empty
      if (!data || data.length === 0) {
         setInterventions(mockInterventions)
      } else {
         setInterventions(data)
      }
      setLoading(false)
    }
    load()
  }, [])

=======
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

>>>>>>> a5c02c1 (feat: complete premium white-label dashboard, functional planning, and CRM-connected invoice flow)
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
<<<<<<< HEAD
        <button onClick={() => alert("La création d'intervention sera disponible dans la V2 du SaaS. (Module en cours de développement)")} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-105">
=======
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-105"
        >
>>>>>>> a5c02c1 (feat: complete premium white-label dashboard, functional planning, and CRM-connected invoice flow)
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
<<<<<<< HEAD
          {scheduled.map(item => <InterventionCard key={item.id} data={item} />)}
=======
          {scheduled.map(item => <InterventionCard key={item.id} data={item} reload={loadData} />)}
          {scheduled.length === 0 && <EmptyColumnState />}
>>>>>>> a5c02c1 (feat: complete premium white-label dashboard, functional planning, and CRM-connected invoice flow)
        </KanbanColumn>

        <KanbanColumn 
          title="En Cours" 
          icon={<Loader2 className="w-4 h-4" />} 
          count={inProgress.length}
          color="text-blue-500"
          bgColor="bg-blue-500/10"
          borderColor="border-blue-500/20"
        >
<<<<<<< HEAD
          {inProgress.map(item => <InterventionCard key={item.id} data={item} />)}
=======
          {inProgress.map(item => <InterventionCard key={item.id} data={item} reload={loadData} />)}
          {inProgress.length === 0 && <EmptyColumnState />}
>>>>>>> a5c02c1 (feat: complete premium white-label dashboard, functional planning, and CRM-connected invoice flow)
        </KanbanColumn>

        <KanbanColumn 
          title="Terminé (Prêt à facturer)" 
          icon={<CheckCircle2 className="w-4 h-4" />} 
          count={completed.length}
          color="text-emerald-500"
          bgColor="bg-emerald-500/10"
          borderColor="border-emerald-500/20"
        >
<<<<<<< HEAD
          {completed.map(item => <InterventionCard key={item.id} data={item} />)}
        </KanbanColumn>
      </div>
=======
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
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
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
>>>>>>> a5c02c1 (feat: complete premium white-label dashboard, functional planning, and CRM-connected invoice flow)
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

<<<<<<< HEAD
function InterventionCard({ data }: { data: any }) {
  const photosCount = data.photos?.length || data.photos || 0

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group cursor-grab active:cursor-grabbing relative overflow-hidden">
      {/* Decorative gradient strip */}
=======
function InterventionCard({ data, reload }: { data: any, reload: () => void }) {
  const photosCount = data.photos?.length || data.photos || 0
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

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group relative overflow-hidden">
>>>>>>> a5c02c1 (feat: complete premium white-label dashboard, functional planning, and CRM-connected invoice flow)
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start mb-3">
        <div>
<<<<<<< HEAD
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{data.date}</p>
          <h4 className="font-bold leading-tight group-hover:text-primary transition-colors">{data.title}</h4>
        </div>
        <button onClick={() => alert("Options bientôt disponibles.")} className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </button>
=======
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{formattedDate}</p>
          <h4 className="font-bold leading-tight group-hover:text-primary transition-colors">{data.title}</h4>
        </div>
        <div className="flex gap-1">
           {data.status === 'scheduled' && <button onClick={() => updateStatus('in_progress')} className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Loader2 className="w-3 h-3" /></button>}
           {data.status === 'in_progress' && <button onClick={() => updateStatus('completed')} className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><CheckCircle2 className="w-3 h-3" /></button>}
        </div>
>>>>>>> a5c02c1 (feat: complete premium white-label dashboard, functional planning, and CRM-connected invoice flow)
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center font-bold text-[8px]">
<<<<<<< HEAD
            {data.client_name?.substring(0, 1) || data.clients?.full_name?.substring(0, 1) || 'C'}
          </div>
          <span className="truncate">{data.client_name || data.clients?.full_name || 'Client Inconnu'}</span>
=======
            {data.clients?.full_name?.substring(0, 1) || 'C'}
          </div>
          <span className="truncate">{data.clients?.full_name || 'Client Direct'}</span>
>>>>>>> a5c02c1 (feat: complete premium white-label dashboard, functional planning, and CRM-connected invoice flow)
        </p>
        {data.address && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{data.address}</span>
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="flex items-center gap-2">
          {photosCount > 0 ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-md text-[10px] font-bold">
              <ImageIcon className="w-3 h-3" /> {photosCount} Photos
            </div>
          ) : (
<<<<<<< HEAD
            <button onClick={() => alert("La prise de photo requiert l'activation de Supabase Storage. (Bientôt disponible)")} className="flex items-center gap-1 px-2 py-1 bg-secondary text-muted-foreground rounded-md text-[10px] font-medium hover:bg-secondary/80 hover:text-foreground transition-colors">
              <Camera className="w-3 h-3" /> Ajouter Photo
=======
            <button onClick={() => alert("Photo : Bientôt disponible")} className="flex items-center gap-1 px-2 py-1 bg-secondary text-muted-foreground rounded-md text-[10px] font-medium hover:bg-secondary/80 hover:text-foreground transition-colors">
              <Camera className="w-3 h-3" /> Photo
>>>>>>> a5c02c1 (feat: complete premium white-label dashboard, functional planning, and CRM-connected invoice flow)
            </button>
          )}
        </div>
        
        {data.status === 'completed' && (
<<<<<<< HEAD
          <a href="/invoices/new" className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-[10px] font-bold hover:opacity-90 shadow-sm shadow-primary/20 transition-all hover:scale-105">
            <FileText className="w-3 h-3" /> Facturer
          </a>
=======
          <Link href="/invoices/new" className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-[10px] font-bold hover:opacity-90 shadow-sm shadow-primary/20 transition-all hover:scale-105">
            <FileText className="w-3 h-3" /> Facturer
          </Link>
>>>>>>> a5c02c1 (feat: complete premium white-label dashboard, functional planning, and CRM-connected invoice flow)
        )}
      </div>
    </div>
  )
}
<<<<<<< HEAD
=======

function X(props: React.SVGProps<SVGSVGElement>) {
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
>>>>>>> a5c02c1 (feat: complete premium white-label dashboard, functional planning, and CRM-connected invoice flow)
