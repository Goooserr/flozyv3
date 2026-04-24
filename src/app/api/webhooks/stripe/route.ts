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
    
    // Extraction des données essentielles (avec recherche profonde dans les détails de l'abonnement)
    const userId = session.metadata?.userId || session.subscription_details?.metadata?.userId || session.client_reference_id;
    const planId = session.metadata?.planId || session.subscription_details?.metadata?.planId || 'pro';
    const customerEmail = session.customer_email || session.customer_details?.email;

    console.log(`🔔 STRIPE WEBHOOK : [${event.type}]`);
    console.log(`   - UserID metadata: ${userId}`);
    console.log(`   - Email: ${customerEmail}`);
    console.log(`   - Plan: ${planId}`);

    if (userId || customerEmail) {
      const modules = planId === 'expert' 
        ? ['clients', 'documents', 'planning', 'stock']
        : planId === 'pro' 
          ? ['clients', 'documents', 'planning']
          : ['clients', 'documents'];

      // 1. Tentative par ID (Recommandé)
      if (userId) {
        console.log(`🔄 Mise à jour par ID: ${userId}...`);
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .update({ 
            subscription_plan: planId,
            subscription_status: 'active',
            enabled_modules: modules
          })
          .eq('id', userId)
          .select();

        if (error) console.error('❌ Erreur Supabase (ID):', error);
        if (data && data.length > 0) {
          console.log('✅ SUCCÈS : Plan activé via ID !');
          return NextResponse.json({ received: true });
        }
      }

      // 2. Tentative par Email (Fallback)
      if (customerEmail) {
        console.log(`🔄 Fallback : Mise à jour par Email: ${customerEmail}...`);
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .update({ 
            subscription_plan: planId,
            subscription_status: 'active',
            enabled_modules: modules
          })
          .eq('email', customerEmail)
          .select();

        if (error) console.error('❌ Erreur Supabase (Email):', error);
        if (data && data.length > 0) {
          console.log('✅ SUCCÈS : Plan activé via Email !');
          return NextResponse.json({ received: true });
        }
      }

      console.warn('⚠️ ATTENTION : Aucun compte trouvé correspondant à cet ID ou cet Email.');
    }
  }

  return NextResponse.json({ received: true });
}
