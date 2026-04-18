import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      priceId?: string;
      billingCycle?: 'monthly' | 'annual';
      locale?: string;
    };

    const { priceId, billingCycle, locale } = body;

    // Acepta priceId directo o billingCycle como shorthand
    const resolvedPriceId = priceId
      ?? (billingCycle === 'annual' ? STRIPE_PRICE_IDS.proAnnual : STRIPE_PRICE_IDS.proMonthly);

    if (!resolvedPriceId || resolvedPriceId.startsWith('price_REEMPLAZA')) {
      return NextResponse.json(
        { error: 'Stripe no configurado. Añade los IDs de precio en .env.local' },
        { status: 503 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const stripeLocale = locale === 'en' ? 'en' : 'es';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: resolvedPriceId, quantity: 1 }],
      success_url: `${appUrl}/gracias?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/#pricing`,
      locale: stripeLocale as 'en' | 'es',
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          plan: 'quantum_pro',
          billingCycle: billingCycle ?? 'monthly',
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
