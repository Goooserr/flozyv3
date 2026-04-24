'use client'

import React, { useState, useEffect } from 'react'
import { getClients, addClient, updateClient } from '@/lib/actions'
import { 
  Users, 
  Search, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight,
  FileText,
  Clock,
  Loader2,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newClient, setNewClient] = useState({ full_name: '', email: '', phone: '', address: '' })
  const [editClient, setEditClient] = useState({ id: '', full_name: '', email: '', phone: '', address: '' })

  async function load() {
    const data = await getClients()
    setClients(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await addClient(newClient)
      setIsModalOpen(false)
      setNewClient({ full_name: '', email: '', phone: '', address: '' })
      await load()
    } catch (err) {
      alert("Erreur lors de l'ajout")
    } finally {
      setSaving(false)
    }
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
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Nouveau Client
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Client List */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un client..." 
              className="w-full bg-card border border-border rounded-2xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
            />
          </div>

          <div className="space-y-3 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredClients.map((client) => (
              <div 
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={cn(
                  "p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02]",
                  selectedClient?.id === client.id 
                    ? "bg-primary/5 border-primary/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]" 
                    : "bg-card border-border hover:border-primary/20 shadow-sm"
                )}
              >
                <h3 className="font-bold text-base mb-1">{client.full_name}</h3>
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  {client.address && <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> <span className="truncate">{client.address}</span></span>}
                  {client.phone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {client.phone}</span>}
                </div>
              </div>
            ))}
            {filteredClients.length === 0 && (
              <div className="text-center p-8 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">
                Aucun client trouvé.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Client Details */}
        <div className="w-full lg:w-2/3">
          {selectedClient ? (
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden animate-in slide-in-from-right-8 duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-xl font-black uppercase mb-4 border border-primary/20">
                    {selectedClient.full_name.substring(0, 2)}
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight mb-2">{selectedClient.full_name}</h2>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {selectedClient.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {selectedClient.email}</span>}
                    {selectedClient.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {selectedClient.phone}</span>}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setEditClient(selectedClient)
                    setIsEditModalOpen(true)
                  }}
                  className="px-4 py-2 bg-secondary text-foreground rounded-xl text-xs font-bold hover:bg-secondary/80 transition-colors"
                >
                  Modifier la fiche
                </button>
              </div>

              {/* Notes Privées */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 mb-8 relative z-10">
                <h4 className="text-amber-500 font-bold uppercase tracking-widest text-[10px] mb-3 flex items-center gap-2">
                  Notes Privées Artisan
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedClient.notes || "Aucune note particulière pour ce client. Cliquez sur modifier pour ajouter des informations importantes (code d'accès, préférences, etc)."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 relative z-10">
                {/* Historique Interventions */}
                <div className="space-y-4">
                  <h4 className="font-bold flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-primary" /> Derniers Chantiers</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-secondary/30 border border-border/50 rounded-xl text-xs flex justify-between items-center group cursor-pointer hover:border-primary/30">
                      <div>
                        <p className="font-bold">Réparation Fuite Cuisine</p>
                        <p className="text-muted-foreground">12 Mai 2024</p>
                      </div>
                      <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="p-3 bg-secondary/30 border border-border/50 rounded-xl text-xs flex justify-between items-center group cursor-pointer hover:border-primary/30">
                      <div>
                        <p className="font-bold">Installation Chauffe-eau</p>
                        <p className="text-muted-foreground">03 Janv 2024</p>
                      </div>
                      <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Historique Factures */}
                <div className="space-y-4">
                  <h4 className="font-bold flex items-center gap-2 text-sm"><FileText className="w-4 h-4 text-primary" /> Documents Récents</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-secondary/30 border border-border/50 rounded-xl text-xs flex justify-between items-center group cursor-pointer hover:border-primary/30">
                      <div>
                        <p className="font-bold">Facture #FAC-2024-042</p>
                        <p className="text-emerald-500 font-medium">850.00 € (Payée)</p>
                      </div>
                      <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="p-3 bg-secondary/30 border border-border/50 rounded-xl text-xs flex justify-between items-center group cursor-pointer hover:border-primary/30">
                      <div>
                        <p className="font-bold">Devis #DEV-2024-012</p>
                        <p className="text-amber-500 font-medium">2,100.00 € (En attente)</p>
                      </div>
                      <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] border border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8 bg-card/30">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Aucun client sélectionné</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Sélectionnez un client dans la liste pour voir son historique, ses factures et vos notes privées.
              </p>
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
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-full text-muted-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddClient} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Nom Complet / Entreprise</label>
                <input 
                  required
                  value={newClient.full_name}
                  onChange={e => setNewClient({...newClient, full_name: e.target.value})}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Jean Dupont ou Société SARL"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Email</label>
                <input 
                  type="email"
                  value={newClient.email}
                  onChange={e => setNewClient({...newClient, email: e.target.value})}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="jean@exemple.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Téléphone</label>
                <input 
                  type="tel"
                  value={newClient.phone}
                  onChange={e => setNewClient({...newClient, phone: e.target.value})}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="06 12 34 56 78"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Adresse</label>
                <input 
                  value={newClient.address}
                  onChange={e => setNewClient({...newClient, address: e.target.value})}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="12 rue de la Paix, 73000 Chambéry"
                />
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Créer le client"}
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
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-secondary rounded-full text-muted-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault()
              setSaving(true)
              try {
                await updateClient(editClient.id, editClient)
                setIsEditModalOpen(false)
                await load()
                setSelectedClient({...selectedClient, ...editClient})
              } catch (err) {
                alert("Erreur lors de la modification")
              } finally {
                setSaving(false)
              }
            }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Nom Complet / Entreprise</label>
                <input 
                  required
                  value={editClient.full_name}
                  onChange={e => setEditClient({...editClient, full_name: e.target.value})}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Email</label>
                <input 
                  type="email"
                  value={editClient.email || ''}
                  onChange={e => setEditClient({...editClient, email: e.target.value})}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Téléphone</label>
                <input 
                  type="tel"
                  value={editClient.phone || ''}
                  onChange={e => setEditClient({...editClient, phone: e.target.value})}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Adresse</label>
                <input 
                  value={editClient.address || ''}
                  onChange={e => setEditClient({...editClient, address: e.target.value})}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sauvegarder les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
