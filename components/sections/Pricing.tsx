'use client';

import { useState } from 'react';
import { PLANS } from '@/lib/config';
import Button from '@/components/ui/Button';
import styles from './Pricing.module.css';

export default function Pricing() {
  const [proEmail, setProEmail]   = useState('');
  const [proLeadSent, setProLeadSent] = useState(false);
  const [proLoading, setProLoading]   = useState(false);

  async function handleProWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!proEmail || proLoading) return;
    setProLoading(true);
    try {
      await fetch('/api/leads', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: proEmail, source: 'pro_waitlist' }),
      });
      setProLeadSent(true);
    } catch {
      // silent fail — el correo no llega, pero no bloqueamos al usuario
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

        {/* Cards */}
        <div className={styles.grid}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`${styles.card} ${plan.featured ? styles.proCard : ''} reveal`}
            >
              <p className={styles.tier}>{plan.name}</p>

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
                    <input
                      type="email"
                      required
                      placeholder="tu@correo.com"
                      value={proEmail}
                      onChange={e => setProEmail(e.target.value)}
                      className={styles.waitlistInput}
                    />
                    <Button variant="gold" fullWidth type="submit" disabled={proLoading}>
                      {proLoading ? 'Enviando…' : 'Unirme a la lista de espera'}
                    </Button>
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
