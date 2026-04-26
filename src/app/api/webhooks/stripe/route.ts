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
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed' || event.type === 'invoice.paid' || event.type === 'customer.subscription.updated') {
    const session = event.data.object as any;
    const userId = session.metadata?.userId || session.client_reference_id;
    const customerEmail = session.customer_email || session.customer_details?.email;
    
    // Normalisation du plan ID (tout en minuscules)
    let planId = (session.metadata?.planId || '').toLowerCase();

    // Détection automatique par montant si planId est manquant
    if (!planId) {
      const amount = session.amount_total || session.amount_paid || 0;
      if (amount >= 4500) planId = 'expert';
      else if (amount >= 2500) planId = 'pro';
      else planId = 'starter';
    }

    // Définition des modules selon le palier
    const modules = planId === 'expert' 
      ? ['clients', 'documents', 'planning', 'stock']
      : planId === 'pro' 
        ? ['clients', 'documents', 'planning']
        : ['clients', 'documents'];

    console.log(`[Stripe Webhook] Mise à jour plan : ${planId} pour ${userId || customerEmail}`);

    const updatePayload = { 
      subscription_plan: planId,
      enabled_modules: modules,
      subscription_status: 'active'
    };

    if (userId) {
      const { error } = await supabaseAdmin.from('profiles').update(updatePayload).eq('id', userId);
      if (error) console.error("[Stripe Webhook] Erreur mise à jour ID:", error);
    } else if (customerEmail) {
      const { error } = await supabaseAdmin.from('profiles').update(updatePayload).eq('email', customerEmail);
      if (error) console.error("[Stripe Webhook] Erreur mise à jour Email:", error);
    }
  }

  return NextResponse.json({ received: true });
}
