import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type BTCPayInvoiceMetadata = {
  plan?:         string;
  billingCycle?: 'monthly' | 'annual';
  userId?:       string;
};

type BTCPayWebhookPayload = {
  type:        string;
  invoiceId?:  string;
  storeId?:    string;
  metadata?:   BTCPayInvoiceMetadata;
  // BTCPay puede mandar metadata anidada en algunos eventos
  invoice?:    { id?: string; metadata?: BTCPayInvoiceMetadata };
};

// ─── Validación de firma HMAC-SHA256 ─────────────────────────────
function verifySignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader || !secret) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ─── Cálculo de expiración según billingCycle ────────────────────
function computeExpiry(billingCycle: 'monthly' | 'annual' | undefined): string {
  const days = billingCycle === 'annual' ? 365 : 30;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

// ─── Supabase REST helpers (service role) ────────────────────────
async function activateCryptoProfile(userId: string, expiresAt: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
    {
      method:  'PATCH',
      headers: {
        apikey:          SERVICE_KEY,
        Authorization:   `Bearer ${SERVICE_KEY}`,
        'Content-Type':  'application/json',
        Prefer:          'return=representation',
      },
      body: JSON.stringify({
        plan:            'plan_crypto',
        plan_expires_at: expiresAt,
        updated_at:      new Date().toISOString(),
      }),
    }
  );
  if (!res.ok) return { ok: false, error: `profile PATCH ${res.status}: ${await res.text()}` };
  const rows = await res.json() as unknown[];
  if (!Array.isArray(rows) || rows.length === 0) return { ok: false, error: `profile not found: ${userId}` };
  return { ok: true };
}

async function getCryptoProductId(): Promise<string | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/products?slug=eq.plan_crypto&select=id`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
  );
  if (!res.ok) return null;
  const rows = await res.json() as Array<{ id: string }>;
  return rows[0]?.id ?? null;
}

async function recordPurchase(params: {
  userId:    string;
  productId: string;
  amountEur: number;
  invoiceId: string;
}): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/purchases`, {
    method:  'POST',
    headers: {
      apikey:          SERVICE_KEY,
      Authorization:   `Bearer ${SERVICE_KEY}`,
      'Content-Type':  'application/json',
      Prefer:          'return=minimal',
    },
    body: JSON.stringify({
      user_id:        params.userId,
      product_id:     params.productId,
      amount_eur:     params.amountEur,
      payment_method: 'btcpay',
      payment_status: 'completed',
      transaction_id: params.invoiceId,
    }),
  });
  if (!res.ok) {
    // Log no fatal: el perfil ya está activado (idempotencia > consistencia secundaria)
    console.error('[BTCPay webhook] purchase INSERT falló (no fatal):', await res.text());
  }
}

// ─── Handler ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const rawBody   = await req.text();
  const signature = req.headers.get('btcpay-sig');
  const secret    = process.env.BTCPAY_WEBHOOK_SECRET ?? '';

  if (!verifySignature(rawBody, signature, secret)) {
    console.error('[BTCPay webhook] Firma inválida o secret no configurado');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: BTCPayWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Solo procesamos InvoiceSettled (factura confirmada y liquidada)
  if (payload.type !== 'InvoiceSettled') {
    return NextResponse.json({ received: true, ignored: payload.type });
  }

  const invoiceId = payload.invoiceId ?? payload.invoice?.id ?? '';
  const meta      = payload.metadata ?? payload.invoice?.metadata ?? {};
  const userId    = meta.userId;
  const cycle     = meta.billingCycle;

  if (!userId) {
    console.error('[BTCPay webhook] InvoiceSettled sin userId en metadata');
    // 400 para no provocar reintentos infinitos en payloads inválidos
    return NextResponse.json({ error: 'Missing userId in metadata' }, { status: 400 });
  }

  const expiresAt = computeExpiry(cycle);

  // ─── Activación atómica (UPDATE crítico) ──────────────────────
  const profileResult = await activateCryptoProfile(userId, expiresAt);
  if (!profileResult.ok) {
    console.error('[BTCPay webhook] Activación falló:', profileResult.error);
    // 500 → BTCPay reintenta entrega
    return NextResponse.json({ error: profileResult.error }, { status: 500 });
  }

  // ─── Auditoría en purchases (no fatal) ────────────────────────
  const productId = await getCryptoProductId();
  if (productId && invoiceId) {
    const amountEur = cycle === 'annual' ? 90 : 9;
    await recordPurchase({ userId, productId, amountEur, invoiceId });
  } else {
    console.warn('[BTCPay webhook] productId o invoiceId ausentes — skip purchase log');
  }

  return NextResponse.json({ received: true, activated: true, userId, expiresAt });
}
