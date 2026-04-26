import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Erreur signature: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error` }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Reçu: ${event.type}`);

  if (event.type === 'checkout.session.completed' || event.type === 'invoice.paid' || event.type === 'customer.subscription.updated') {
    const obj = event.data.object as any;
    
    // 1. Chercher le userId partout
    let userId = obj.metadata?.userId || obj.subscription_data?.metadata?.userId || obj.client_reference_id;
    
    // Si c'est une facture, on cherche dans l'abonnement lié
    if (!userId && obj.subscription) {
      const sub = await stripe.subscriptions.retrieve(obj.subscription as string);
      userId = sub.metadata?.userId;
    }

    // 2. Chercher le planId
    let planId = (obj.metadata?.planId || '').toLowerCase();
    if (!planId && obj.subscription) {
       const sub = await stripe.subscriptions.retrieve(obj.subscription as string);
       planId = (sub.metadata?.planId || '').toLowerCase();
    }

    // 3. Fallback par montant si toujours rien
    if (!planId) {
      const amount = obj.amount_total || obj.amount_paid || obj.total || 0;
      if (amount >= 4000) planId = 'expert';
      else if (amount >= 2000) planId = 'pro';
    }

    const customerEmail = obj.customer_email || obj.customer_details?.email || obj.email;

    if (!planId) planId = 'pro'; // Par défaut pro si on a un paiement mais pas de plan identifié

    console.log(`[Stripe Webhook] Traitement -> Plan: ${planId} | User: ${userId} | Email: ${customerEmail}`);

    const modules = planId === 'expert' 
      ? ['clients', 'documents', 'planning', 'stock']
      : ['clients', 'documents', 'planning'];

    const updatePayload = { 
      subscription_plan: planId,
      enabled_modules: modules,
      subscription_status: 'active'
    };

    let updated = false;

    // 1. Essai par Email (LE PLUS FIABLE si on recrée des comptes souvent)
    if (customerEmail) {
      const { data, error } = await supabaseAdmin.from('profiles').update(updatePayload).eq('email', customerEmail).select();
      if (!error && data && data.length > 0) {
        updated = true;
        console.log(`[Stripe Webhook] SUCCÈS : Plan mis à jour par Email (${customerEmail})`);
      } else if (error) {
        console.error(`[Stripe Webhook] Erreur MAJ Email:`, error);
      }
    }

    // 2. Essai par ID (Si email a échoué)
    if (!updated && userId) {
      const { data, error } = await supabaseAdmin.from('profiles').update(updatePayload).eq('id', userId).select();
      if (!error && data && data.length > 0) {
        updated = true;
        console.log(`[Stripe Webhook] SUCCÈS : Plan mis à jour par ID (${userId})`);
      } else if (error) {
        console.error(`[Stripe Webhook] Erreur MAJ ID:`, error);
      }
    }

    if (!updated) {
      console.error(`[Stripe Webhook] ÉCHEC : Aucun profil trouvé pour l'email ${customerEmail} ou l'ID ${userId}`);
    }
  }

  return NextResponse.json({ received: true });
}
