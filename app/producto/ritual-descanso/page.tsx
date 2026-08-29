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

export default function RitualDescansoPage() {
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
          <RitualCheckout />
          <p className={styles.note}>Entrega digital inmediata. Sin suscripción.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
