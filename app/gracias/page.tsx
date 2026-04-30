'use client';

import { SITE_CONFIG } from '@/lib/config';
import styles from './gracias.module.css';

export default function GraciasPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.badge}>Pago completado</p>
        <h1 className={styles.title}>
          Gracias por unirte a <em>{SITE_CONFIG.name}</em>
        </h1>
        <p className={styles.desc}>
          Tu suscripcion esta activa. Revisa tu email.
        </p>
        <a href="/" className={styles.cta}>
          Ir al inicio
        </a>
      </div>
    </main>
  );
}
