import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PRICE_IDS } from '@/app/lib/stripe';

const CRYPTO_PRICES_EUR = { monthly: 9, annual: 90 } as const;

async function createBTCPayInvoice(params: {
  amountEur: number;
  billingCycle: 'monthly' | 'annual';
  userId?: string;
  appUrl: string;
}) {
  const { BTCPAY_SERVER_URL, BTCPAY_API_KEY, BTCPAY_STORE_ID } = process.env;
  if (!BTCPAY_SERVER_URL || !BTCPAY_API_KEY || !BTCPAY_STORE_ID) {
    throw new Error('BTCPay no configurado. Añade BTCPAY_SERVER_URL, BTCPAY_API_KEY y BTCPAY_STORE_ID en .env.local');
  }

  const res = await fetch(`${BTCPAY_SERVER_URL}/api/v1/stores/${BTCPAY_STORE_ID}/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `token ${BTCPAY_API_KEY}`,
    },
    body: JSON.stringify({
      amount:   params.amountEur,
      currency: 'EUR',
      metadata: { plan: 'plan_crypto', billingCycle: params.billingCycle, userId: params.userId },
      checkout: {
        redirectURL: `${params.appUrl}/gracias?method=crypto`,
        expirationMinutes: 30,
      },
    }),
  });

  if (!res.ok) throw new Error(`BTCPay error ${res.status}: ${await res.text()}`);
  return res.json() as Promise<{ id: string; checkoutLink: string }>;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      priceId?: string;
      billingCycle?: 'monthly' | 'annual';
      locale?: string;
      paymentMethod?: 'card' | 'crypto';
      userId?: string;
    };

    const { priceId, billingCycle, locale, paymentMethod, userId } = body;
    const cycle  = billingCycle ?? 'monthly';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

    // ─── Rama Crypto (BTCPay Server) ──────────────────────────
    if (paymentMethod === 'crypto') {
      const invoice = await createBTCPayInvoice({
        amountEur: CRYPTO_PRICES_EUR[cycle],
        billingCycle: cycle,
        userId,
        appUrl,
      });
      return NextResponse.json({ url: invoice.checkoutLink, invoiceId: invoice.id, method: 'crypto' });
    }

    // ─── Rama Card (Stripe) ───────────────────────────────────
    const resolvedPriceId = priceId
      ?? (cycle === 'annual' ? STRIPE_PRICE_IDS.proAnnual : STRIPE_PRICE_IDS.proMonthly);

    if (!resolvedPriceId || resolvedPriceId.startsWith('price_REEMPLAZA')) {
      return NextResponse.json(
        { error: 'Stripe no configurado. Añade los IDs de precio en .env.local' },
        { status: 503 }
      );
    }

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
          billingCycle: cycle,
        },
      },
    });

    return NextResponse.json({ url: session.url, method: 'card' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
