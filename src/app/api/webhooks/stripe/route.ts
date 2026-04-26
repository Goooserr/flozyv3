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
    return NextResponse.json({ error: `Signature Error: ${err.message}` }, { status: 400 });
  }

  const debug: any = { event: event.type, updated: false };

  if (event.type === 'checkout.session.completed' || event.type === 'invoice.paid' || event.type === 'customer.subscription.updated') {
    const obj = event.data.object as any;
    
    // 1. Identification
    const userId = obj.metadata?.userId || obj.subscription_data?.metadata?.userId || obj.client_reference_id;
    const customerEmail = obj.customer_email || obj.customer_details?.email || obj.email;
    
    // 2. Détection du Plan
    let planId = (obj.metadata?.planId || '').toLowerCase();
    if (!planId && obj.subscription) {
       const sub = await stripe.subscriptions.retrieve(obj.subscription as string);
       planId = (sub.metadata?.planId || '').toLowerCase();
    }
    if (!planId) {
      const amount = obj.amount_total || obj.amount_paid || obj.total || 0;
      if (amount >= 4000) planId = 'expert';
      else if (amount >= 2000) planId = 'pro';
    }

    if (!planId) planId = 'pro';

    debug.planId = planId;
    debug.userId = userId;
    debug.customerEmail = customerEmail;

    const modules = planId === 'expert' 
      ? ['clients', 'documents', 'planning', 'stock']
      : ['clients', 'documents', 'planning'];

    const updatePayload = { subscription_plan: planId, enabled_modules: modules, subscription_status: 'active' };

    // Tentative de mise à jour
    if (customerEmail) {
      const { data, error } = await supabaseAdmin.from('profiles').update(updatePayload).eq('email', customerEmail).select();
      if (!error && data && data.length > 0) debug.updatedByEmail = true;
      if (error) debug.emailError = error;
    }

    if (!debug.updatedByEmail && userId) {
      const { data, error } = await supabaseAdmin.from('profiles').update(updatePayload).eq('id', userId).select();
      if (!error && data && data.length > 0) debug.updatedById = true;
      if (error) debug.idError = error;
    }

    debug.updated = debug.updatedByEmail || debug.updatedById || false;
  }

  return NextResponse.json(debug);
}
