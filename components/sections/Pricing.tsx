'use client';

import { useState } from 'react';
import { PLANS } from '@/lib/config';
import Button from '@/components/ui/Button';
import styles from './Pricing.module.css';

export default function Pricing() {
  const [proEmail, setProEmail]     = useState('');
  const [proLeadSent, setProLeadSent] = useState(false);
  const [proLoading, setProLoading]   = useState(false);
  const [proError, setProError]       = useState('');

  async function handleProWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!proEmail || proLoading) return;
    setProLoading(true);
    setProError('');
    try {
      const res = await fetch('/api/leads', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: proEmail, source: 'pro_waitlist' }),
      });
      if (!res.ok) throw new Error();
      setProLeadSent(true);
    } catch {
      setProError('No se pudo guardar, inténtalo de nuevo');
    }
    setProLoading(false);
  }

  return (
    <section className={`section ${styles.pricing}`} id="pricing">
      <div className="container">
        <p className={styles.label}>Planes</p>
        <h2 className={styles.title}>
          Elige tu <em>camino</em>
        </h2>

        <div className={styles.grid}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`${styles.card} ${plan.featured ? styles.proCard : ''} reveal`}
            >
              <p className={styles.tier}>{plan.name}</p>

              <div className={styles.priceRow}>
                <span className={styles.amount}>€{plan.price}</span>
                <span className={styles.period}>{plan.period}</span>
              </div>
              {plan.note && <p className={styles.annualNote}>{plan.note}</p>}

              <ul className={styles.features}>
                {plan.features.map((f) => {
                  const text   = typeof f === 'string' ? f : f.text;
                  const isHigh = typeof f === 'object' && f.highlight;
                  return (
                    <li key={text} className={isHigh ? styles.highlight : ''}>
                      {text}
                    </li>
                  );
                })}
              </ul>

              {plan.featured ? (
                proLeadSent ? (
                  <p className={styles.waitlistConfirm}>✓ Apuntado. Te avisamos cuando abra.</p>
                ) : (
                  <form onSubmit={handleProWaitlist} className={styles.waitlistForm}>
                    <label htmlFor="pro-email" className={styles.srOnly}>
                      Tu correo electrónico
                    </label>
                    <input
                      id="pro-email"
                      type="email"
                      required
                      placeholder="tu@correo.com"
                      value={proEmail}
                      onChange={e => { setProEmail(e.target.value); setProError(''); }}
                      className={styles.waitlistInput}
                    />
                    <p className={styles.rgpd}>
                      Usaremos tu correo solo para avisarte cuando abra Quantum Pro.
                      Puedes darte de baja cuando quieras.{' '}
                      Más en <a href="/privacidad" className={styles.rgpdLink}>Privacidad</a>.
                    </p>
                    <Button variant="gold" fullWidth type="submit" disabled={proLoading}>
                      {proLoading ? 'Enviando…' : 'Unirme a la lista de espera'}
                    </Button>
                    {proError && <p className={styles.waitlistError}>{proError}</p>}
                  </form>
                )
              ) : (
                <Button as="a" href="/chat" variant="outline" fullWidth>
                  Empezar gratis
                </Button>
              )}
            </div>
          ))}
        </div>

        <p className={styles.note}>
          <strong>Sin tarjeta para empezar</strong>
        </p>
      </div>
    </section>
  );
}
