'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  PlusCircle,
  Lock,
  Camera,
  Sun,
  Car,
  Navigation,
  Bell,
  Zap,
  Euro,
  Play,
  ExternalLink
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
  const router = useRouter()
  const { subscriptionPlan, userRole, isAdmin } = useTheme()
  const [stats, setStats] = useState<any[]>([])
  const [recentInvoices, setRecentInvoices] = useState<any[]>([])
  const [interventions, setInterventions] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [stockItems, setStockItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newClient, setNewClient] = useState({ full_name: '', email: '', phone: '', address: '' })

  // Helper pour le temps relatif
  const getRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffInMs = now.getTime() - then.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 60) return `Il y a ${diffInMins} min`;
    if (diffInHours < 24) return `Il y a ${diffInHours} h`;
    return `Il y a ${diffInDays} j`;
  };

  async function loadData() {
    const { getStock } = await import('@/lib/actions');
    const [docs, clients, inters, stock] = await Promise.all([
      getDocuments(),
      getClients(),
      getInterventions(),
      getStock()
    ])

    // Calcul des statistiques
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const monthlyRevenue = docs?.reduce((acc: number, curr: any) => {
      const docDate = new Date(curr.created_at)
      if (docDate.getMonth() === currentMonth && docDate.getFullYear() === currentYear && (curr.status === 'paid' || curr.status === 'accepted')) {
        return acc + (curr.amount || 0)
      }
      return acc
    }, 0) || 0

    const activeProjectsCount = inters?.filter((i: any) => i.status === 'scheduled' || i.status === 'in_progress').length || 0
    const overdueInvoicesCount = docs?.filter((d: any) => d.status === 'overdue').length || 0

    const newStats = []
    if (userRole === 'employee') {
      newStats.push({ label: 'Chantiers prévus', value: `${activeProjectsCount} chantier(s)`, trend: 'Planning', icon: CalendarDays, color: 'text-purple-500' })
    } else {
      newStats.push({ label: 'CA du mois', value: `${monthlyRevenue.toLocaleString()} €`, trend: 'Mensuel', icon: TrendingUp, color: 'text-emerald-500' })
      newStats.push(
        { label: 'Chantiers actifs', value: `${activeProjectsCount}`, trend: 'Sur le terrain', icon: Users, color: 'text-blue-500' },
        { label: 'Urgences / Retards', value: `${overdueInvoicesCount} alerte(s)`, trend: 'À traiter', icon: AlertCircle, color: 'text-rose-500' }
      )
    }
    setStats(newStats)

    // Génération de l'activité réactive
    const allEvents: any[] = [];
    
    clients?.slice(0, 3).forEach((c: any) => {
      allEvents.push({
        id: `client-${c.id}`,
        title: `Client ajouté : ${c.full_name}`,
        date: c.created_at,
        color: 'bg-emerald-500',
        icon: Users
      });
    });

    docs?.slice(0, 3).forEach((d: any) => {
      allEvents.push({
        id: `doc-${d.id}`,
        title: `${d.type === 'invoice' ? 'Facture' : 'Devis'} créé (#${d.document_number})`,
        date: d.created_at,
        color: 'bg-blue-500',
        icon: Send
      });
    });

    inters?.slice(0, 3).forEach((i: any) => {
      allEvents.push({
        id: `inter-${i.id}`,
        title: `Intervention planifiée : ${i.title}`,
        date: i.created_at,
        color: 'bg-purple-500',
        icon: CalendarDays
      });
    });

    // Tri par date décroissante
    const sortedEvents = allEvents
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);

    setActivities(sortedEvents);
    setRecentInvoices(docs?.slice(0, 5) || [])
    setInterventions(inters || [])
    setStockItems(stock || [])
    setLoading(false)
  }

  useEffect(() => {
    if (isAdmin) {
      router.push('/admin')
      return
    }
    loadData()
  }, [isAdmin])

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

  const unpaidInvoices = recentInvoices.filter((d: any) => d.type === 'invoice' && d.status === 'pending')
  const unpaidTotal = unpaidInvoices.reduce((a: number, d: any) => a + Number(d.amount || 0), 0)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bonne après-midi' : 'Bonsoir'

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Morning Briefing Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-1">
          <Sun className="w-4 h-4" /> Morning Briefing
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{greeting} 👋 Voici votre journée</h2>
        <p className="text-muted-foreground text-sm">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Impayés alert bar */}
      {unpaidInvoices.length > 0 && userRole !== 'employee' && (
        <Link href="/relances" className="flex items-center justify-between bg-rose-500/10 border border-rose-500/30 rounded-2xl px-6 py-4 hover:bg-rose-500/15 transition-all group animate-in slide-in-from-top">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-rose-500" />
            <div>
              <p className="font-black text-sm text-rose-500">{unpaidInvoices.length} facture{unpaidInvoices.length > 1 ? 's' : ''} impayée{unpaidInvoices.length > 1 ? 's' : ''}</p>
              <p className="text-xs text-rose-400/80">{unpaidTotal.toLocaleString('fr-FR')} € en attente de paiement</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs group-hover:gap-3 transition-all">
            Voir les relances <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      )}

      {/* Devis Instantané CTA */}
      {userRole !== 'employee' && (
        <Link href="/devis" className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-2xl px-6 py-4 hover:bg-primary/10 transition-all group animate-in slide-in-from-top">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-black text-sm">Devis Instantané Terrain</p>
              <p className="text-xs text-muted-foreground">Créez un devis en 60 secondes depuis votre téléphone</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs bg-primary/10 px-3 py-2 rounded-xl group-hover:bg-primary/20 transition-colors">
            Créer <ChevronRight className="w-3 h-3" />
          </div>
        </Link>
      )}

      {subscriptionPlan === 'starter' && userRole !== 'employee' && (
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
          {/* Today's Plan Widget - DYNAMIC */}
          <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-8 items-center justify-between relative overflow-hidden group shadow-lg">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <CalendarDays className="w-48 h-48 rotate-12" />
             </div>
             <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest bg-primary/10 w-fit px-3 py-1 rounded-full">
                     <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> {nextIntervention ? 'Prochaine Mission' : 'Journée calme'}
                  </div>
                  {nextIntervention && (
                    <>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full uppercase">
                        <Sun className="w-3 h-3" /> 22°C Beau
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase">
                        <Car className="w-3 h-3" /> ~15 min
                      </div>
                    </>
                  )}
                </div>
                <h3 className="text-2xl font-black mb-1">{nextIntervention?.title || "Aucun chantier planifié"}</h3>
                <p className="text-muted-foreground flex items-center gap-2">
                   <MapPin className="w-4 h-4" /> {nextIntervention?.address || "Aucun déplacement prévu pour le moment."}
                </p>
             </div>
             {nextIntervention && (
               <div className="flex flex-col items-end gap-3 min-w-[200px]">
                  <div className="text-right">
                     <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Horaire prévu</p>
                     <p className="text-xl font-black text-primary">
                        {new Date(nextIntervention.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                     </p>
                  </div>
                  <button 
                    onClick={() => {
                      sessionStorage.setItem('planning_open_id', nextIntervention.id)
                      router.push('/planning')
                    }}
                    className="w-full flex items-center justify-center gap-2 font-black text-xs bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                  >
                     <Play className="w-4 h-4 fill-current" /> Ouvrir la Mission
                  </button>
                  <button 
                    onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(nextIntervention.address)}`, '_blank')} 
                    className="w-full flex items-center justify-center gap-2 font-black text-xs bg-white text-black px-6 py-3 rounded-xl hover:bg-zinc-200 transition-all shadow-xl"
                  >
                     <Navigation className="w-4 h-4" /> Y aller
                  </button>
               </div>
             )}
          </div>

          {/* Smart Alerts dynamiques UX #12 */}
          {userRole !== 'employee' && (() => {
            const lowStockItems = stockItems.filter(i => i.min_quantity && i.quantity <= i.min_quantity)
            const pendingQuotes = recentInvoices.filter((d: any) => {
              if (d.type !== 'quote' || d.status !== 'pending') return false
              const diff = Math.ceil(Math.abs(new Date().getTime() - new Date(d.created_at).getTime()) / 86400000)
              return diff > 7
            })

            const hasAlerts = lowStockItems.length > 0 || pendingQuotes.length > 0
            if (!hasAlerts) return null

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lowStockItems.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-3xl flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest">
                      <AlertCircle className="w-4 h-4" /> Stock Faible Détecté
                    </div>
                    <p className="text-sm font-medium">
                      <span className="font-black text-amber-500">{lowStockItems.length}</span> article{lowStockItems.length > 1 ? 's sont' : ' est'} sous le seuil d'alerte.
                    </p>
                    <Link href="/stock/alertes" className="text-xs font-black uppercase text-amber-600 hover:text-amber-700 mt-2 flex items-center gap-1">
                      Réapprovisionner <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
                
                {pendingQuotes.length > 0 && (
                  <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-3xl flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest">
                      <Clock className="w-4 h-4" /> Relances à faire
                    </div>
                    <p className="text-sm font-medium">
                      <span className="font-black text-blue-500">{pendingQuotes.length}</span> devis {pendingQuotes.length > 1 ? 'sont' : 'est'} en attente depuis plus de 7 jours.
                    </p>
                    <Link href="/invoices" className="text-xs font-black uppercase text-blue-600 hover:text-blue-700 mt-2 flex items-center gap-1">
                      Lancer le Smart Follow-up <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            )
          })()}

          {/* Recent Invoices Table - HIDDEN FOR EMPLOYEES */}
          {userRole !== 'employee' && (
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
          )}

          {/* Employee Site Photo Widget */}
          {userRole === 'employee' && (
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Photos de Chantier</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-8">
                Envoyez les photos du chantier en cours pour que votre patron puisse les consulter et valider l'intervention.
              </p>
              <Link href="/photos" className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-purple-600 transition-all shadow-xl shadow-purple-500/20">
                <Camera className="w-6 h-6" /> Envoyer des Photos
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions Column */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-[2.5rem] p-6 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground px-2">Actions rapides</h3>
            
            {userRole !== 'employee' && (
              <Link href="/invoices/new" className="group flex items-center gap-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm">Nouveau Devis</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">PDF Pro en 1 min</p>
                </div>
              </Link>
            )}

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

            {userRole !== 'employee' && (
              <Link href="/devis" className="group flex items-center gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/40 hover:bg-amber-500/10 transition-all">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm">Devis Instantané</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">60 secondes terrain</p>
                </div>
              </Link>
            )}

            <Link href="/planning" className="group flex items-center gap-4 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 hover:border-purple-500/40 hover:bg-purple-500/10 transition-all">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm">Planning</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                  {interventions.filter(i => i.status === 'scheduled' || i.status === 'in_progress').length} mission(s) active(s)
                </p>
              </div>
            </Link>
          </div>

          {/* Activity Widget - HIDDEN FOR EMPLOYEES */}
          {userRole !== 'employee' && (
            <div className="bg-secondary/30 border border-border rounded-[2.5rem] p-6">
               <h4 className="font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><Send className="w-3 h-3 text-primary" /> Dernière activité</h4>
               <div className="space-y-5">
                  {activities.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground italic text-center py-4">Aucune activité récente.</p>
                  ) : activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-500">
                       <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", activity.color)} />
                       <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate text-foreground/90">{activity.title}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">{getRelativeTime(activity.date)}</p>
                       </div>
                       <activity.icon className="w-3 h-3 text-muted-foreground/30 mt-1" />
                    </div>
                  ))}
               </div>
            </div>
          )}
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
