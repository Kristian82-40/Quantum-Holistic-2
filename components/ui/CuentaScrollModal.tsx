'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import styles from './CuentaScrollModal.module.css';

const SESSION_KEY = 'qh_cuenta_modal_seen';

export default function CuentaScrollModal() {
  const [state, setState] = useState<'hidden' | 'visible' | 'closing'>('hidden');
  const shown = useRef(false);

  const close = useCallback(() => {
    setState('closing');
    sessionStorage.setItem(SESSION_KEY, '1');
    setTimeout(() => setState('hidden'), 350);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const onScroll = () => {
      if (shown.current) return;
      const scrolled = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      if (scrolled / max >= 0.5) {
        shown.current = true;
        setState('visible');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (state === 'hidden') return null;

  const isClosing = state === 'closing';

  return (
    <div
      className={`${styles.overlay} ${isClosing ? styles.overlayHide : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className={`${styles.card} ${isClosing ? styles.cardHide : ''}`}>
        <button className={styles.closeBtn} onClick={close} aria-label="Cerrar">×</button>

        <p className={styles.label}>Quantum Holistic</p>
        <h2 className={styles.title}>Crea tu cuenta gratis</h2>
        <p className={styles.body}>
          Guarda tus plantas favoritas, recibe recomendaciones según tu dosha y accede
          a contenido exclusivo. Solo necesitas tu email — sin contraseñas.
        </p>

        <div className={styles.actions}>
          <a href="/registro" className={styles.btnPrimary} onClick={close}>
            Crear cuenta gratis →
          </a>
          <button className={styles.btnSecondary} onClick={close}>
            Seguir leyendo
          </button>
        </div>
      </div>
    </div>
  );
}
