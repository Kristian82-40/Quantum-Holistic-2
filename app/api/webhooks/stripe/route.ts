import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
      const session      = event.data.object as Stripe.Checkout.Session;
      const email        = session.customer_details?.email ?? '';
      const customerId   = String(session.customer ?? '');
      const subscriptionId = String(session.subscription ?? '');
      const billingCycle = (session.metadata?.billingCycle ?? 'monthly') as string;
      const expiresAt    = billingCycle === 'annual'
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 31  * 24 * 60 * 60 * 1000).toISOString();

      await updateProfileByEmail(email, {
        plan: 'pro',
        plan_expires_at: expiresAt,
        stripe_customer_id: customerId,
      });

      notifyN8n('checkout.session.completed', { email, subscriptionId, billingCycle, sessionId: session.id });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = String(sub.customer);
      await updateProfileByCustomerId(customerId, {
        plan: 'free',
        plan_expires_at: null,
      });
      notifyN8n('subscription.deleted', { subscriptionId: sub.id, customerId });
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = String(sub.customer);
      if (sub.status === 'active') {
        await updateProfileByCustomerId(customerId, { plan: 'pro' });
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
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

async function updateProfileByEmail(email: string, fields: Record<string, unknown>) {
  if (!email) return;
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ ...fields, updated_at: new Date().toISOString() }),
    }
  );
  if (!res.ok) console.error('[Stripe webhook] Error actualizando perfil por email:', await res.text());
}

async function updateProfileByCustomerId(customerId: string, fields: Record<string, unknown>) {
  if (!customerId) return;
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?stripe_customer_id=eq.${encodeURIComponent(customerId)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ ...fields, updated_at: new Date().toISOString() }),
    }
  );
  if (!res.ok) console.error('[Stripe webhook] Error actualizando perfil por customer ID:', await res.text());
}

function notifyN8n(eventType: string, payload: Record<string, unknown>) {
  const url = process.env.N8N_STRIPE_WEBHOOK_URL;
  if (!url || url.includes('REEMPLAZA')) return;
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: eventType, ...payload, timestamp: new Date().toISOString() }),
  }).catch(err => console.error('[Stripe webhook] n8n error:', err));
}
