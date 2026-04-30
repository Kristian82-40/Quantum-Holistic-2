import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PlantasGrid from './PlantasGrid';

export const metadata: Metadata = {
  title: 'Diccionario Botánico — 50 Plantas Medicinales | Quantum Holistic',
  description: 'Fichas científicas y ancestrales de 50 plantas medicinales. Propiedades, indicaciones, chakras, doshas e ilustraciones botánicas profesionales.',
};

async function getPlants() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/plants?select=id,slug,nombre_es,nombre_latino,image_cientifica_url,ficha_cientifica,ficha_mistica&order=id.asc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function PlantasPage() {
  const plants = await getPlants();

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '120px', minHeight: '60vh' }}>
        <div className="container section">
          <p style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: '18px' }}>
            Herbología
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, marginBottom: '12px', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Diccionario Botánico
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '520px', fontWeight: 300, marginBottom: '48px' }}>
            {plants.length} plantas medicinales. Ciencia, tradición y sabiduría ancestral.
          </p>
          <PlantasGrid plants={plants} />
        </div>
      </main>
      <Footer />
    </>
  );
}
