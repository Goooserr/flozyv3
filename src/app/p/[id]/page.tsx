import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { 
  Building2, Clock, Check, Camera, Image as ImageIcon, 
  Phone, Mail, MapPin, Star, Shield, Zap, FileText,
  ArrowRight, CheckCircle2, MessageSquare
} from 'lucide-react';
import type { Metadata } from 'next';
import { PublicActions } from '@/components/PublicActions';
import { PrintButton } from '@/components/PrintButton';

// --- DATA FETCHING ---
async function getDocument(id: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  const { data, error } = await supabase.rpc('get_public_document', { doc_id: id });
  if (error || !data || !data.document) return null;
  return data;
}

async function getPhotos(clientId: string, artisanId: string) {
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data: inters } = await supabaseAdmin
    .from('interventions')
    .select('id')
    .eq('client_id', clientId)
    .eq('artisan_id', artisanId);

  if (!inters || inters.length === 0) return [];

  const interIds = inters.map(i => i.id);
  const { data: p } = await supabaseAdmin
    .from('intervention_photos')
    .select('url')
    .in('intervention_id', interIds)
    .order('created_at', { ascending: false })
    .limit(8);

  return p ? p.map(x => x.url) : [];
}

// --- DYNAMIC METADATA (SEO) ---
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const data = await getDocument(id);
  if (!data) return { title: 'Document | Flozy' };

  const { document, artisan, client } = data;
  const docType = document.type === 'quote' ? 'Devis' : 'Facture';
  const amount = Number(document.amount).toLocaleString('fr-FR');
  const artisanName = artisan.company_name || artisan.full_name || 'Artisan';
  const clientName = client?.full_name || 'Client';

  return {
    title: `${docType} ${amount}€ — ${artisanName} pour ${clientName} | Flozy`,
    description: `${docType} professionnel émis par ${artisanName}. Consultez le détail des prestations et signez en ligne.`,
    openGraph: {
      title: `${docType} de ${artisanName}`,
      description: `Montant : ${amount}€ TTC — Document sécurisé Flozy`,
      type: 'website',
    },
  };
}

