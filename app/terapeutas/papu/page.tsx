import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SITE_CONFIG } from '@/lib/config';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Papu — Fundador',
  description: 'Eco-chef medicinal, especialista en MTC, Ayurveda y nutrición herborista. Fundador de Quantum Holistic.',
  alternates: { canonical: '/terapeutas/papu' },
  openGraph: {
    title: 'Papu — Fundador',
    description: 'Eco-chef medicinal, especialista en MTC, Ayurveda y nutrición herborista. Fundador de Quantum Holistic.',
    url: '/terapeutas/papu',
  },
};

const CONSULT_EMAIL_SUBJECT = encodeURIComponent('Reserva de consulta con Papu — €65');
const CONSULT_EMAIL_BODY = encodeURIComponent(
  'Hola Papu,\n\nMe gustaría reservar una consulta (€65). Mi disponibilidad es...\n\nGracias.'
);

export default function TerapeutaPapuPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={`container ${styles.inner}`}>
          <Link href="/terapeutas" className={styles.back}>← Volver al directorio</Link>

          <span className={styles.badge}>Fundador · Quantum Holistic</span>
          <h1 className={styles.name}>Papu</h1>
          <p className={styles.especialidad}>
            Eco-chef medicinal · Medicina Tradicional China · Ayurveda · Nutrición herborista
          </p>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>Enfoque</p>
            <p className={styles.body}>
              Cocina medicinal km0, herbología aplicada y nutrición ortomolecular al servicio
              del bienestar real. Formación en Medicina Tradicional China y Ayurveda, integrada
              con la ciencia nutricional moderna para diseñar protocolos personalizados según
              el dosha, el estado de salud y el ritmo estacional de cada persona.
            </p>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>Áreas de trabajo</p>
            <div className={styles.tagList}>
              {['Nutrición km0', 'Herbología clínica', 'MTC', 'Ayurveda', 'Detox estacional', 'Protocolos personalizados'].map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>Consulta individual</p>
            <p className={styles.body}>
              Sesión 1:1 para valorar tu estado actual y diseñar un protocolo de nutrición
              y herbología adaptado a ti.
            </p>
            <a
              className={styles.cta}
              href={`mailto:${SITE_CONFIG.email}?subject=${CONSULT_EMAIL_SUBJECT}&body=${CONSULT_EMAIL_BODY}`}
            >
              Reservar consulta · €65
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
