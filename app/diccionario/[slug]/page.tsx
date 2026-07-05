import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { existsSync } from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CuentaScrollModal from '@/components/ui/CuentaScrollModal';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

interface FichaCientifica {
  familia_botanica?: string;
  parte_usada?: string;
  principios_activos?: string[];
  propiedades?: string[];
  indicaciones?: string[];
  contraindicaciones?: string[];
  posologia?: string;
  evidencia?: string;
}

interface FichaMistica {
  chakra?: string;
  energia?: string;
  elemento?: string;
  simbolismo?: string;
  uso_ceremonial?: string;
  planeta_regente?: string;
  afinidad_ayurvedica?: string;
}

interface Plant {
  id: number;
  slug: string;
  nombre_es: string;
  nombre_latino: string | null;
  categoria: string;
  image_cientifica_url: string | null;
  ficha_cientifica: FichaCientifica | null;
  ficha_mistica: FichaMistica | null;
}

async function getPlant(slug: string): Promise<Plant | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/plants?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data: Plant[] = await res.json();
    return data[0] ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const plant = await getPlant(slug);
  if (!plant) return { title: 'Planta no encontrada' };
  return {
    title: `${plant.nombre_es} — Diccionario Botánico`,
    description: `Ficha completa de ${plant.nombre_es}${plant.nombre_latino ? ` (${plant.nombre_latino})` : ''}: propiedades, indicaciones, contraindicaciones y tradición ancestral.`,
  };
}

export default async function PlantPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const plant = await getPlant(slug);
  if (!plant) notFound();

  const hasImage = existsSync(
    path.join(process.cwd(), 'public', 'images', 'plants', `${plant.slug}-cientifica.jpg`)
  );

  const fc = plant.ficha_cientifica;
  const fm = plant.ficha_mistica;
  const hasMistica = fm && Object.values(fm).some(Boolean);

  return (
    <>
      <Navbar />
      <main className={styles.main}>

        {/* ── Hero ── */}
        <div className={styles.hero}>
          <div className={styles.heroImageWrap}>
            {hasImage ? (
              <Image
                src={`/images/plants/${plant.slug}-cientifica.jpg`}
                alt={plant.nombre_es}
                fill
                className={styles.heroImg}
                sizes="50vw"
                priority
              />
            ) : (
              <div className={styles.heroPlaceholder} aria-hidden>
                <span>{(plant.nombre_es ?? '?')[0].toUpperCase()}</span>
              </div>
            )}
          </div>
          <div className={styles.heroInfo}>
            <Link href="/diccionario" className={styles.back}>← Diccionario</Link>
            <span className={styles.catBadge}>{plant.categoria}</span>
            <h1 className={styles.plantName}>{plant.nombre_es}</h1>
            {plant.nombre_latino && (
              <p className={styles.latin}>{plant.nombre_latino}</p>
            )}
            {fc?.familia_botanica && (
              <p className={styles.familia}>
                Familia: <em>{fc.familia_botanica}</em>
              </p>
            )}
            {fc?.parte_usada && (
              <p className={styles.parteUsada}>
                Parte usada: <em>{fc.parte_usada}</em>
              </p>
            )}
          </div>
        </div>

        <div className={`container ${styles.content}`}>

          {/* ── Contraindicaciones — SIEMPRE destacadas ── */}
          {fc?.contraindicaciones && fc.contraindicaciones.length > 0 && (
            <div className={styles.contraBox}>
              <h2 className={styles.contraTitle}>
                <span className={styles.contraIcon}>⚠</span>
                Contraindicaciones
              </h2>
              <ul className={styles.contraList}>
                {fc.contraindicaciones.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.sections}>

            {/* ── Ficha Científica ── */}
            {fc && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Ficha Científica</h2>

                {fc.propiedades && fc.propiedades.length > 0 && (
                  <div className={styles.block}>
                    <h3 className={styles.blockLabel}>Propiedades</h3>
                    <ul className={styles.pills}>
                      {fc.propiedades.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}

                {fc.indicaciones && fc.indicaciones.length > 0 && (
                  <div className={styles.block}>
                    <h3 className={styles.blockLabel}>Indicaciones</h3>
                    <ul className={styles.list}>
                      {fc.indicaciones.map((ind, i) => <li key={i}>{ind}</li>)}
                    </ul>
                  </div>
                )}

                {fc.principios_activos && fc.principios_activos.length > 0 && (
                  <div className={styles.block}>
                    <h3 className={styles.blockLabel}>Principios Activos</h3>
                    <ul className={styles.pills}>
                      {fc.principios_activos.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}

                {fc.posologia && (
                  <div className={styles.block}>
                    <h3 className={styles.blockLabel}>Posología</h3>
                    <p className={styles.text}>{fc.posologia}</p>
                  </div>
                )}

                {fc.evidencia && (
                  <div className={styles.block}>
                    <h3 className={styles.blockLabel}>Evidencia Científica</h3>
                    <p className={styles.text}>{fc.evidencia}</p>
                  </div>
                )}
              </section>
            )}

            {/* ── Ficha Mística ── */}
            {hasMistica && (
              <section className={styles.sectionMistica}>
                <h2 className={styles.sectionTitle}>Tradición & Sabiduría Ancestral</h2>

                {(fm.elemento || fm.chakra || fm.planeta_regente || fm.energia || fm.afinidad_ayurvedica) && (
                  <div className={styles.misticaGrid}>
                    {fm.elemento         && <MisticaItem label="Elemento"  value={fm.elemento} />}
                    {fm.chakra           && <MisticaItem label="Chakra"    value={fm.chakra} />}
                    {fm.planeta_regente  && <MisticaItem label="Planeta"   value={fm.planeta_regente} />}
                    {fm.energia          && <MisticaItem label="Energía"   value={fm.energia} />}
                    {fm.afinidad_ayurvedica && <MisticaItem label="Dosha"  value={fm.afinidad_ayurvedica} />}
                  </div>
                )}

                {fm.simbolismo && (
                  <div className={styles.block}>
                    <h3 className={styles.blockLabel}>Simbolismo</h3>
                    <p className={styles.text}>{fm.simbolismo}</p>
                  </div>
                )}

                {fm.uso_ceremonial && (
                  <div className={styles.block}>
                    <h3 className={styles.blockLabel}>Uso Ceremonial</h3>
                    <p className={styles.text}>{fm.uso_ceremonial}</p>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* ── Disclaimer médico ── */}
          <div className={styles.disclaimer}>
            <p>
              <strong>Aviso médico:</strong> La información de este diccionario tiene carácter divulgativo y no sustituye el consejo médico profesional. Consulta siempre con un profesional de la salud antes de usar plantas medicinales, especialmente si tomas medicación, estás embarazada o tienes condiciones médicas preexistentes.
            </p>
          </div>

          <div className={styles.backLink}>
            <Link href="/diccionario">← Volver al diccionario</Link>
          </div>
        </div>
      </main>
      <Footer />
      <CuentaScrollModal />
    </>
  );
}

function MisticaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.misticaItem}>
      <span className={styles.misticaLabel}>{label}</span>
      <span className={styles.misticaValue}>{value}</span>
    </div>
  );
}
