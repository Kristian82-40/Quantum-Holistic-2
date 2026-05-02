import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import styles from './page.module.css';

interface FichaCientifica {
  familia_botanica: string;
  parte_usada: string;
  principios_activos: string[];
  propiedades: string[];
  indicaciones: string[];
  contraindicaciones: string[];
  posologia: string;
  evidencia: string;
}

interface FichaMistica {
  elemento: string;
  planeta_regente: string;
  chakra: string;
  energia: string;
  uso_ceremonial: string;
  afinidad_ayurvedica: string;
  simbolismo: string;
}

interface Plant {
  id: number;
  slug: string;
  nombre_es: string;
  nombre_latino: string;
  image_cientifica_url: string | null;
  ficha_cientifica: FichaCientifica;
  ficha_mistica: FichaMistica;
}

async function getPlant(slug: string): Promise<Plant | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/plants?slug=eq.${encodeURIComponent(slug)}&limit=1`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data[0] ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const plant = await getPlant(params.slug);
  if (!plant) return { title: 'Planta no encontrada' };
  return {
    title: `${plant.nombre_es} (${plant.nombre_latino}) — Ficha Botánica`,
    description: plant.ficha_cientifica.propiedades.join(', '),
  };
}

export default async function PlantaPage({ params }: { params: { slug: string } }) {
  const plant = await getPlant(params.slug);
  if (!plant) notFound();

  const { ficha_cientifica: fc, ficha_mistica: fm } = plant;

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '120px', minHeight: '60vh' }}>
        <div className="container section" style={{ maxWidth: '900px' }}>

          {/* Breadcrumb */}
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '32px' }}>
            <Link href="/plantas" style={{ color: 'var(--sage)', textDecoration: 'none' }}>Herbología</Link>
            {' / '}{plant.nombre_es}
          </p>

          {/* Hero */}
          <div className={styles.hero}>
            <div>
              {plant.image_cientifica_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={plant.image_cientifica_url}
                  alt={`Ilustración botánica de ${plant.nombre_es}`}
                  className={styles.heroImg}
                />
              ) : (
                <div style={{ background: 'var(--sage-pale)', borderRadius: '12px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5, fontSize: '48px' }}>
                  ◈
                </div>
              )}
            </div>
            <div>
              <p style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: '12px' }}>
                {fc.familia_botanica}
              </p>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '8px' }}>
                {plant.nombre_es}
              </h1>
              <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '24px', fontSize: '1.05rem' }}>
                {plant.nombre_latino}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {fc.propiedades?.map(p => (
                  <span key={p} style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px 10px', border: '1px solid var(--sage)', borderRadius: '20px', color: 'var(--sage)' }}>
                    {p}
                  </span>
                ))}
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text)' }}>Parte usada:</strong> {fc.parte_usada}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <strong style={{ color: 'var(--text)' }}>Principios activos:</strong> {fc.principios_activos?.join(', ')}
              </p>
            </div>
          </div>

          {/* Ficha científica */}
          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '1.6rem', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              Ficha científica
            </h2>
            <div className={styles.fichaGrid}>
              <FichaBlock title="Indicaciones">
                <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.8 }}>
                  {fc.indicaciones?.map(i => <li key={i}>{i}</li>)}
                </ul>
              </FichaBlock>
              <FichaBlock title="Contraindicaciones">
                <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.8 }}>
                  {fc.contraindicaciones?.map(c => <li key={c}>{c}</li>)}
                </ul>
              </FichaBlock>
              <FichaBlock title="Posología">
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>{fc.posologia}</p>
              </FichaBlock>
              <FichaBlock title="Evidencia científica">
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>{fc.evidencia}</p>
              </FichaBlock>
            </div>
          </section>

          {/* Ficha mística */}
          <section style={{ marginBottom: '64px', padding: '32px', background: 'var(--sage-pale)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '1.6rem', marginBottom: '24px' }}>
              Sabiduría ancestral
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {[
                { label: 'Elemento', value: fm.elemento },
                { label: 'Planeta', value: fm.planeta_regente },
                { label: 'Chakra', value: fm.chakra },
                { label: 'Dosha', value: fm.afinidad_ayurvedica },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: '4px' }}>{label}</p>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 300 }}>{value}</p>
                </div>
              ))}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '12px' }}>
              <strong>Energía:</strong> {fm.energia}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '12px' }}>
              <strong>Uso ceremonial:</strong> {fm.uso_ceremonial}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, fontStyle: 'italic' }}>
              {fm.simbolismo}
            </p>
          </section>

          <Link href="/plantas" style={{ fontSize: '0.9rem', color: 'var(--sage)', textDecoration: 'none' }}>
            ← Volver al Diccionario Botánico
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

function FichaBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: '10px', fontWeight: 500 }}>
        {title}
      </p>
      {children}
    </div>
  );
}
