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
  Archive,
  Play,
  Square,
  PenTool,
  Phone,
  ChevronRight,
  X as XIcon,
  Check,
  List,
  ChevronLeft
} from 'lucide-react'
import { SignaturePad } from '@/components/SignaturePad'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/DynamicThemeProvider'

export default function PlanningPage() {
  const { userRole, primaryColor } = useTheme()
  const [interventions, setInterventions] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [catalogItems, setCatalogItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedMission, setSelectedMission] = useState<any>(null)

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

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  // On trie du plus récent au plus ancien, on met les "archived" de côté
  const activeMissions = interventions.filter(i => i.status !== 'archived').sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-1">
            <CalendarIcon className="w-4 h-4" /> Mission Control
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Programme du Jour</h2>
          <p className="text-muted-foreground">Une liste claire, un processus fluide.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-secondary/50 p-1 rounded-xl border border-border">
            <button
              onClick={() => setViewMode('list')}
              className={cn('p-2 rounded-lg transition-all', viewMode === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
              title="Vue Liste"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn('p-2 rounded-lg transition-all', viewMode === 'calendar' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
              title="Vue Calendrier"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>

          {userRole !== 'employee' && (
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center w-12 h-12 md:w-auto md:px-6 md:py-2.5 bg-primary text-primary-foreground rounded-2xl md:rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-105"
            >
              <Plus className="w-5 h-5 md:w-4 md:h-4" />
              <span className="hidden md:block ml-2">Nouvelle Mission</span>
            </button>
          )}
        </div>
      </div>

      {/* Calendar or List view */}
      {viewMode === 'calendar' ? (
        <CalendarView 
          missions={activeMissions} 
          month={calendarMonth}
          onPrev={() => setCalendarMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          onNext={() => setCalendarMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          onSelectMission={setSelectedMission}
          primaryColor={primaryColor}
        />
      ) : (
        <div className="space-y-3">
          {activeMissions.length === 0 ? (
            <div className="bg-secondary/30 border border-border border-dashed rounded-3xl p-12 text-center text-muted-foreground italic">
              Aucune mission prévue pour le moment.
            </div>
          ) : (
            activeMissions.map(mission => (
              <MissionListItem 
                key={mission.id} 
                data={mission} 
                onClick={() => setSelectedMission(mission)} 
              />
            ))
          )}
        </div>
      )}

      {isCreateModalOpen && (
        <CreateMissionModal 
          clients={clients} 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={loadData} 
        />
      )}

      {selectedMission && (
        <MissionDrawer 
          data={selectedMission} 
          catalogItems={catalogItems}
          onClose={() => setSelectedMission(null)} 
          reload={loadData} 
        />
      )}
    </div>
  )
}

// ==========================================
// CALENDAR VIEW COMPONENT
// ==========================================

function CalendarView({ missions, month, onPrev, onNext, onSelectMission, primaryColor }: any) {
  const year = month.getFullYear()
  const monthNum = month.getMonth()
  const monthName = month.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  // First day of month (0=Sun...6=Sat), adjust to Mon=0
  const firstDay = new Date(year, monthNum, 1).getDay()
  const startOffset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, monthNum + 1, 0).getDate()

  const getMissionsForDay = (day: number) => {
    return missions.filter((m: any) => {
      const d = new Date(m.start_time)
      return d.getFullYear() === year && d.getMonth() === monthNum && d.getDate() === day
    })
  }

  const today = new Date()
  const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === monthNum && today.getDate() === day

  const statusColor: any = {
    scheduled: 'bg-amber-500',
    in_progress: 'bg-blue-500',
    completed: 'bg-emerald-500',
  }

  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <button onClick={onPrev} className="p-2 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-black text-lg capitalize">{monthName}</h3>
        <button onClick={onNext} className="p-2 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 border-b border-border">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
          <div key={d} className="text-center py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {/* Offset for first day */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-border/50 bg-secondary/10 p-1" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dayMissions = getMissionsForDay(day)
          const isWeekend = (startOffset + i) % 7 >= 5

          return (
            <div
              key={day}
              className={cn(
                'min-h-[80px] border-b border-r border-border/50 p-1.5 transition-colors hover:bg-secondary/20',
                isWeekend && 'bg-secondary/5',
                isToday(day) && 'bg-primary/5'
              )}
            >
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-black mb-1',
                isToday(day) ? 'bg-primary text-primary-foreground' : 'text-foreground/70'
              )}>
                {day}
              </div>

              <div className="space-y-0.5">
                {dayMissions.slice(0, 2).map((m: any) => (
                  <button
                    key={m.id}
                    onClick={() => onSelectMission(m)}
                    className={cn(
                      'w-full text-left rounded px-1.5 py-0.5 text-[9px] font-bold truncate text-white transition-opacity hover:opacity-80',
                      statusColor[m.status] || 'bg-zinc-500'
                    )}
                  >
                    {new Date(m.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} {m.title}
                  </button>
                ))}
                {dayMissions.length > 2 && (
                  <p className="text-[8px] text-muted-foreground font-bold px-1">+{dayMissions.length - 2} autres</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-border flex items-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> À faire</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> En cours</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Terminé</div>
      </div>
    </div>
  )
}

function MissionListItem({ data, onClick }: { data: any, onClick: () => void }) {
  const formattedTime = new Date(data.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const formattedDate = new Date(data.start_time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  
  const statusConfig: any = {
    scheduled: { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'À faire' },
    in_progress: { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'En cours' },
    completed: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Terminé' },
  }
  const config = statusConfig[data.status] || statusConfig.scheduled

  return (
    <div 
      onClick={onClick}
      className="bg-card border border-border rounded-2xl p-4 md:p-5 flex items-center gap-4 cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all group"
    >
      <div className="flex flex-col items-center justify-center shrink-0 w-16 h-16 rounded-xl bg-secondary/50 border border-border/50 text-center">
        <span className="text-xs font-bold text-muted-foreground">{formattedDate}</span>
        <span className="text-sm font-black text-foreground">{formattedTime}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full", config.bg, config.color)}>
            {config.label}
          </span>
        </div>
        <h3 className="font-bold text-base md:text-lg truncate group-hover:text-primary transition-colors">{data.title}</h3>
        <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
          <MapPin className="w-3 h-3" /> {data.address || data.clients?.full_name || 'Sans adresse'}
        </p>
      </div>

      <div className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1">
        <ChevronRight className="w-5 h-5" />
      </div>
    </div>
  )
}

function CreateMissionModal({ clients, onClose, onSuccess }: any) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ title: '', client_id: '', start_time: '', address: '' })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { createIntervention } = await import('@/lib/actions')
      const start = new Date(formData.start_time)
      const end = new Date(start.getTime() + (60 * 60 * 1000))
      
      await createIntervention({ 
        ...formData, 
        status: 'scheduled',
        description: '{}', // Clean JSON for parsedDesc
        start_time: start.toISOString(),
        end_time: end.toISOString()
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      alert("Erreur: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black">Nouvelle Mission</h3>
          <button onClick={onClose} className="p-2 bg-secondary rounded-full"><XIcon className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleCreate} className="space-y-4">
          <input required placeholder="Titre de l'intervention" className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          <select required className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" value={formData.client_id} onChange={e => {
            const c = clients.find((cl:any) => cl.id === e.target.value)
            setFormData({...formData, client_id: e.target.value, address: c?.address || ''})
          }}>
            <option value="">Sélectionner un client...</option>
            {clients.map((c:any) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </select>
          <input type="datetime-local" required className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
          <input placeholder="Adresse (Optionnel)" className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          
          <button type="submit" disabled={saving} className="w-full bg-primary text-primary-foreground font-black py-4 rounded-xl flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Créer la mission'}
          </button>
        </form>
      </div>
    </div>
  )
}

function MissionDrawer({ data, catalogItems, onClose, reload }: { data: any, catalogItems: any[], onClose: () => void, reload: () => void }) {
  const [activeTab, setActiveTab] = useState<'trajet' | 'intervention' | 'cloture'>('trajet')
  const { userRole, subscriptionPlan } = useTheme()
  const [saving, setSaving] = useState(false)
  
  // State from Description JSON
  let parsedDesc: any = {}
  try { parsedDesc = JSON.parse(data.description || '{}') } catch {}
  
  const formattedTime = new Date(data.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  // UPDATE HELPERS
  const updateIntervention = async (updates: any) => {
    setSaving(true)
    const { updateIntervention } = await import('@/lib/actions')
    await updateIntervention(data.id, updates)
    setSaving(false)
    reload()
    // Trick to update local data instantly for UX
    Object.assign(data, updates)
  }

  const updateDesc = async (descUpdates: any) => {
    const newDesc = { ...parsedDesc, ...descUpdates }
    await updateIntervention({ description: JSON.stringify(newDesc) })
    parsedDesc = newDesc
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full md:w-[480px] h-full bg-card shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-border bg-secondary/10 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-full">
                {formattedTime}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {data.status === 'scheduled' ? 'À faire' : data.status === 'in_progress' ? 'En cours' : 'Terminé'}
              </span>
            </div>
            <h2 className="text-2xl font-black">{data.title}</h2>
            <p className="text-sm font-semibold text-muted-foreground mt-1">{data.clients?.full_name}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-border">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border shrink-0 px-2 bg-secondary/5">
          <TabButton active={activeTab === 'trajet'} onClick={() => setActiveTab('trajet')} icon={<Navigation className="w-4 h-4" />} label="1. Trajet" />
          <TabButton active={activeTab === 'intervention'} onClick={() => {setActiveTab('intervention'); updateIntervention({ status: 'in_progress' })}} icon={<Clock className="w-4 h-4" />} label="2. Sur Place" />
          <TabButton active={activeTab === 'cloture'} onClick={() => {setActiveTab('cloture'); updateIntervention({ status: 'completed' })}} icon={<CheckCircle2 className="w-4 h-4" />} label="3. Clôture" />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 relative custom-scrollbar">
          {activeTab === 'trajet' && (
            <TrajetTab data={data} onNext={() => {setActiveTab('intervention'); updateIntervention({ status: 'in_progress' })}} />
          )}
          {activeTab === 'intervention' && (
            <InterventionTab data={data} parsedDesc={parsedDesc} catalogItems={catalogItems} updateDesc={updateDesc} />
          )}
          {activeTab === 'cloture' && (
            <ClotureTab data={data} parsedDesc={parsedDesc} updateDesc={updateDesc} onArchive={() => {updateIntervention({ status: 'archived' }); onClose()}} />
          )}
        </div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex-1 flex flex-col items-center gap-1.5 py-4 border-b-2 transition-all text-xs font-bold",
        active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/20"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

// ==========================================
// TABS COMPONENTS
// ==========================================

function TrajetTab({ data, onNext }: { data: any, onNext: () => void }) {
  const enc = encodeURIComponent(data.address || '')
  return (
    <div className="space-y-6 animate-in slide-in-from-left-4 fade-in">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-6 text-center">
        <MapPin className="w-10 h-10 text-blue-500 mx-auto mb-3" />
        <h3 className="font-black text-lg mb-1">Destination</h3>
        <p className="text-sm font-medium text-blue-500/80 mb-6">{data.address || "Aucune adresse renseignée"}</p>
        
        <div className="flex flex-col gap-3">
          <a href={`https://waze.com/ul?q=${enc}&navigate=yes`} target="_blank" className="bg-blue-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90">
            Démarrer Waze
          </a>
          <a href={`https://maps.google.com/?daddr=${enc}`} target="_blank" className="bg-white border border-border text-zinc-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-50">
            Google Maps
          </a>
        </div>
      </div>

      {data.clients?.phone && (
        <a href={`tel:${data.clients.phone}`} className="flex items-center gap-4 bg-secondary/30 border border-border rounded-2xl p-4 hover:bg-secondary/50 transition-colors">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 flex items-center justify-center rounded-full shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm">Appeler le client</p>
            <p className="text-xs text-muted-foreground">{data.clients.phone}</p>
          </div>
        </a>
      )}

      <button onClick={onNext} className="w-full mt-8 py-4 font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
        Passer à l'étape Suivante →
      </button>
    </div>
  )
}

function InterventionTab({ data, parsedDesc, catalogItems, updateDesc }: any) {
  const [elapsed, setElapsed] = useState(0)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [showCatalog, setShowCatalog] = useState(false)
  const [selectedLines, setSelectedLines] = useState<any[]>(parsedDesc.catalog_lines || [])
  const [hours, setHours] = useState(parsedDesc.hours_worked || 0)

  useEffect(() => {
    let interval: any;
    if (parsedDesc.timer_start) {
      interval = setInterval(() => {
        const start = new Date(parsedDesc.timer_start).getTime()
        const now = new Date().getTime()
        setElapsed(Math.floor((now - start) / 1000))
      }, 1000)
    } else {
      setElapsed(0)
    }
    return () => clearInterval(interval)
  }, [parsedDesc.timer_start])

  useEffect(() => {
    async function loadPhotos() {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { data: photoRows } = await supabase.from('intervention_photos').select('url').eq('intervention_id', data.id)
      setPhotos((photoRows || []).map((r: any) => r.url))
    }
    loadPhotos()
  }, [data.id])

  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60); const s = seconds % 60
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`
  }

  const handleToggleTimer = async () => {
    if (parsedDesc.timer_start) {
      const start = new Date(parsedDesc.timer_start).getTime()
      const diffHours = (new Date().getTime() - start) / (1000 * 60 * 60)
      const newTotalHours = Number((hours + diffHours).toFixed(2))
      setHours(newTotalHours)
      await updateDesc({ timer_start: null, hours_worked: newTotalHours })
    } else {
      await updateDesc({ timer_start: new Date().toISOString() })
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true)
    try {
      const { uploadInterventionPhoto } = await import('@/lib/actions')
      const result = await uploadInterventionPhoto(data.id, file)
      if (result?.url) setPhotos(prev => [...prev, result.url])
    } finally { setUploading(false) }
  }

  const saveCatalog = async (lines: any[]) => {
    setSelectedLines(lines)
    const total_sell = lines.reduce((a, l) => a + l.qty * l.selling_price, 0)
    const total_cost = lines.reduce((a, l) => a + l.qty * l.purchase_price, 0)
    await updateDesc({ catalog_lines: lines, total_sell, total_cost })
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 fade-in pb-12">
      {/* CHRONO */}
      <div className="bg-secondary/20 border border-border rounded-3xl p-6 flex flex-col items-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Temps de Travail</p>
        <div className="text-4xl font-mono font-black tracking-tighter mb-6 text-primary">
          {parsedDesc.timer_start ? formatElapsed(elapsed) : (hours > 0 ? hours + 'h' : '0h 0m')}
        </div>
        <button 
          onClick={handleToggleTimer}
          className={cn(
            "w-full py-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-xl",
            parsedDesc.timer_start ? "bg-rose-500 text-white animate-pulse shadow-rose-500/20" : "bg-primary text-primary-foreground shadow-primary/20 hover:scale-105"
          )}
        >
          {parsedDesc.timer_start ? <><Square className="w-5 h-5 fill-current" /> Arrêter le Chrono</> : <><Play className="w-5 h-5 fill-current" /> Démarrer le Chrono</>}
        </button>
      </div>

      {/* MATERIEL */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-black text-sm uppercase tracking-widest flex items-center gap-2"><Package className="w-4 h-4 text-primary" /> Matériel Utilisé</h4>
          <button onClick={() => setShowCatalog(!showCatalog)} className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">Ajouter</button>
        </div>
        
        {showCatalog && (
          <div className="mb-4 max-h-40 overflow-y-auto bg-card border border-border rounded-2xl p-2 shadow-xl absolute z-10 w-[calc(100%-3rem)] custom-scrollbar">
            {catalogItems.map((item:any) => (
              <button key={item.id} onClick={() => {
                const lines = [...selectedLines]
                const exist = lines.find(l => l.id === item.id)
                if(!exist) saveCatalog([...lines, { id: item.id, name: item.name, qty: 1, selling_price: item.selling_price || 0, purchase_price: item.purchase_price || 0 }])
                setShowCatalog(false)
              }} className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-secondary rounded-lg">
                {item.name} ({item.selling_price}€)
              </button>
            ))}
          </div>
        )}

        {selectedLines.length > 0 ? (
          <div className="space-y-2">
            {selectedLines.map((line:any, i:number) => (
              <div key={i} className="flex items-center gap-2 bg-secondary/20 p-3 rounded-xl border border-border/50 text-xs font-medium">
                <span className="flex-1 truncate">{line.name}</span>
                <span className="text-primary font-black px-2">{line.qty}</span>
                <button onClick={() => saveCatalog(selectedLines.filter((_, idx) => idx !== i))} className="text-rose-500"><XIcon className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">Aucun matériel ajouté.</p>
        )}
      </div>

      {/* PHOTOS */}
      <div>
        <h4 className="font-black text-sm uppercase tracking-widest flex items-center gap-2 mb-3"><Camera className="w-4 h-4 text-primary" /> Photos du chantier</h4>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((url, i) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden border border-border/50"><img src={url} className="w-full h-full object-cover" /></div>
          ))}
          <label className="aspect-square rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors text-primary/60">
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
          </label>
        </div>
      </div>
    </div>
  )
}

function ClotureTab({ data, parsedDesc, updateDesc, onArchive }: any) {
  const [isSigning, setIsSigning] = useState(false)
  const hourlyRate = typeof window !== 'undefined' ? Number(localStorage.getItem('flozy_hourly_rate') || 50) : 50

  const handleGenerateInvoice = () => {
    const lines = parsedDesc.catalog_lines || []
    const hours = parsedDesc.hours_worked || 0

    const invoiceItems = lines.map((line: any) => ({
      description: line.name || line.description,
      quantity: line.qty || 1,
      price: line.selling_price || 0,
      purchasePrice: line.purchase_price || 0,
      syncStock: true,
      mode: 'catalog'
    }))

    if (hours > 0) {
      invoiceItems.push({
        description: `Main d'œuvre (${hours}h)`,
        quantity: hours,
        price: hourlyRate,
        purchasePrice: 0,
        syncStock: false,
        mode: 'manual'
      })
    }

    const invoiceClient = {
      id: data.client_id || '',
      name: data.clients?.full_name || '',
      address: data.address || '',
      email: data.clients?.email || ''
    }

    localStorage.setItem('invoice_draft', JSON.stringify({ 
      items: invoiceItems, 
      client: invoiceClient,
      intervention_id: data.id 
    }))
    window.location.href = '/invoices/new'
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-left-4 fade-in h-full flex flex-col">
      
      {/* SIGNATURE */}
      <div className="bg-secondary/20 rounded-3xl p-6 border border-border flex flex-col items-center justify-center text-center">
        <PenTool className="w-8 h-8 text-muted-foreground mb-3" />
        <h3 className="font-black text-lg mb-1">Validation Client</h3>
        <p className="text-xs text-muted-foreground mb-4">Faites signer le client sur votre téléphone pour valider le travail.</p>
        
        {parsedDesc.signature_url ? (
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full mb-2">Signé</span>
            <img src={parsedDesc.signature_url} className="h-20 invert dark:invert-0 opacity-80 mix-blend-multiply dark:mix-blend-lighten" />
          </div>
        ) : (
          <button onClick={() => setIsSigning(true)} className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold px-6 py-3 rounded-xl hover:scale-105 transition-all shadow-lg">
            Signer maintenant
          </button>
        )}
      </div>

      {/* FACTURATION AUTO */}
      <div className="bg-primary/5 rounded-3xl p-6 border border-primary/20 flex flex-col">
        <h3 className="font-black text-lg mb-2 flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Facturation Auto</h3>
        <p className="text-xs text-muted-foreground mb-6">Flozy va générer la facture avec le temps passé ({parsedDesc.hours_worked || 0}h) et le matériel utilisé ({parsedDesc.catalog_lines?.length || 0} articles).</p>
        
        <button onClick={handleGenerateInvoice} className="w-full bg-primary text-primary-foreground font-black py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all flex justify-center items-center gap-2">
          Générer la Facture
        </button>
      </div>

      <div className="flex-1" />

      {/* ARCHIVER */}
      <button onClick={onArchive} className="w-full py-4 text-xs font-bold text-muted-foreground hover:text-rose-500 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest border border-dashed border-border rounded-xl">
        <Archive className="w-4 h-4" /> Archiver la mission
      </button>

      {isSigning && (
        <SignaturePad onCancel={() => setIsSigning(false)} onSave={async (url) => { await updateDesc({ signature_url: url }); setIsSigning(false) }} />
      )}
    </div>
  )
}
