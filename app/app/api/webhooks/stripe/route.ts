import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get('stripe-signature') ?? '';
  const secret    = process.env.STRIPE_WEBHOOK_SECRET ?? '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    console.error('[Stripe webhook] Firma inválida:', message);
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail  = session.customer_details?.email ?? '';
      const subscriptionId = String(session.subscription ?? '');
      const billingCycle   = 'monthly';

      console.log('[Stripe] Pago completado:', {
        sessionId: session.id,
        customerEmail,
        subscriptionId,
        billingCycle,
        amount: session.amount_total,
      });

      notifyN8n('checkout.session.completed', {
        customerEmail,
        subscriptionId,
        billingCycle,
        sessionId: session.id,
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      console.log('[Stripe] Suscripción cancelada:', {
        subscriptionId: sub.id,
        customerId: sub.customer,
        canceledAt: sub.canceled_at,
      });

      notifyN8n('subscription.deleted', {
        subscriptionId: sub.id,
        customerId: String(sub.customer),
      });
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      console.log('[Stripe] Pago fallido:', {
        invoiceId: invoice.id,
        customerEmail: invoice.customer_email,
        attemptCount: invoice.attempt_count,
      });

      notifyN8n('invoice.payment_failed', {
        invoiceId: invoice.id,
        customerEmail: invoice.customer_email ?? '',
        attemptCount: invoice.attempt_count ?? 0,
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

function notifyN8n(eventType: string, payload: Record<string, unknown>) {
  const url = process.env.N8N_STRIPE_WEBHOOK_URL;
  if (!url || url.includes('REEMPLAZA')) return;

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: eventType, ...payload, timestamp: new Date().toISOString() }),
  }).catch((err) => console.error('[Stripe webhook] Error notificando n8n:', err));
}
