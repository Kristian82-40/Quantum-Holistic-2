import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RitualCheckout from './RitualCheckout';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'El Ritual del Descanso',
  description:
    'Guía de 14 páginas con protocolo herbal y rutina nocturna para recuperar un descanso profundo, basada en macrobiótica y herbología ancestral.',
  alternates: { canonical: '/producto/ritual-descanso' },
  openGraph: {
    title: 'El Ritual del Descanso',
    description:
      'Guía de 14 páginas con protocolo herbal y rutina nocturna para recuperar un descanso profundo, basada en macrobiótica y herbología ancestral.',
    url: '/producto/ritual-descanso',
  },
};

// Revalida cada hora si el producto de Gumroad sigue existiendo.
export const revalidate = 3600;

const GUMROAD_URL = process.env.NEXT_PUBLIC_GUMROAD_URL || '';

// Un enlace configurado no es un enlace funcional: si Gumroad responde 404/410,
// se cae al formulario de lista de espera en vez de mandar al comprador a un error.
// Cualquier otro fallo (red, timeout, bloqueo) mantiene el enlace.
async function getCheckoutUrl(): Promise<string | null> {
  if (!GUMROAD_URL) return null;
  try {
    const res = await fetch(GUMROAD_URL, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 3600 },
    });
    if (res.status === 404 || res.status === 410) {
      console.error(`[ritual-descanso] Gumroad devuelve ${res.status}: ${GUMROAD_URL}`);
      return null;
    }
  } catch {
    // Fallo transitorio: no se esconde el botón de compra.
  }
  return GUMROAD_URL;
}

export default async function RitualDescansoPage() {
  const checkoutUrl = await getCheckoutUrl();

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.card}>
          <span className={styles.badge}>Guía digital · PDF</span>
          <h1 className={styles.title}>El Ritual del Descanso</h1>
          <p className={styles.price}>19€ <span>pago único</span></p>
          <p className={styles.desc}>
            Un protocolo de 14 páginas para recuperar un descanso profundo: infusiones
            herbales, rutina nocturna y ajustes macrobióticos pensados para reconectar
            tu cuerpo con su ritmo natural.
          </p>
          <ul className={styles.list}>
            <li>Protocolo herbal noche a noche, semana a semana</li>
            <li>Rituales de desconexión antes de dormir</li>
            <li>Ajustes de alimentación km0 para favorecer el sueño</li>
            <li>Descarga inmediata en PDF tras la compra</li>
          </ul>
          <RitualCheckout checkoutUrl={checkoutUrl} />
          <p className={styles.note}>Entrega digital inmediata. Sin suscripción.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
