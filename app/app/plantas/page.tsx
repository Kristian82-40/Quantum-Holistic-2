import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Diccionario Botánico — 50 Plantas Medicinales | Quantum Holistic',
  description:
    'Fichas científicas y tradicionales de 50 plantas medicinales. Propiedades, indicaciones, posología y sabiduría ancestral.',
};

interface Plant {
  id: number;
  slug: string;
  nombre_es: string;
  nombre_latino: string;
  image_cientifica_url: string | null;
  ficha_cientifica: {
    propiedades: string[];
    familia_botanica: string;
  };
}

async function getPlants(): Promise<Plant[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/plants?select=id,slug,nombre_es,nombre_latino,image_cientifica_url,ficha_cientifica&order=id.asc`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function PlantasPage() {
  const plants = await getPlants();

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '120px', minHeight: '60vh' }}>
        <div className="container section">

          {/* Header */}
          <p style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: '18px' }}>
            Herbología
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, marginBottom: '12px', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Diccionario Botánico
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '520px', fontWeight: 300, marginBottom: '64px' }}>
            {plants.length} plantas medicinales con fichas científicas y sabiduría ancestral.
            Ilustraciones botánicas profesionales.
          </p>

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '28px',
          }}>
            {plants.map(plant => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>

          {plants.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontWeight: 300 }}>
              Cargando el directorio botánico...
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function PlantCard({ plant }: { plant: Plant }) {
  return (
    <Link href={`/plantas/${plant.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <article style={{
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'border-color 0.2s, transform 0.2s',
        cursor: 'pointer',
        background: 'var(--surface, #fff)',
      }}>
        {/* Imagen botánica */}
        <div style={{ position: 'relative', height: '220px', background: 'var(--bg-subtle, #f8f6f2)', overflow: 'hidden' }}>
          {plant.image_cientifica_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={plant.image_cientifica_url}
              alt={`Ilustración botánica de ${plant.nombre_es}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.3, fontSize: '48px' }}>
              ◈
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '20px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sage)', fontWeight: 500, marginBottom: '6px' }}>
            {plant.ficha_cientifica?.familia_botanica}
          </p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '1.2rem', margin: '0 0 4px', lineHeight: 1.3 }}>
            {plant.nombre_es}
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '12px' }}>
            {plant.nombre_latino}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {plant.ficha_cientifica?.propiedades?.slice(0, 2).map(prop => (
              <span key={prop} style={{
                fontSize: '9px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                padding: '3px 8px',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                color: 'var(--text-muted)',
              }}>
                {prop}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}
