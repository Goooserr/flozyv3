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
        <button onClick={() => alert("La création d'intervention sera disponible dans la V2 du SaaS. (Module en cours de développement)")} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-105">
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
          {scheduled.map(item => <InterventionCard key={item.id} data={item} />)}
        </KanbanColumn>

        <KanbanColumn 
          title="En Cours" 
          icon={<Loader2 className="w-4 h-4" />} 
          count={inProgress.length}
          color="text-blue-500"
          bgColor="bg-blue-500/10"
          borderColor="border-blue-500/20"
        >
          {inProgress.map(item => <InterventionCard key={item.id} data={item} />)}
        </KanbanColumn>

        <KanbanColumn 
          title="Terminé (Prêt à facturer)" 
          icon={<CheckCircle2 className="w-4 h-4" />} 
          count={completed.length}
          color="text-emerald-500"
          bgColor="bg-emerald-500/10"
          borderColor="border-emerald-500/20"
        >
          {completed.map(item => <InterventionCard key={item.id} data={item} />)}
        </KanbanColumn>
      </div>
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

function InterventionCard({ data }: { data: any }) {
  const photosCount = data.photos?.length || data.photos || 0

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group cursor-grab active:cursor-grabbing relative overflow-hidden">
      {/* Decorative gradient strip */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{data.date}</p>
          <h4 className="font-bold leading-tight group-hover:text-primary transition-colors">{data.title}</h4>
        </div>
        <button onClick={() => alert("Options bientôt disponibles.")} className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center font-bold text-[8px]">
            {data.client_name?.substring(0, 1) || data.clients?.full_name?.substring(0, 1) || 'C'}
          </div>
          <span className="truncate">{data.client_name || data.clients?.full_name || 'Client Inconnu'}</span>
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
            <button onClick={() => alert("La prise de photo requiert l'activation de Supabase Storage. (Bientôt disponible)")} className="flex items-center gap-1 px-2 py-1 bg-secondary text-muted-foreground rounded-md text-[10px] font-medium hover:bg-secondary/80 hover:text-foreground transition-colors">
              <Camera className="w-3 h-3" /> Ajouter Photo
            </button>
          )}
        </div>
        
        {data.status === 'completed' && (
          <a href="/invoices/new" className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-[10px] font-bold hover:opacity-90 shadow-sm shadow-primary/20 transition-all hover:scale-105">
            <FileText className="w-3 h-3" /> Facturer
          </a>
        )}
      </div>
    </div>
  )
}
