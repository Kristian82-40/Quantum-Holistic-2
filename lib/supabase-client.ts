import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

// Cliente completo de Supabase con soporte para auth, storage, etc.
export function getSupabaseClient(): SupabaseClient {
  if (_supabase) return _supabase
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
  _supabase = createClient(url, key)
  return _supabase
}

// Export del cliente como objeto con lazy init
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop]
  }
})

// Re-export de getSupabase para compatibilidad
export { getSupabase } from './supabase'
