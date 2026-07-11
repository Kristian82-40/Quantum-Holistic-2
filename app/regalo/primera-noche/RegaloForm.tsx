'use client';

import { useState } from 'react';
import styles from './page.module.css';

const PDF_URL = '/downloads/primera-noche-tranquila.pdf';

export default function RegaloForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'primera_noche_regalo' }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className={styles.success}>
        <p>Listo. Tu guía te espera aquí abajo.</p>
        <a href={PDF_URL} className={styles.cta} download>
          Descargar PDF →
        </a>
        <a href="/producto/ritual-descanso" className={styles.secondaryLink}>
          ¿Quieres ir más profundo? Conoce El Ritual del Descanso →
        </a>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="email"
        required
        placeholder="tu@email.com"
        className={styles.input}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" className={styles.cta} disabled={status === 'loading'}>
        {status === 'loading' ? 'Enviando...' : 'Quiero mi guía gratis'}
      </button>
      {status === 'error' && <p className={styles.note}>Algo falló, inténtalo de nuevo.</p>}
    </form>
  );
}
