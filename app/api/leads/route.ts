import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  const { email, source, dosha } = await req.json() as {
    email: string;
    source?: string;
    dosha?: string;
  };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  }

  // on_conflict=email: sin él, PostgREST hace el upsert por `id` y un email repetido choca con leads_email_key (409).
  const res = await fetch(`${SUPABASE_URL}/rest/v1/leads?on_conflict=email`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      email: email.toLowerCase().trim(),
      source: source ?? 'chat_paywall',
      dosha: dosha ?? null,
      created_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    console.error(`[leads] Supabase ${res.status}: ${await res.text()}`);
    return NextResponse.json({ error: 'No se pudo guardar' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
