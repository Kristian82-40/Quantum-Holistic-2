import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/require-admin';

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  const update: Record<string, string> = {};
  if (body.status !== undefined) {
    if (body.status !== 'draft' && body.status !== 'published') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    update.status = body.status;
  }
  for (const field of ['title', 'excerpt', 'content', 'category']) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== 'string') {
        return NextResponse.json({ error: `Invalid ${field}` }, { status: 400 });
      }
      update[field] = body[field];
    }
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const res = await fetch(`${BASE}/rest/v1/blog_posts?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(update),
  });

  if (!res.ok) return NextResponse.json({ error: 'Supabase error' }, { status: 500 });
  revalidatePath('/blog', 'layout');
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const res = await fetch(`${BASE}/rest/v1/blog_posts?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      Prefer: 'return=minimal',
    },
  });

  if (!res.ok) return NextResponse.json({ error: 'Supabase error' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
