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

  // Gérer l'événement checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;

    console.log(`🔔 Webhook reçu pour l'utilisateur ${userId} - Plan: ${planId}`);

    if (userId && planId) {
      // Définir les modules en fonction du plan
      let modules = ['clients', 'documents'];
      if (planId === 'expert') {
        modules = ['clients', 'documents', 'planning', 'stock'];
      } else if (planId === 'pro') {
        modules = ['clients', 'documents', 'planning'];
      }

      console.log(`🔄 Mise à jour du profil Supabase...`);

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
        console.error('❌ Erreur Supabase lors de la mise à jour:', error);
      } else if (data && data.length > 0) {
        console.log(`✅ Profil mis à jour avec succès pour ${userId}`);
      } else {
        console.warn(`⚠️ Aucun profil trouvé pour l'ID ${userId}`);
      }
    } else {
      console.error('❌ Metadata manquantes dans la session Stripe (userId ou planId)');
    }
  }

  return NextResponse.json({ received: true });
}
