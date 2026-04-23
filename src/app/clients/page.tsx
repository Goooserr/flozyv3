'use client'

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin,
  ExternalLink,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getClients, addClient } from '@/lib/actions';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newClient, setNewClient] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      const data = await getClients();
      // Si la DB est vide ou pas encore connectée, on garde les mocks pour le visuel
      if (data && data.length > 0) {
        setClients(data);
      } else {
        setClients([
          { id: 1, full_name: 'Jean Dupont', email: 'jean.dupont@email.com', phone: '06 12 34 56 78', address: '12 rue des Alpes, 73000 Chambéry', projects: 3 },
          { id: 2, full_name: 'Marie Martin', email: 'm.martin@web.fr', phone: '07 89 45 12 36', address: '45 Avenue de Lyon, 69000 Lyon', projects: 1 },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addClient(newClient);
      setIsModalOpen(false);
      setNewClient({ full_name: '', email: '', phone: '', address: '' });
      fetchClients();
    } catch (e) {
      alert("Note: Connectez d'abord votre Supabase dans .env.local pour sauvegarder réellement.");
      // Pour la démo, on l'ajoute localement
      setClients([{ ...newClient, id: Date.now(), projects: 0 }, ...clients]);
      setIsModalOpen(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Répertoire Clients</h2>
          <p className="text-muted-foreground text-sm">Gérez vos contacts et l'historique de vos interventions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Ajouter un client
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-4 bg-card border border-border p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Rechercher un client, une ville, un email..." 
            className="w-full bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors group relative">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-primary uppercase">
                {client.full_name?.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <button className="text-muted-foreground hover:text-foreground">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-1 mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                {client.full_name}
                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="w-3 h-3" /> {client.email}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-border/50">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="line-clamp-1">{client.address}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/30">
              <h3 className="font-bold text-xl">Nouveau Client</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-secondary rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom complet</label>
                <input 
                  required
                  value={newClient.full_name}
                  onChange={e => setNewClient({...newClient, full_name: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                  placeholder="ex: Jean Dupont"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input 
                    type="email"
                    value={newClient.email}
                    onChange={e => setNewClient({...newClient, email: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                    placeholder="jean@mail.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Téléphone</label>
                  <input 
                    value={newClient.phone}
                    onChange={e => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                    placeholder="06..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Adresse</label>
                <textarea 
                  value={newClient.address}
                  onChange={e => setNewClient({...newClient, address: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[80px]" 
                  placeholder="Adresse complète..."
                />
              </div>
              <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 transition-opacity mt-4">
                Enregistrer le client
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
