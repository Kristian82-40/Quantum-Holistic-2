import { Cormorant_Garamond, Inter_Tight } from 'next/font/google';
import { createClient } from '@supabase/supabase-js';
import Catalogo, { type Plant } from './Catalogo';

export const dynamic = 'force-dynamic';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-inter-tight',
  display: 'swap',
});

async function fetchPlants(): Promise<Plant[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const sb = createClient(url, key);

  const { data, error } = await sb
    .from('plants')
    .select('id, nombre_es, slug, categoria, descripcion_corta, image_cientifica_url, nombre_latino')
    .order('nombre_es', { ascending: true });

  if (error) {
    console.error('[Diccionario] Supabase error:', error.message);
    return [];
  }
  return (data ?? []) as Plant[];
}

export default async function DiccionarioPage() {
  const plants = await fetchPlants();

  return (
    <div className={`${cormorant.variable} ${interTight.variable}`}>
      <Catalogo plants={plants} />
    </div>
  );
}
