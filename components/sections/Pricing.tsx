'use client';

import { useState } from 'react';
import { PLANS } from '@/lib/config';
import Button from '@/components/ui/Button';
import styles from './Pricing.module.css';

export default function Pricing() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleCheckout(planId: string) {
    if (planId !== 'plan_crypto') return;
    try {
      setLoadingId(planId);
      const res = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          paymentMethod: 'crypto',
          billingCycle:  'monthly',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Checkout falló');
      window.location.href = data.url;
    } catch (err) {
      console.error('[checkout/crypto]', err);
      alert(err instanceof Error ? err.message : 'Error iniciando pago');
      setLoadingId(null);
    }
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
                  const text    = typeof f === 'string' ? f : f.text;
                  const isHigh  = typeof f === 'object' && f.highlight;
                  return (
                    <li key={text} className={isHigh ? styles.highlight : ''}>
                      {text}
                    </li>
                  );
                })}
              </ul>

              {plan.featured ? (
                <Button variant="gold" fullWidth disabled={plan.cta === 'Próximamente'}>
                  {plan.cta}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loadingId === plan.id || plan.cta === 'Próximamente'}
                >
                  {loadingId === plan.id ? 'Procesando…' : plan.cta}
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
