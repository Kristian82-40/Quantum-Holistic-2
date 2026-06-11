import { Metadata } from 'next';
import { existsSync } from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Diccionario Botánico — 50+ Plantas Medicinales',
  description: 'Directorio completo de plantas medicinales con fichas científicas, propiedades, indicaciones y tradición ancestral.',
};

interface Plant {
  id: number;
  slug: string;
  nombre_es: string;
  nombre_latino: string | null;
  categoria: 'Maestras' | 'Sagradas' | 'Magicas';
  image_cientifica_url: string | null;
}

async function getPlants(): Promise<Plant[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/plants?select=id,slug,nombre_es,nombre_latino,categoria,image_cientifica_url&order=nombre_es`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store' }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function diskImgExists(slug: string): boolean {
  return existsSync(
    path.join(process.cwd(), 'public', 'images', 'plants', `${slug}-cientifica.jpg`)
  );
}

const CAT_LABEL: Record<string, string> = {
  Maestras: 'Maestra',
  Sagradas: 'Sagrada',
  Magicas:  'Mágica',
};

export default async function DiccionarioPage() {
  const plants = await getPlants();

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={`container ${styles.inner}`}>
          <div className={styles.header}>
            <p className={styles.label}>Plantas medicinales</p>
            <h1 className={styles.title}>
              Diccionario <em>Botánico</em>
            </h1>
            <p className={styles.subtitle}>
              {plants.length} plantas con fichas científicas, propiedades y tradición ancestral.
            </p>
          </div>

          <div className={styles.grid}>
            {plants.map((plant) => {
              const hasImage = diskImgExists(plant.slug);
              return (
                <Link key={plant.id} href={`/diccionario/${plant.slug}`} className={styles.card}>
                  <div className={styles.imageWrap}>
                    {hasImage ? (
                      <Image
                        src={`/images/plants/${plant.slug}-cientifica.jpg`}
                        alt={plant.nombre_es}
                        fill
                        className={styles.image}
                        sizes="(max-width: 560px) 100vw, (max-width: 920px) 50vw, 33vw"
                      />
                    ) : (
                      <div className={styles.placeholder} aria-hidden>
                        <span>{(plant.nombre_es ?? '?')[0].toUpperCase()}</span>
                      </div>
                    )}
                    <span className={`${styles.cat} ${styles[`cat${plant.categoria}` as keyof typeof styles]}`}>
                      {CAT_LABEL[plant.categoria] ?? plant.categoria}
                    </span>
                  </div>
                  <div className={styles.cardBody}>
                    <h2 className={styles.plantName}>{plant.nombre_es}</h2>
                    {plant.nombre_latino && (
                      <p className={styles.latin}>{plant.nombre_latino}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
