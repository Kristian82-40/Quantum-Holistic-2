import { createClient } from '@supabase/supabase-js'

export function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export const supabase = {
  from: (table: string) => {
    const client = getSupabase()
    if (!client) return { insert: async () => ({ error: 'No Supabase config' }) }
    return client.from(table)
  }
}
