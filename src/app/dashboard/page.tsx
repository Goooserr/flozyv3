'use client'

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Users, 
  ArrowUpRight, 
  CheckCircle2,
  AlertCircle,
  MapPin,
  CalendarDays,
  Send,
  Loader2,
  ChevronRight,
  PlusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDocuments, getClients, getInterventions } from '@/lib/actions';
import Link from 'next/link';
import { useTheme } from '@/components/DynamicThemeProvider';

const statusStyles: any = {
  paid: 'bg-emerald-500/10 text-emerald-500',
  pending: 'bg-amber-500/10 text-amber-500',
  overdue: 'bg-rose-500/10 text-rose-500',
};

export default function Dashboard() {
  const { subscriptionPlan } = useTheme()
  const [stats, setStats] = useState<any[]>([])
  const [recentInvoices, setRecentInvoices] = useState<any[]>([])
  const [interventions, setInterventions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newClient, setNewClient] = useState({ full_name: '', email: '', phone: '', address: '' })

  async function loadData() {
    const [docs, clients, inters] = await Promise.all([
      getDocuments(),
      getClients(),
      getInterventions()
    ])

    const totalRevenue = docs?.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0) || 0
    const pendingCount = docs?.filter((d: any) => d.status === 'pending').length || 0
    const activeClients = clients?.length || 0

    setStats([
      { 
        label: 'Chiffre d\'affaires', 
        value: `${totalRevenue.toLocaleString()} €`, 
        trend: 'À jour', 
        icon: TrendingUp,
        color: 'text-emerald-500'
      },
      { 
        label: 'En attente', 
        value: `${pendingCount} doc(s)`, 
        trend: 'À relancer', 
        icon: Clock,
        color: 'text-amber-500'
      },
      { 
        label: 'Clients actifs', 
        value: activeClients.toString(), 
        trend: 'Base de données', 
        icon: Users,
        color: 'text-blue-500'
      },
    ])

    setRecentInvoices(docs?.slice(0, 5) || [])
    setInterventions(inters || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleQuickClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { addClient } = await import('@/lib/actions')
      await addClient(newClient)
      setIsClientModalOpen(false)
      setNewClient({ full_name: '', email: '', phone: '', address: '' })
      await loadData()
    } catch (err) {
      alert("Erreur lors de l'ajout rapide")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  const nextIntervention = interventions.find(i => i.status === 'scheduled' || i.status === 'in_progress')

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Tableau de bord</h2>
        <p className="text-muted-foreground text-sm">Simplifiez votre gestion quotidienne. Voici l'état de votre activité.</p>
      </div>

      {subscriptionPlan === 'starter' && (
        <div className="bg-primary/10 border border-primary/20 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shrink-0">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Passez au niveau supérieur !</h4>
              <p className="text-sm text-muted-foreground">Débloquez le <b>Planning</b>, la <b>Gestion de Stock</b> et le calcul de <b>Rendement</b>.</p>
            </div>
          </div>
          <Link href="/billing" className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity shrink-0">
            Passer Pro
          </Link>
        </div>
      )}

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border p-6 rounded-3xl flex flex-col gap-4 hover:border-primary/20 transition-all group cursor-default shadow-sm">
            <div className="flex items-center justify-between">
              <div className={cn("p-2.5 rounded-xl bg-secondary group-hover:scale-110 transition-transform", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-secondary rounded-lg">
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Invoices Table */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg">
                   <ArrowUpRight className="w-4 h-4" />
                </div>
                <h3 className="font-bold">Factures & Devis récents</h3>
              </div>
              <Link href="/invoices" className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1">
                Tout voir <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-muted-foreground border-b border-border bg-secondary/30">
                    <th className="px-6 py-3 font-bold uppercase tracking-widest">Client</th>
                    <th className="px-6 py-3 font-bold uppercase tracking-widest">Montant</th>
                    <th className="px-6 py-3 font-bold uppercase tracking-widest text-center">Statut</th>
                    <th className="px-6 py-3 font-bold uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {recentInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">
                         Aucun document pour le moment. <br/>
                         <Link href="/invoices/new" className="text-primary font-bold hover:underline mt-2 inline-block">Créer votre premier devis</Link>
                      </td>
                    </tr>
                  ) : recentInvoices.map((invoice) => {
                    const clientName = invoice.clients?.full_name || invoice.metadata?.client_info?.name || 'Client Inconnu';
                    const amount = (invoice.amount || 0).toLocaleString();
                    const statusLabel = invoice.status === 'paid' ? 'Payée' : invoice.status === 'pending' ? 'En attente' : 'Retard';
                    
                    return (
                      <tr key={invoice.id} className="text-sm hover:bg-secondary/40 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-bold">{clientName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">#{invoice.document_number || 'DOC'}</p>
                        </td>
                        <td className="px-6 py-4 font-black">{amount} €</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                              statusStyles[invoice.status || 'pending']
                            )}>
                              {invoice.status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                              {invoice.status === 'pending' && <Clock className="w-3 h-3" />}
                              {invoice.status === 'overdue' && <AlertCircle className="w-3 h-3" />}
                              {statusLabel}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/p/${invoice.id}`} target="_blank" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-primary hover:text-primary-foreground transition-all">
                            Voir
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Today's Plan Widget - DYNAMIC */}
          <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-8 items-center justify-between relative overflow-hidden group shadow-lg">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <CalendarDays className="w-48 h-48 rotate-12" />
             </div>
             <div className="flex-1">
                <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest mb-4 bg-primary/10 w-fit px-3 py-1 rounded-full">
                   <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> {nextIntervention ? 'Prochaine Intervention' : 'Journée calme'}
                </div>
                <h3 className="text-2xl font-black mb-1">{nextIntervention?.title || "Aucun chantier planifié"}</h3>
                <p className="text-muted-foreground flex items-center gap-2">
                   <MapPin className="w-4 h-4" /> {nextIntervention?.address || "Profitez-en pour mettre à jour vos devis !"}
                </p>
             </div>
             {nextIntervention && (
               <div className="flex flex-col items-end gap-4 min-w-[200px]">
                  <div className="text-right">
                     <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Horaire prévu</p>
                     <p className="text-xl font-black text-primary">
                        {new Date(nextIntervention.date || nextIntervention.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                     </p>
                  </div>
                  <button 
                    onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(nextIntervention.address)}`, '_blank')} 
                    className="w-full flex items-center justify-center gap-2 font-black text-xs bg-white text-black px-6 py-4 rounded-xl hover:bg-zinc-200 transition-all shadow-xl"
                  >
                     <MapPin className="w-4 h-4" /> Itinéraire
                  </button>
               </div>
             )}
             {!nextIntervention && (
               <Link href="/planning" className="font-black text-xs bg-primary text-primary-foreground px-6 py-4 rounded-xl hover:opacity-90 transition-all shadow-xl">
                  Planifier un chantier
               </Link>
             )}
          </div>
        </div>

        {/* Quick Actions Column */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-[2.5rem] p-6 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground px-2">Actions rapides</h3>
            
            <Link href="/invoices/new" className="group flex items-center gap-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm">Nouveau Devis</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">PDF Pro en 1 min</p>
              </div>
            </Link>

            <button 
              onClick={() => setIsClientModalOpen(true)}
              className="group flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all w-full text-left"
            >
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm">Nouveau Client</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Répertoire CRM</p>
              </div>
            </button>

            <Link href="/planning" className="group flex items-center gap-4 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 hover:border-purple-500/40 hover:bg-purple-500/10 transition-all">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm">Intervention</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Planifier un chantier</p>
              </div>
            </Link>
          </div>

          {/* Activity Widget */}
          <div className="bg-secondary/30 border border-border rounded-[2.5rem] p-6">
             <h4 className="font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><Send className="w-3 h-3 text-primary" /> Dernière activité</h4>
             <div className="space-y-4">
                <div className="flex gap-3 items-start">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                   <div>
                      <p className="text-xs font-bold">Client ajouté</p>
                      <p className="text-[10px] text-muted-foreground">Il y a 2 heures</p>
                   </div>
                </div>
                <div className="flex gap-3 items-start opacity-50">
                   <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                   <div>
                      <p className="text-xs font-bold">Devis envoyé</p>
                      <p className="text-[10px] text-muted-foreground">Hier à 18:30</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Modal Nouveau Client Rapide */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black">Ajout Rapide Client</h3>
                <p className="text-xs text-muted-foreground mt-1 uppercase font-bold tracking-widest">Nouveau contact CRM</p>
              </div>
              <button onClick={() => setIsClientModalOpen(false)} className="p-2 hover:bg-secondary rounded-full text-muted-foreground transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleQuickClient} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nom / Entreprise</label>
                <input 
                  required
                  value={newClient.full_name}
                  onChange={e => setNewClient({...newClient, full_name: e.target.value})}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-5 py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  placeholder="Ex: Jean Dupont"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Téléphone</label>
                <input 
                  type="tel"
                  value={newClient.phone}
                  onChange={e => setNewClient({...newClient, phone: e.target.value})}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-5 py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  placeholder="Ex: 06..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Adresse</label>
                <input 
                  value={newClient.address}
                  onChange={e => setNewClient({...newClient, address: e.target.value})}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-5 py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  placeholder="Adresse du chantier..."
                />
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-sm hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><PlusCircle className="w-5 h-5" /> Créer maintenant</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
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
