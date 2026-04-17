const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

type SupabaseRow = Record<string, unknown>;

async function supabaseRequest(path: string, method: string, body?: SupabaseRow) {
  const res = await fetch(`${supabaseUrl}${path}`, {
    method,
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  return res.json().catch(() => null);
}

export const supabase = {
  from: (table: string) => ({
    insert: (row: SupabaseRow) =>
      supabaseRequest(`/rest/v1/${table}`, 'POST', row),
    select: (cols = '*') =>
      supabaseRequest(`/rest/v1/${table}?select=${cols}`, 'GET'),
  }),
};
