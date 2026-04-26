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

  // Liste des événements que l'on traite (on est très large pour ne rien rater)
  const relevantEvents = [
    'checkout.session.completed',
    'invoice.paid',
    'invoice.payment_succeeded',
    'invoice.finalized',
    'invoice.created',
    'customer.subscription.created',
    'customer.subscription.updated'
  ];

  if (relevantEvents.includes(event.type)) {
    const obj = event.data.object as any;
    
    // 1. Récupération de l'Email et du Plan (Investigation profonde)
    let customerEmail = obj.customer_email || obj.customer_details?.email || obj.email;
    let userId = obj.metadata?.userId || obj.subscription_data?.metadata?.userId || obj.client_reference_id;
    let planId = (obj.metadata?.planId || '').toLowerCase();

    // Si on n'a pas l'email mais qu'on a un ID client, on va le chercher chez Stripe
    if (!customerEmail && obj.customer) {
      const customer = await stripe.customers.retrieve(obj.customer as string) as Stripe.Customer;
      customerEmail = customer.email;
      if (!userId) userId = customer.metadata?.userId;
    }

    // Si on n'a pas le plan mais qu'on a un abonnement, on va le chercher chez Stripe
    const subId = obj.subscription || (obj.object === 'subscription' ? obj.id : null);
    if (!planId && subId) {
       const sub = await stripe.subscriptions.retrieve(subId as string);
       planId = (sub.metadata?.planId || '').toLowerCase();
       if (!userId) userId = sub.metadata?.userId;
    }

    // Fallback par montant
    if (!planId) {
      const amount = obj.amount_total || obj.amount_paid || obj.total || 0;
      if (amount >= 4000) planId = 'expert';
      else if (amount >= 2000) planId = 'pro';
      else planId = 'pro'; // Par défaut pro si paiement mais inconnu
    }

    debug.found = { planId, userId, customerEmail };

    const modules = planId === 'expert' 
      ? ['clients', 'documents', 'planning', 'stock']
      : ['clients', 'documents', 'planning'];

    const updatePayload = { subscription_plan: planId, enabled_modules: modules, subscription_status: 'active' };

    // 2. Mise à jour Supabase (Stratégie Infaillible)
    let finalUserId = userId;

    // Si on n'a pas d'ID mais un Email, on cherche l'ID dans auth.users
    if (!finalUserId && customerEmail) {
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      if (!authError && authUsers.users) {
        const user = authUsers.users.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase());
        if (user) finalUserId = user.id;
      }
    }

    if (finalUserId) {
      // UPSERT : Crée le profil s'il n'existe pas, ou le met à jour s'il existe
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .upsert({ 
          id: finalUserId,
          ...updatePayload,
          email: customerEmail // On en profite pour mettre l'email
        }, { onConflict: 'id' })
        .select();

      if (!error && data && data.length > 0) debug.updatedById = true;
      if (error) debug.idError = error;
    } else if (customerEmail) {
      // Fallback par email uniquement si on n'a vraiment pas trouvé l'ID
      const { data, error } = await supabaseAdmin.from('profiles').update(updatePayload).eq('email', customerEmail).select();
      if (!error && data && data.length > 0) debug.updatedByEmail = true;
      if (error) debug.emailError = error;
    }

    debug.updated = debug.updatedByEmail || debug.updatedById || false;
    debug.finalUserId = finalUserId;
  }

  return NextResponse.json(debug);
}
