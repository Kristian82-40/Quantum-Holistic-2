import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Terapeutas — Quantum Holistic',
  description: 'Directorio de terapeutas verificados: nutrición, herbología, MTC, Ayurveda y bienestar holístico.',
  alternates: { canonical: '/terapeutas' },
  openGraph: {
    title: 'Terapeutas — Quantum Holistic',
    description: 'Directorio de terapeutas verificados: nutrición, herbología, MTC, Ayurveda y bienestar holístico.',
    url: '/terapeutas',
  },
};

interface Terapeuta {
  id: string;
  full_name: string | null;
  especialidades: string[] | null;
  bio: string | null;
}

async function getTerapeutas(): Promise<Terapeuta[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/profiles?select=id,full_name,especialidades,bio&role=eq.terapeuta&verified=eq.true&order=full_name`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store' }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function TerapeutasPage() {
  const terapeutas = await getTerapeutas();

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={`container ${styles.inner}`}>
          <div className={styles.header}>
            <p className={styles.label}>Directorio</p>
            <h1 className={styles.title}>Nuestros <em>terapeutas</em></h1>
            <p className={styles.subtitle}>
              Profesionales verificados en nutrición, herbología, medicina tradicional china,
              ayurveda y bienestar holístico.
            </p>
          </div>

          <div className={styles.grid}>
            <Link href="/terapeutas/papu" className={styles.founderCard}>
              <span className={styles.badge}>Fundador</span>
              <h2 className={styles.name}>Papu</h2>
              <p className={styles.especialidad}>Eco-chef medicinal · MTC · Ayurveda · Nutrición herborista</p>
              <p className={styles.bio}>
                Fundador de Quantum Holistic. Cocina medicinal, herbología aplicada y nutrición km0
                al servicio del bienestar real.
              </p>
            </Link>

            {terapeutas.map((t) => (
              <div key={t.id} className={styles.card}>
                <h2 className={styles.name}>{t.full_name}</h2>
                {t.especialidades && t.especialidades.length > 0 && (
                  <p className={styles.especialidad}>{t.especialidades.join(' · ')}</p>
                )}
                {t.bio && <p className={styles.bio}>{t.bio}</p>}
              </div>
            ))}
          </div>

          {terapeutas.length === 0 && (
            <p className={styles.empty}>Más terapeutas verificados próximamente.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
