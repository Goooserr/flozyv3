import React from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Filter,
  Download,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const invoices = [
  { id: 'FAC-2024-001', client: 'Jean Dupont', amount: '1 250,00 €', status: 'paid', date: '20/05/2024', type: 'Facture' },
  { id: 'DEV-2024-042', client: 'Marie Martin', amount: '850,00 €', status: 'pending', date: '21/05/2024', type: 'Devis' },
  { id: 'FAC-2024-002', client: 'Pierre Durant', amount: '2 100,00 €', status: 'overdue', date: '15/05/2024', type: 'Facture' },
  { id: 'DEV-2024-043', client: 'SCI Belle Vue', amount: '4 500,00 €', status: 'draft', date: '22/05/2024', type: 'Devis' },
];

const statusStyles = {
  paid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  overdue: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  draft: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

const statusLabels: Record<string, string> = {
  paid: 'Payée',
  pending: 'En attente',
  overdue: 'En retard',
  draft: 'Brouillon',
};

export default function InvoicesPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground text-sm">Gérez vos devis et factures en toute simplicité.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg font-medium text-sm hover:bg-secondary transition-colors">
            <Plus className="w-4 h-4" />
            Nouveau Devis
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            Nouvelle Facture
          </button>
        </div>
      </div>

      {/* Tabs / Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-xl w-fit">
          <button className="px-4 py-1.5 text-sm font-medium bg-secondary rounded-lg shadow-sm">Tous</button>
          <button className="px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Devis</button>
          <button className="px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Factures</button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="bg-card border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button className="p-2 border border-border rounded-lg hover:bg-secondary transition-colors">
            <Filter className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border bg-secondary/30">
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Numéro</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Montant</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {invoices.map((doc) => (
                <tr key={doc.id} className="text-sm hover:bg-secondary/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      doc.type === 'Facture' ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
                    )}>
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{doc.id}</td>
                  <td className="px-6 py-4 font-medium">{doc.client}</td>
                  <td className="px-6 py-4 text-muted-foreground">{doc.date}</td>
                  <td className="px-6 py-4 font-semibold">{doc.amount}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                      statusStyles[doc.status as keyof typeof statusStyles]
                    )}>
                      {doc.status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                      {doc.status === 'pending' && <Clock className="w-3 h-3" />}
                      {doc.status === 'overdue' && <AlertCircle className="w-3 h-3" />}
                      {statusLabels[doc.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-all">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-all">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
