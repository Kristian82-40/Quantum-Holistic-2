import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RegaloForm from './RegaloForm';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Tu Primera Noche Tranquila — Guía gratuita',
  description:
    'Guía gratuita en PDF con un ritual sencillo para tu primera noche de descanso profundo, basada en herbología y macrobiótica.',
};

export default function PrimeraNochePage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.card}>
          <span className={styles.badge}>Regalo · PDF gratuito</span>
          <h1 className={styles.title}>Tu Primera Noche Tranquila</h1>
          <p className={styles.desc}>
            Una guía breve y gratuita con un ritual sencillo para empezar hoy mismo a
            recuperar un descanso profundo: una infusión, una rutina de desconexión y
            un ajuste de alimentación para tu primera noche tranquila.
          </p>
          <ul className={styles.list}>
            <li>Ritual nocturno de 3 pasos, listo para hoy</li>
            <li>Infusión herbal recomendada y cómo prepararla</li>
            <li>Descarga inmediata en PDF, sin coste</li>
          </ul>
          <RegaloForm />
          <p className={styles.note}>Sin spam. Solo el PDF y, si quieres más, El Ritual del Descanso.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
