import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { billingCycle?: unknown };
  const { billingCycle } = body;
  if (billingCycle !== 'monthly' && billingCycle !== 'annual') {
    return NextResponse.json({ error: 'billingCycle inválido' }, { status: 400 });
  }

    const priceId = billingCycle === 'annual'
      ? STRIPE_PRICE_IDS.proAnnual
      : STRIPE_PRICE_IDS.proMonthly;

    if (!priceId || priceId.startsWith('price_REEMPLAZA')) {
      return NextResponse.json(
        { error: 'Stripe no configurado. Añade los IDs de precio en .env.local' },
        { status: 503 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/cancel`,
      locale: 'es',
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { plan: 'quantum_pro', billingCycle },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
