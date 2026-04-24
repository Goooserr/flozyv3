import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { CheckCircle2, FileText, Download, Building2, User, Clock, Check, Signature } from 'lucide-react';
import { Metadata } from 'next';
import { PublicActions } from '@/components/PublicActions';
import { PrintButton } from '@/components/PrintButton';

export const metadata: Metadata = {
  title: 'Portail Client | Flozy',
  description: 'Votre espace client sécurisé',
};

// Fonction pour récupérer le document depuis Supabase via la fonction SQL sécurisée
async function getDocument(id: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data, error } = await supabase.rpc('get_public_document', { doc_id: id });
  
  if (error || !data || !data.document) return null;
  return data;
}

export default async function ClientPortalPage({ params }: { params: { id: string } }) {
  const data = await getDocument(params.id);

  if (!data) {
    notFound();
  }

  const { document, artisan, client } = data;
  const items = document.metadata?.items || [];
  
  const statusLabels = {
    draft: 'Brouillon',
    pending: 'En attente',
    paid: 'Payé',
    overdue: 'En retard'
  };

  const isQuote = document.type === 'quote';

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-primary/20">
      {/* Header Premium (Artisan Branding) */}
      <header 
        className="w-full h-1.5" 
        style={{ backgroundColor: artisan.primary_color || '#000000' }}
      />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12">
          <div>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-black/5" style={{ backgroundColor: artisan.primary_color || '#000000' }}>
               <span className="text-white font-bold text-2xl uppercase">{artisan.company_name?.substring(0,2) || 'A'}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{artisan.company_name}</h1>
            <p className="text-zinc-500 mt-1 flex items-center gap-2">
               <Building2 className="w-4 h-4" /> {artisan.full_name}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 min-w-[250px]">
             <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Pour :</div>
             <p className="font-bold text-lg">{client?.full_name || 'Client'}</p>
             {client?.address && <p className="text-sm text-zinc-500 mt-1">{client.address}</p>}
          </div>
        </div>

        {/* Document Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden mb-8">
           <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div>
                 <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full">
                       {isQuote ? 'Devis' : 'Facture'}
                    </span>
                    <span className="text-sm font-medium text-zinc-400">Réf: {document.id.split('-')[0].toUpperCase()}</span>
                 </div>
                 <p className="text-sm text-zinc-500 flex items-center gap-1"><Clock className="w-4 h-4" /> Émis le {new Date(document.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                 <p className="text-4xl font-black">{Number(document.amount).toLocaleString()} €</p>
                 <p className="text-sm text-zinc-500 font-medium">TTC</p>
              </div>
           </div>

           <div className="p-8">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-zinc-400 uppercase tracking-widest border-b border-zinc-100">
                    <th className="pb-4 font-medium">Désignation</th>
                    <th className="pb-4 font-medium text-center">Qté</th>
                    <th className="pb-4 font-medium text-right">Prix Unitaire</th>
                    <th className="pb-4 font-medium text-right">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {items.map((item: any, i: number) => (
                    <tr key={i} className="text-sm">
                      <td className="py-4 font-medium">{item.description}</td>
                      <td className="py-4 text-center text-zinc-500">{item.quantity}</td>
                      <td className="py-4 text-right text-zinc-500">{Number(item.price).toLocaleString()} €</td>
                      <td className="py-4 text-right font-bold">{(item.quantity * item.price).toLocaleString()} €</td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                      <tr><td colSpan={4} className="py-8 text-center text-zinc-400 italic">Aucun détail fourni.</td></tr>
                  )}
                </tbody>
              </table>
           </div>
        </div>

         {/* Action Panel */}
         <div className="bg-zinc-900 text-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div>
               <h3 className="text-xl font-bold mb-2">Prêt à démarrer ?</h3>
               <p className="text-zinc-400 text-sm max-w-md">Validez ce document en ligne pour que nous puissions planifier l'intervention dans les meilleurs délais.</p>
            </div>
            
            {document.status === 'draft' || document.status === 'pending' ? (
              <PublicActions documentId={document.id} artisanColor={artisan.primary_color} />
            ) : (
              <div className="flex gap-4 w-full md:w-auto">
                 <PrintButton />
                 <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/20 text-emerald-400 rounded-xl font-bold border border-emerald-500/30">
                    <Check className="w-5 h-5" /> Validé
                 </div>
              </div>
            )}
         </div>

        <div className="mt-20 text-center flex items-center justify-center gap-2 text-zinc-400">
           <span className="text-xs font-medium">Propulsé de manière sécurisée par</span>
           <span className="font-bold text-sm text-zinc-900 tracking-tight italic">Flozy</span>
        </div>
      </div>
    </div>
  );
}
