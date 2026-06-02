import { Cormorant_Garamond, Inter_Tight } from 'next/font/google';
import { createClient } from '@supabase/supabase-js';
import Catalogo, { type Plant } from './Catalogo';
import { PlantsSchema } from '@/lib/schemas/plant';

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
  const raw = (data ?? []) as Plant[];
  // Valida id/slug/categoria — detecta tildes/ñ en slugs antes de llegar a Vercel
  PlantsSchema.parse(raw.map(({ id, slug, categoria }) => ({ id, slug, categoria })));
  // Fuente de verdad: URL derivada del slug, no la columna de Supabase
  return raw.map(p => ({ ...p, image_cientifica_url: `/images/plants/${p.slug}-cientifica.jpg` }));
}

export default async function DiccionarioPage() {
  const plants = await fetchPlants();

  return (
    <div className={`${cormorant.variable} ${interTight.variable}`}>
      <Catalogo plants={plants} />
    </div>
  );
}
