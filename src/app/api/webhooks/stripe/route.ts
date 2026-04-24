import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Utilisation d'un client admin pour outrepasser les RLS lors de la mise à jour du plan
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

  // Gérer l'événement checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;

    if (userId && planId) {
      // Définir les modules en fonction du plan
      let modules = ['clients', 'documents'];
      if (planId === 'expert') {
        modules = ['clients', 'documents', 'planning', 'stock'];
      } else if (planId === 'pro') {
        modules = ['clients', 'documents', 'planning'];
      }

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          subscription_plan: planId,
          subscription_status: 'active',
          enabled_modules: modules
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating profile via webhook:', error);
      } else {
        console.log(`Plan updated for user ${userId}: ${planId}`);
      }
    }
  }

  return NextResponse.json({ received: true });
}
