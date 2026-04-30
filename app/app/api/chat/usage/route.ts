import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const FREE_LIMIT = 5;

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
}

export async function GET(req: NextRequest) {
  const sessionId = req.headers.get('x-session-id') ?? '';
  const supabase = await getSupabase();
  const today = new Date().toISOString().split('T')[0];

  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    const { data: profile } = await supabase
      .from('profiles').select('plan').eq('id', session.user.id).single();
    if (profile?.plan === 'pro') {
      return NextResponse.json({ count: 0, limit: null, isPro: true });
    }
    const { data: usage } = await supabase
      .from('chat_usage').select('count').eq('user_id', session.user.id).eq('date', today).single();
    return NextResponse.json({ count: usage?.count ?? 0, limit: FREE_LIMIT, isPro: false });
  }

  if (sessionId) {
    const { data: usage } = await supabase
      .from('chat_usage').select('count').eq('session_id', sessionId).eq('date', today).single();
    return NextResponse.json({ count: usage?.count ?? 0, limit: FREE_LIMIT, isPro: false });
  }

  return NextResponse.json({ count: 0, limit: FREE_LIMIT, isPro: false });
}

export async function POST(req: NextRequest) {
  const sessionId = req.headers.get('x-session-id') ?? '';
  const supabase = await getSupabase();
  const today = new Date().toISOString().split('T')[0];

  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    const { data: profile } = await supabase
      .from('profiles').select('plan').eq('id', session.user.id).single();
    if (profile?.plan === 'pro') return NextResponse.json({ ok: true });
    await supabase.rpc('increment_chat_usage', { p_user_id: session.user.id, p_date: today });
  } else if (sessionId) {
    await supabase.rpc('increment_chat_usage_anon', { p_session_id: sessionId, p_date: today });
  }

  return NextResponse.json({ ok: true });
}
