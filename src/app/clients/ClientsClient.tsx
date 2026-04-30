'use client'

import React, { useState, useEffect, useRef } from 'react'
import { getClients, addClient, updateClient, createIntervention } from '@/lib/actions'
import { 
  Users, Search, Plus, MapPin, Phone, Mail, ChevronRight,
  FileText, Clock, Loader2, X, CalendarDays, Send, Activity, Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { useTheme } from '@/components/DynamicThemeProvider'

export default function ClientsPage() {
  const { subscriptionPlan } = useTheme()
  const supabase = createClient()
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [clientDocs, setClientDocs] = useState<any[]>([])
  const [clientInterventions, setClientInterventions] = useState<any[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPlanningOpen, setIsPlanningOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newClient, setNewClient] = useState({ full_name: '', email: '', phone: '', address: '' })
  const [editClient, setEditClient] = useState({ id: '', full_name: '', email: '', phone: '', address: '' })
  const [newIntervention, setNewIntervention] = useState({ title: '', description: '', start_time: '', status: 'scheduled' })
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)

  async function load() {
    const data = await getClients()
    setClients(data)
    setLoading(false)
  }

  async function loadClientDetails(client: any) {
    setLoadingDetails(true)
    setClientDocs([])
    setClientInterventions([])

    const [docsRes, interventionsRes] = await Promise.all([
      supabase.from('documents').select('*').eq('client_id', client.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('interventions').select('*').eq('client_id', client.id).order('start_time', { ascending: false }).limit(5)
    ])

    setClientDocs(docsRes.data || [])
    setClientInterventions(interventionsRes.data || [])
    setLoadingDetails(false)
  }

  useEffect(() => { load() }, [])

  function selectClient(client: any) {
    setSelectedClient(client)
    setNotesValue(client.notes || '')
    setNotesSaved(false)
    setEditingNotes(false)
    loadClientDetails(client)
  }

  async function saveNotes() {
    if (!selectedClient) return
    await updateClient(selectedClient.id, { ...selectedClient, notes: notesValue })
    setSelectedClient({ ...selectedClient, notes: notesValue })
    setEditingNotes(false)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
  }

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await addClient(newClient)
      setIsModalOpen(false)
      setNewClient({ full_name: '', email: '', phone: '', address: '' })
      await load()
    } catch { alert("Erreur lors de l'ajout") }
    finally { setSaving(false) }
  }

  const handlePlanIntervention = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createIntervention({ ...newIntervention, client_id: selectedClient.id })
      setIsPlanningOpen(false)
      setNewIntervention({ title: '', description: '', start_time: '', status: 'scheduled' })
      loadClientDetails(selectedClient)
    } catch { alert("Erreur lors de la planification") }
    finally { setSaving(false) }
  }

  // Activités fusionnées : docs + interventions triés par date
  const activityFeed = [
    ...clientDocs.map(d => ({
      id: d.id,
      type: 'document',
      label: `${d.type === 'invoice' ? 'Facture' : 'Devis'} ${d.document_number || ''}`,
      sublabel: `${Number(d.amount || 0).toLocaleString()} € · ${d.status === 'paid' ? 'Payée' : d.status === 'pending' ? 'En attente' : d.status}`,
      date: d.created_at,
      color: d.status === 'paid' ? 'text-emerald-500' : 'text-amber-500',
    })),
    ...clientInterventions.map(i => ({
      id: i.id,
      type: 'intervention',
      label: i.title || 'Intervention',
      sublabel: i.status === 'completed' ? 'Terminé' : i.status === 'scheduled' ? 'Planifié' : i.status,
      date: i.start_time,
      color: i.status === 'completed' ? 'text-emerald-500' : 'text-primary',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  function formatDate(dateStr: string) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const filteredClients = clients.filter(c =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-1">
            <Users className="w-4 h-4" /> CRM Artisan
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Répertoire Clients</h2>
          <p className="text-muted-foreground">Gérez vos relations clients et consultez leur historique complet.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" /> Nouveau Client
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Client List */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher un client..."
              className="w-full bg-card border border-border rounded-2xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all" />
          </div>
          <div className="space-y-3 h-[600px] overflow-y-auto pr-2">
            {filteredClients.map(client => (
              <div key={client.id} onClick={() => selectClient(client)}
                className={cn("p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02]",
                  selectedClient?.id === client.id ? "bg-primary/5 border-primary/30" : "bg-card border-border hover:border-primary/20 shadow-sm")}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black uppercase shrink-0">
                    {client.full_name.substring(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm truncate">{client.full_name}</h3>
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground mt-0.5">
                      {client.email && <span className="truncate">{client.email}</span>}
                      {client.phone && <span>{client.phone}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredClients.length === 0 && (
              <div className="text-center p-8 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">Aucun client trouvé.</div>
            )}
          </div>
        </div>

        {/* Right: Client Details */}
        <div className="w-full lg:w-2/3">
          {selectedClient ? (
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden animate-in slide-in-from-right-8 duration-500 space-y-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

              {/* Header */}
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-xl font-black uppercase mb-4 border border-primary/20">
                    {selectedClient.full_name.substring(0, 2)}
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight mb-2">{selectedClient.full_name}</h2>
                  <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
                    {selectedClient.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {selectedClient.email}</span>}
                    {selectedClient.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {selectedClient.phone}</span>}
                    {selectedClient.address && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {selectedClient.address}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {subscriptionPlan === 'expert' || subscriptionPlan === 'pro' ? (
                    <button onClick={() => setIsPlanningOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                      <CalendarDays className="w-4 h-4" /> Planifier
                    </button>
                  ) : null}
                  <button onClick={() => { setEditClient(selectedClient); setIsEditModalOpen(true) }}
                    className="px-4 py-2 bg-secondary text-foreground rounded-xl text-xs font-bold hover:bg-secondary/80 transition-colors">
                    Modifier la fiche
                  </button>
                </div>
              </div>

              {/* Notes éditables */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-amber-500 font-bold uppercase tracking-widest text-[10px]">Notes Privées Artisan</h4>
                  {notesSaved && <span className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold"><Check className="w-3 h-3" /> Sauvegardé</span>}
                </div>
                {editingNotes ? (
                  <div className="space-y-3">
                    <textarea
                      autoFocus
                      value={notesValue}
                      onChange={e => setNotesValue(e.target.value)}
                      rows={4}
                      placeholder="Code d'accès, préférences, allergies, notes importantes..."
                      className="w-full bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-amber-500/30 resize-none transition-all"
                    />
                    <div className="flex gap-2">
                      <button onClick={saveNotes} className="px-4 py-1.5 bg-amber-500 text-black rounded-lg text-xs font-bold hover:opacity-90 transition-all">Sauvegarder</button>
                      <button onClick={() => setEditingNotes(false)} className="px-4 py-1.5 bg-secondary rounded-lg text-xs font-bold hover:bg-secondary/80 transition-all">Annuler</button>
                    </div>
                  </div>
                ) : (
                  <p
                    onClick={() => setEditingNotes(true)}
                    className="text-sm text-muted-foreground leading-relaxed cursor-text hover:text-foreground transition-colors min-h-[40px]"
                  >
                    {notesValue || "Cliquez pour ajouter une note privée (code d'accès, préférences, etc.)"}
                  </p>
                )}
              </div>

              {loadingDetails ? (
                <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : (
                <div className="grid grid-cols-2 gap-6 relative z-10">
                  {/* Interventions réelles */}
                  <div className="space-y-4">
                    <h4 className="font-bold flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-primary" /> Chantiers</h4>
                    <div className="space-y-3">
                      {clientInterventions.length === 0 ? (
                        <p className="text-xs text-muted-foreground p-3 bg-secondary/20 rounded-xl">Aucun chantier enregistré.</p>
                      ) : clientInterventions.map(i => (
                        <div key={i.id} className="p-3 bg-secondary/30 border border-border/50 rounded-xl text-xs flex justify-between items-center group cursor-pointer hover:border-primary/30">
                          <div>
                            <p className="font-bold">{i.title || 'Intervention'}</p>
                            <p className="text-muted-foreground">{formatDate(i.start_time)}</p>
                          </div>
                          <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded-full",
                            i.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary')}>
                            {i.status === 'completed' ? 'Terminé' : 'Planifié'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Documents réels */}
                  <div className="space-y-4">
                    <h4 className="font-bold flex items-center gap-2 text-sm"><FileText className="w-4 h-4 text-primary" /> Documents Récents</h4>
                    <div className="space-y-3">
                      {clientDocs.length === 0 ? (
                        <p className="text-xs text-muted-foreground p-3 bg-secondary/20 rounded-xl">Aucun document pour ce client.</p>
                      ) : clientDocs.map(d => (
                        <div key={d.id} className="p-3 bg-secondary/30 border border-border/50 rounded-xl text-xs flex justify-between items-center group cursor-pointer hover:border-primary/30">
                          <div>
                            <p className="font-bold">{d.document_number || (d.type === 'invoice' ? 'Facture' : 'Devis')}</p>
                            <p className={cn("font-medium", d.status === 'paid' ? 'text-emerald-500' : 'text-amber-500')}>
                              {Number(d.amount || 0).toLocaleString()} € ({d.status === 'paid' ? 'Payée' : 'En attente'})
                            </p>
                          </div>
                          <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Flux d'activité réel */}
              {activityFeed.length > 0 && (
                <div className="relative z-10 border-t border-border pt-6">
                  <h4 className="font-bold flex items-center gap-2 text-sm mb-4"><Activity className="w-4 h-4 text-primary" /> Dernière Activité</h4>
                  <div className="space-y-3">
                    {activityFeed.slice(0, 5).map(item => (
                      <div key={item.id} className="flex items-start gap-3">
                        <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", item.type === 'document' ? 'bg-primary' : 'bg-emerald-500')} />
                        <div>
                          <p className="text-xs font-bold">{item.label}</p>
                          <p className={cn("text-[10px]", item.color)}>{item.sublabel} · {formatDate(item.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[400px] border border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8 bg-card/30">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Aucun client sélectionné</h3>
              <p className="text-muted-foreground text-sm max-w-sm">Sélectionnez un client dans la liste pour voir son historique complet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nouveau Client */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-[2rem] p-8 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Nouveau Client</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-full text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddClient} className="space-y-4">
              {[
                { label: 'Nom Complet / Entreprise', key: 'full_name', type: 'text', placeholder: 'Jean Dupont' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'jean@exemple.com' },
                { label: 'Téléphone', key: 'phone', type: 'tel', placeholder: '06 12 34 56 78' },
                { label: 'Adresse', key: 'address', type: 'text', placeholder: '12 rue de la Paix, 73000' },
              ].map(field => (
                <div key={field.key} className="space-y-2">
                  <label className="text-sm font-bold ml-1">{field.label}</label>
                  <input required={field.key === 'full_name'} type={field.type} value={(newClient as any)[field.key]}
                    onChange={e => setNewClient({ ...newClient, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              ))}
              <div className="pt-4">
                <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Créer le client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modifier Client */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-[2rem] p-8 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Modifier le Client</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-secondary rounded-full text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault(); setSaving(true)
              try {
                await updateClient(editClient.id, editClient)
                setIsEditModalOpen(false); await load()
                setSelectedClient({ ...selectedClient, ...editClient })
              } catch { alert("Erreur") } finally { setSaving(false) }
            }} className="space-y-4">
              {[
                { label: 'Nom Complet / Entreprise', key: 'full_name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Téléphone', key: 'phone', type: 'tel' },
                { label: 'Adresse', key: 'address', type: 'text' },
              ].map(field => (
                <div key={field.key} className="space-y-2">
                  <label className="text-sm font-bold ml-1">{field.label}</label>
                  <input required={field.key === 'full_name'} type={field.type} value={(editClient as any)[field.key] || ''}
                    onChange={e => setEditClient({ ...editClient, [field.key]: e.target.value })}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              ))}
              <div className="pt-4">
                <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Planifier Chantier (Pro/Expert) */}
      {isPlanningOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">Planifier un chantier</h3>
                <p className="text-xs text-muted-foreground mt-1">Pour : <b>{selectedClient?.full_name}</b></p>
              </div>
              <button onClick={() => setIsPlanningOpen(false)} className="p-2 hover:bg-secondary rounded-full text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handlePlanIntervention} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Titre du chantier</label>
                <input required value={newIntervention.title}
                  onChange={e => setNewIntervention({ ...newIntervention, title: e.target.value })}
                  placeholder="ex: Installation tableau électrique"
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Date & Heure</label>
                <input required type="datetime-local" value={newIntervention.start_time}
                  onChange={e => setNewIntervention({ ...newIntervention, start_time: e.target.value })}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Description (optionnel)</label>
                <textarea value={newIntervention.description}
                  onChange={e => setNewIntervention({ ...newIntervention, description: e.target.value })}
                  rows={3} placeholder="Détails du chantier..."
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CalendarDays className="w-4 h-4" /> Confirmer le chantier</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
