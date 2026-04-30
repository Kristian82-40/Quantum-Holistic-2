import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const { dosha } = await req.json() as { dosha: string };
  if (!['Vata', 'Pitta', 'Kapha'].includes(dosha)) {
    return NextResponse.json({ error: 'Dosha inválido' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ ok: false, reason: 'no_session' });

  await supabase.from('profiles').update({ dosha, updated_at: new Date().toISOString() }).eq('id', session.user.id);
  return NextResponse.json({ ok: true });
}