// --- PAGE ---
export default async function ClientPortalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getDocument(id);

  if (!data) notFound();

  const { document, artisan, client } = data;
  const items = document.metadata?.items || [];
  const isQuote = document.type === 'quote';
  const isPending = document.status === 'draft' || document.status === 'pending';
  const isValidated = document.status === 'paid' || document.status === 'accepted';

  const primaryColor = artisan.primary_color || '#6366f1';
  const artisanName = artisan.company_name || artisan.full_name || 'Artisan';
  const initials = artisanName.substring(0, 2).toUpperCase();

  // Photos: available on Pro + Expert (not just Expert anymore)
  let photos: string[] = [];
  if (client?.id && artisan?.subscription_plan !== 'starter') {
    photos = await getPhotos(client.id, artisan.id || '');
  }

  const totalHT = items.reduce((a: number, i: any) => a + (i.quantity * i.price), 0);
  const tva = totalHT * 0.2;

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-zinc-900 font-sans">
      
      {/* Top color bar */}
      <div className="w-full h-1" style={{ backgroundColor: primaryColor }} />

      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-zinc-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {artisan.logo_url ? (
              <img src={artisan.logo_url} alt={artisanName} className="w-9 h-9 rounded-xl object-contain border border-zinc-100" />
            ) : (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0" style={{ backgroundColor: primaryColor }}>
                {initials}
              </div>
            )}
            <div>
              <p className="font-black text-sm leading-tight">{artisanName}</p>
              <p className="text-[10px] text-zinc-400 font-medium">Document sécurisé Flozy</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest ${
              isValidated
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {isValidated ? '✓ Validé' : isPending ? 'En attente' : document.status}
            </span>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest bg-zinc-100 text-zinc-600">
              {isQuote ? 'Devis' : 'Facture'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-10 space-y-8">

        {/* ==================== ARTISAN HERO CARD ==================== */}
        <section className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
          {/* Color accent top */}
          <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}05)` }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 80% 50%, ${primaryColor}, transparent 60%)` }} />
          </div>

          <div className="px-8 pb-8 -mt-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              {/* Logo + infos */}
              <div className="flex items-end gap-5">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl border-4 border-white shrink-0" style={{ backgroundColor: primaryColor }}>
                  {artisan.logo_url ? (
                    <img src={artisan.logo_url} alt={artisanName} className="w-full h-full object-contain rounded-xl" />
                  ) : initials}
                </div>
                <div className="pb-1">
                  <h1 className="text-2xl font-black tracking-tight leading-tight">{artisanName}</h1>
                  {artisan.full_name && artisan.company_name && (
                    <p className="text-sm text-zinc-500 flex items-center gap-1.5 mt-1">
                      <Building2 className="w-3.5 h-3.5 shrink-0" /> {artisan.full_name}
                    </p>
                  )}
                  {artisan.business_type && (
                    <p className="text-xs text-zinc-400 mt-0.5 font-medium">{artisan.business_type}</p>
                  )}
                </div>
              </div>

              {/* Contact buttons */}
              <div className="flex flex-wrap gap-2 pb-1">
                {artisan.phone && (
                  <a
                    href={`tel:${artisan.phone}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-colors text-sm font-bold"
                  >
                    <Phone className="w-4 h-4" style={{ color: primaryColor }} />
                    {artisan.phone}
                  </a>
                )}
                {artisan.email && (
                  <a
                    href={`mailto:${artisan.email}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-colors text-sm font-bold"
                  >
                    <Mail className="w-4 h-4" style={{ color: primaryColor }} />
                    Email
                  </a>
                )}
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-zinc-50">
              {[
                { icon: Shield, label: 'Document sécurisé' },
                { icon: CheckCircle2, label: 'Artisan vérifié Flozy' },
                { icon: Zap, label: 'Signature électronique légale' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                  <Icon className="w-3.5 h-3.5 text-emerald-500" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== DOCUMENT CARD ==================== */}
        <section className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
          {/* Document header */}
          <div className="p-6 md:p-8 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50/50">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-3 py-1 text-white text-xs font-black uppercase tracking-widest rounded-full" style={{ backgroundColor: primaryColor }}>
                  {isQuote ? 'Devis' : 'Facture'}
                </span>
                <span className="text-sm text-zinc-400 font-mono">Réf: {document.document_number || document.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <p className="text-sm text-zinc-500 flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" />
                Émis le {new Date(document.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              {client?.full_name && (
                <p className="text-sm text-zinc-500 flex items-center gap-2 mt-1">
                  <Building2 className="w-4 h-4 shrink-0" />
                  Pour : <span className="font-bold text-zinc-900">{client.full_name}</span>
                </p>
              )}
            </div>
            <div className="text-left md:text-right">
              <p className="text-4xl md:text-5xl font-black tracking-tighter" style={{ color: primaryColor }}>
                {Number(document.amount).toLocaleString('fr-FR')} €
              </p>
              <p className="text-sm text-zinc-400 font-medium mt-1">TTC (TVA 20% incluse)</p>
            </div>
          </div>

          {/* Items table */}
          <div className="p-6 md:p-8 overflow-x-auto">
            <table className="w-full text-left min-w-[400px]">
              <thead>
                <tr className="text-[10px] text-zinc-400 uppercase tracking-widest border-b border-zinc-100">
                  <th className="pb-4 font-bold">Désignation</th>
                  <th className="pb-4 font-bold text-center w-16">Qté</th>
                  <th className="pb-4 font-bold text-right w-28">Prix HT</th>
                  <th className="pb-4 font-bold text-right w-28">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {items.map((item: any, i: number) => (
                  <tr key={i} className="text-sm group">
                    <td className="py-4 font-medium">{item.description || '—'}</td>
                    <td className="py-4 text-center text-zinc-500">{item.quantity}</td>
                    <td className="py-4 text-right text-zinc-500">{Number(item.price).toLocaleString('fr-FR')} €</td>
                    <td className="py-4 text-right font-bold">{(item.quantity * item.price).toLocaleString('fr-FR')} €</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={4} className="py-10 text-center text-zinc-400 italic text-sm">Aucun détail de prestation fourni.</td></tr>
                )}
              </tbody>
            </table>

            {/* Totals */}
            {items.length > 0 && (
              <div className="mt-6 pt-6 border-t border-zinc-100 flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm text-zinc-500">
                    <span>Sous-total HT</span>
                    <span className="font-semibold">{totalHT.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="flex justify-between text-sm text-zinc-500">
                    <span>TVA 20%</span>
                    <span className="font-semibold">{tva.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="flex justify-between text-lg font-black border-t border-zinc-200 pt-3 mt-3">
                    <span>Total TTC</span>
                    <span style={{ color: primaryColor }}>{Number(document.amount).toLocaleString('fr-FR')} €</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Signature display if already signed */}
          {document.metadata?.signature && (
            <div className="px-8 pb-8 flex flex-col md:flex-row items-center gap-4">
              <div className="border-2 border-dashed border-zinc-200 rounded-2xl p-4 flex flex-col items-center gap-2 w-full md:w-auto">
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Signature client</p>
                <img src={document.metadata.signature} alt="Signature" className="h-16 mix-blend-multiply" />
                <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-black uppercase">
                  <CheckCircle2 className="w-3 h-3" /> Validé par le client
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ==================== PHOTOS CHANTIER ==================== */}
        {photos.length > 0 && (
          <section className="bg-zinc-900 text-white rounded-3xl overflow-hidden shadow-xl">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black">Carnet d'Ouvrage</h2>
                  <p className="text-zinc-400 text-sm">Photos de l'intervention — transparence totale</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {photos.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square rounded-2xl overflow-hidden block group relative bg-zinc-800"
                  >
                    <img
                      src={url}
                      alt={`Chantier photo ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] text-white font-black uppercase tracking-widest bg-black/60 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <ImageIcon className="w-3 h-3" /> Agrandir
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ==================== ACTION PANEL ==================== */}
        <section className="bg-zinc-900 text-white rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="md:max-w-sm">
              {isValidated ? (
                <>
                  <h2 className="text-xl font-black mb-2">Document validé ✓</h2>
                  <p className="text-zinc-400 text-sm">Ce document a été accepté et signé. Vous pouvez le télécharger ci-dessous.</p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-black mb-2">
                    {isQuote ? 'Accepter ce devis' : 'Procéder au paiement'}
                  </h2>
                  <p className="text-zinc-400 text-sm">
                    {isQuote
                      ? 'Signez en ligne pour valider le devis. Nous planifierons l\'intervention immédiatement.'
                      : 'Confirmez la réception de ce document et contactez directement l\'artisan pour le règlement.'}
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              {isPending ? (
                <PublicActions documentId={document.id} artisanColor={primaryColor} />
              ) : (
                <div className="flex gap-3 flex-wrap">
                  <PrintButton />
                  <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/20 text-emerald-400 rounded-xl font-bold border border-emerald-500/30">
                    <Check className="w-5 h-5" /> Validé
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ==================== DEMANDER UN DEVIS (Public CTA) ==================== */}
        <section className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: primaryColor + '15' }}>
              <MessageSquare className="w-6 h-6" style={{ color: primaryColor }} />
            </div>
            <div>
              <h2 className="text-xl font-black">Besoin d'un autre chantier ?</h2>
              <p className="text-sm text-zinc-500">Demandez un devis gratuit directement à {artisanName}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Zap, label: 'Réponse rapide', desc: 'Devis sous 24h' },
              { icon: Shield, label: 'Artisan certifié', desc: 'Travail garanti' },
              { icon: Star, label: 'Service premium', desc: 'Via Flozy Pro' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl">
                <Icon className="w-5 h-5 shrink-0" style={{ color: primaryColor }} />
                <div>
                  <p className="font-bold text-sm">{label}</p>
                  <p className="text-xs text-zinc-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {artisan.phone && (
              <a
                href={`tel:${artisan.phone}`}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white text-sm transition-all hover:opacity-90 shadow-lg"
                style={{ backgroundColor: primaryColor, boxShadow: `0 8px 25px ${primaryColor}30` }}
              >
                <Phone className="w-5 h-5" />
                Appeler {artisanName}
              </a>
            )}
            {artisan.email && (
              <a
                href={`mailto:${artisan.email}?subject=Demande de devis&body=Bonjour, je souhaite obtenir un devis pour...`}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm border-2 border-zinc-200 hover:border-zinc-300 transition-colors"
              >
                <FileText className="w-5 h-5" />
                Demander un devis par email
              </a>
            )}
            {!artisan.phone && !artisan.email && (
              <p className="text-sm text-zinc-400 italic text-center py-4">
                Contactez directement {artisanName} pour toute nouvelle demande.
              </p>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-zinc-400 text-xs py-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Document généré et sécurisé par</span>
            <span className="font-black text-zinc-700 tracking-tight italic">Flozy</span>
            <span>— Logiciel de gestion artisan</span>
          </div>
          {isQuote && (
            <p className="text-zinc-300">Devis valable 30 jours · Sans engagement</p>
          )}
        </footer>
      </main>
    </div>
  );
}
