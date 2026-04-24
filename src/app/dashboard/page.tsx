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
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDocuments, getClients } from '@/lib/actions';
import Link from 'next/link';

const statusStyles: any = {
  paid: 'bg-emerald-500/10 text-emerald-500',
  pending: 'bg-amber-500/10 text-amber-500',
  overdue: 'bg-rose-500/10 text-rose-500',
};

export default function Dashboard() {
  const [stats, setStats] = useState<any[]>([])
  const [recentInvoices, setRecentInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [docs, clients] = await Promise.all([
        getDocuments(),
        getClients()
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
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Tableau de bord</h2>
        <p className="text-muted-foreground text-sm">Bienvenue, Florian. Voici l'état de votre activité aujourd'hui.</p>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border p-6 rounded-2xl flex flex-col gap-4 hover:border-border/80 transition-colors">
            <div className="flex items-center justify-between">
              <div className={cn("p-2 rounded-lg bg-secondary", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-full">
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tables & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Plan Widget - NEW SENIOR APPROACH */}
        <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CalendarDays className="w-24 h-24 rotate-12" />
           </div>
           <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-4">
                 <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Ma Journée
              </div>
              <h3 className="text-xl font-bold mb-1">Installation Pompe à Chaleur</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> 15 rue des Lilas, Chambéry</p>
           </div>
           <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <Clock className="w-4 h-4 text-primary" />
                 <span className="text-sm font-bold">09:00 - 12:30</span>
              </div>
              <button onClick={() => window.open('https://maps.google.com/?q=15+rue+des+Lilas,+Chambéry', '_blank')} className="text-xs font-bold bg-white text-black px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition-all">
                 Y aller
              </button>
           </div>
        </div>

        {/* Recent Invoices Table */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Factures récentes</h3>
            <Link href="/invoices" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">Montant</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {recentInvoices.map((invoice) => {
                  const clientName = invoice.clients?.full_name || invoice.metadata?.client_info?.name || 'Client Inconnu';
                  const invoiceId = invoice.document_number || invoice.id?.split('-')[0] || 'INV';
                  const amount = (invoice.amount || 0).toLocaleString();
                  const statusLabel = invoice.status === 'paid' ? 'Payée' : invoice.status === 'pending' ? 'En attente' : 'Retard';
                  
                  const subject = encodeURIComponent(`Relance: Facture ${invoiceId} en attente`);
                  const body = encodeURIComponent(`Bonjour ${clientName},\n\nSauf erreur de notre part, le paiement de la facture ${invoiceId} d'un montant de ${amount} € n'a pas encore été reçu.\n\nVous trouverez le lien de paiement sécurisé sur votre portail client.\n\nMerci par avance pour votre retour,\n\nBien cordialement.`);
                  const mailtoLink = `mailto:client@example.com?subject=${subject}&body=${body}`;

                  return (
                    <tr key={invoice.id} className="text-sm hover:bg-secondary/30 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs">{invoiceId}</td>
                      <td className="px-6 py-4 font-medium">{clientName}</td>
                      <td className="px-6 py-4">{amount} €</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
                          statusStyles[invoice.status || 'pending']
                        )}>
                          {invoice.status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                          {invoice.status === 'pending' && <Clock className="w-3 h-3" />}
                          {invoice.status === 'overdue' && <AlertCircle className="w-3 h-3" />}
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {invoice.status === 'overdue' && (
                          <a href={mailtoLink} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20">
                            <Send className="w-3 h-3" /> Relancer
                          </a>
                        )}
                        {(invoice.status === 'pending' || invoice.status === 'paid') && (
                          <Link href={`/p/${invoice.id}`} target="_blank" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-secondary/80 transition-colors">
                            Voir
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <h3 className="font-semibold">Actions rapides</h3>
          <div className="grid grid-cols-1 gap-3">
            <Link href="/invoices/new" className="w-full text-left p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-sm flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <PlusCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Créer un devis</p>
                <p className="text-xs text-muted-foreground">Générer un PDF pro</p>
              </div>
            </Link>
            <Link href="/clients" className="w-full text-left p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-sm flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Nouveau client</p>
                <p className="text-xs text-muted-foreground">Ajouter au répertoire</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlusCircle(props: React.SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}
