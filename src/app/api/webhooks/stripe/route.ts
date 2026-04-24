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
    
    // Pour invoice.paid, les metadata sont souvent dans la subscription ou le customer
    const userId = session.metadata?.userId || session.subscription_details?.metadata?.userId;
    const planId = session.metadata?.planId || session.subscription_details?.metadata?.planId;

    console.log(`🔔 Webhook [${event.type}] reçu pour l'utilisateur ${userId} - Plan: ${planId}`);

    if (userId && planId) {
      let modules = ['clients', 'documents'];
      if (planId === 'expert') {
        modules = ['clients', 'documents', 'planning', 'stock'];
      } else if (planId === 'pro') {
        modules = ['clients', 'documents', 'planning'];
      }

      console.log(`🔄 Tentative de mise à jour du profil ${userId}...`);

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          subscription_plan: planId,
          subscription_status: 'active',
          enabled_modules: modules
        })
        .eq('id', userId)
        .select();

      if (error) {
        console.error('❌ Erreur Supabase:', error);
      } else if (data && data.length > 0) {
        console.log(`✅ SUCCÈS : Profil mis à jour pour ${userId}`);
      } else {
        console.warn(`⚠️ Aucun profil trouvé pour l'ID ${userId}. Vérifiez la table 'profiles'.`);
      }
    } else {
      console.warn('ℹ️ Événement ignoré : Pas de userId dans les metadata');
    }
  }

  return NextResponse.json({ received: true });
}
