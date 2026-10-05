'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function RitualCheckout({ checkoutUrl }: { checkoutUrl: string | null }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  if (checkoutUrl) {
    return (
      <a href={checkoutUrl} className={styles.cta} target="_blank" rel="noopener noreferrer">
        Comprar por 19€ →
      </a>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'ritual_descanso_waitlist' }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return <p className={styles.success}>Apuntado. Te avisamos en cuanto se active el pago.</p>;
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
        {status === 'loading' ? 'Enviando...' : 'Avísame cuando esté listo'}
      </button>
      {status === 'error' && <p className={styles.note}>Algo falló, inténtalo de nuevo.</p>}
    </form>
  );
}
