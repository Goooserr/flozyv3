import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  Users, 
  ArrowUpRight, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data qui reflète la future structure de la DB
const stats = [
  { 
    label: 'Chiffre d\'affaires', 
    value: '12 450,00 €', 
    trend: '+12%', 
    icon: TrendingUp,
    color: 'text-emerald-500'
  },
  { 
    label: 'En attente', 
    value: '3 200,00 €', 
    trend: '4 factures', 
    icon: Clock,
    color: 'text-amber-500'
  },
  { 
    label: 'Clients actifs', 
    value: '24', 
    trend: '+2 ce mois', 
    icon: Users,
    color: 'text-blue-500'
  },
];

const recentInvoices = [
  { id: 'FAC-001', client: 'Jean Dupont', amount: '1 250,00 €', status: 'paid', date: '20 Mai 2024' },
  { id: 'FAC-002', client: 'Marie Martin', amount: '850,00 €', status: 'pending', date: '21 Mai 2024' },
  { id: 'FAC-003', client: 'Pierre Durant', amount: '2 100,00 €', status: 'overdue', date: '15 Mai 2024' },
];

const statusStyles = {
  paid: 'bg-emerald-500/10 text-emerald-500',
  pending: 'bg-amber-500/10 text-amber-500',
  overdue: 'bg-rose-500/10 text-rose-500',
};

export default function Dashboard() {
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
        {/* Recent Invoices Table */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Factures récentes</h3>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">Montant</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="text-sm hover:bg-secondary/30 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs">{invoice.id}</td>
                    <td className="px-6 py-4 font-medium">{invoice.client}</td>
                    <td className="px-6 py-4">{invoice.amount}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
                        statusStyles[invoice.status as keyof typeof statusStyles]
                      )}>
                        {invoice.status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                        {invoice.status === 'pending' && <Clock className="w-3 h-3" />}
                        {invoice.status === 'overdue' && <AlertCircle className="w-3 h-3" />}
                        {invoice.status === 'paid' ? 'Payée' : invoice.status === 'pending' ? 'En attente' : 'Retard'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <h3 className="font-semibold">Actions rapides</h3>
          <div className="grid grid-cols-1 gap-3">
            <button className="w-full text-left p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-sm flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <PlusCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Créer un devis</p>
                <p className="text-xs text-muted-foreground">Générer un PDF pro</p>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-sm flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Nouveau client</p>
                <p className="text-xs text-muted-foreground">Ajouter au répertoire</p>
              </div>
            </button>
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
