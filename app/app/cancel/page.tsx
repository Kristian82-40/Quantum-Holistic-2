import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import styles from '../success/page.module.css';

export const metadata: Metadata = {
  title: 'Pago cancelado',
  robots: { index: false },
};

export default function CancelPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.card}>
          <span className={styles.icon} style={{ color: 'var(--text-muted)' }}>◎</span>
          <h1 className={styles.title}>Pago cancelado</h1>
          <p className={styles.text}>
            No se ha realizado ningún cargo. Si tuviste algún problema o tienes
            preguntas, escríbenos a{' '}
            <a href="mailto:hola@quantumholistic.com" style={{ color: 'var(--sage)' }}>
              hola@quantumholistic.com
            </a>
          </p>
          <a href="/#pricing" className={styles.back}>
            Ver planes →
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
