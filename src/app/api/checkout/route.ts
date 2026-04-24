import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { planId, planName, price } = await req.json();
    
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth Error:', authError);
      return NextResponse.json({ error: 'Non autorisé - Veuillez vous reconnecter' }, { status: 401 });
    }

    // Création de la session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Abonnement Flozy - ${planName}`,
              description: `Accès illimité aux outils ${planName}`,
            },
            unit_amount: price * 100, // En centimes
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: planId,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/billing?canceled=true`,
      metadata: {
        userId: user.id,
        planId: planId,
      },
      customer_email: user.email,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
