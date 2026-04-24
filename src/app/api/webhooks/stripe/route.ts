import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Utilisation d'un client admin pour outrepasser les RLS lors de la mise à jour du plan
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  console.log(`📦 Webhook reçu - Taille du corps: ${body.length} octets`);
  console.log(`🔑 Signature Stripe présente: ${!!sig}`);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log(`✅ Signature Webhook validée - Type d'événement: ${event.type}`);
  } catch (err: any) {
    console.error(`❌ Erreur de validation Webhook: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Gérer l'événement checkout.session.completed OU invoice.paid
  if (event.type === 'checkout.session.completed' || event.type === 'invoice.paid') {
    const session = event.data.object as any;
    
    // Extraction ultra-robuste des données
    const userId = session.metadata?.userId || session.subscription_details?.metadata?.userId || session.client_reference_id;
    const planId = session.metadata?.planId || session.subscription_details?.metadata?.planId || 'pro';
    const customerEmail = session.customer_email || session.customer_details?.email;

    console.log(`🔔 Webhook [${event.type}] reçu.`);
    console.log(`🆔 ID Utilisateur: ${userId}`);
    console.log(`📧 Email Client: ${customerEmail}`);
    console.log(`📦 Plan: ${planId}`);

    if (userId || customerEmail) {
      let modules = ['clients', 'documents'];
      if (planId === 'expert') {
        modules = ['clients', 'documents', 'planning', 'stock'];
      } else if (planId === 'pro') {
        modules = ['clients', 'documents', 'planning'];
      }

      console.log(`🔄 Recherche et mise à jour du profil...`);

      // Tentative de mise à jour par ID
      let query = supabaseAdmin.from('profiles').update({ 
        subscription_plan: planId,
        subscription_status: 'active',
        enabled_modules: modules
      });

      if (userId) {
        query = query.eq('id', userId);
      } else {
        query = query.eq('email', customerEmail);
      }

      const { data, error } = await query.select();

      if (error) {
        console.error('❌ Erreur Supabase:', error);
      } else if (data && data.length > 0) {
        console.log(`✅ SUCCÈS : Profil mis à jour pour ${customerEmail || userId}`);
      } else {
        console.warn(`⚠️ ÉCHEC : Aucun profil trouvé pour ${customerEmail || userId}.`);
      }
    } else {
      console.warn('ℹ️ Événement ignoré : Ni ID ni Email trouvés dans Stripe');
    }
  }

  return NextResponse.json({ received: true });
}
