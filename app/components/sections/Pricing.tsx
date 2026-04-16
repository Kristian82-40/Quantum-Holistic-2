'use client';

import { useState } from 'react';
import { PLANS } from '@/lib/config';
import Button from '@/components/ui/Button';
import styles from './Pricing.module.css';

async function redirectToCheckout(billingCycle: 'monthly' | 'annual') {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ billingCycle }),
  });

  const data = await res.json() as { url?: string; error?: string };

  if (!res.ok || !data.url) {
    alert(data.error ?? 'Error al iniciar el pago. Inténtalo de nuevo.');
    return;
  }

  window.location.href = data.url;
}

export default function Pricing() {
  const [annual, setAnnual]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handleProClick = async () => {
    setLoading(true);
    await redirectToCheckout(annual ? 'annual' : 'monthly');
    setLoading(false);
  };

  return (
    <section className={`section ${styles.pricing}`} id="pricing">
      <div className="container">
        <p className={styles.label}>Planes</p>
        <h2 className={styles.title}>
          Elige tu <em>camino</em>
        </h2>

        {/* Toggle */}
        <div className={styles.toggle}>
          <span className={!annual ? styles.toggleActive : ''}>Mensual</span>
          <button
            className={styles.toggleBtn}
            onClick={() => setAnnual((v) => !v)}
            aria-label="Alternar facturación anual"
          >
            <span className={`${styles.toggleKnob} ${annual ? styles.toggleKnobOn : ''}`} />
          </button>
          <span className={annual ? styles.toggleActive : ''}>
            Anual <em className={styles.saveBadge}>2 meses gratis</em>
          </span>
        </div>

        {/* Cards */}
        <div className={styles.grid}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`${styles.card} ${plan.featured ? styles.proCard : ''} reveal`}
            >
              {plan.featured && (
                <span className={styles.badge}>Recomendado</span>
              )}

              <p className={styles.tier}>{plan.name}</p>

              <div className={styles.priceRow}>
                <span className={styles.amount}>
                  €{plan.featured && annual && 'priceAnnual' in plan
                    ? Math.round((plan.priceAnnual as number) / 12)
                    : plan.price}
                </span>
                <span className={styles.period}>
                  {plan.price === 0 ? 'para siempre' : '/ mes'}
                </span>
              </div>

              {'priceAnnual' in plan && (
                <p className={styles.annualNote}>
                  {annual
                    ? `Facturado €${plan.priceAnnual}/año`
                    : `o €${plan.priceAnnual}/año — ahorra €${plan.price * 12 - (plan.priceAnnual as number)}`}
                </p>
              )}

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
                <Button
                  variant="gold"
                  fullWidth
                  onClick={handleProClick}
                  disabled={loading}
                >
                  {loading ? 'Redirigiendo…' : plan.cta}
                </Button>
              ) : (
                <Button variant="outline" fullWidth as="a" href="/#profile">
                  {plan.cta}
                </Button>
              )}
            </div>
          ))}
        </div>

        <p className={styles.note}>
          Sin permanencia · Cancela cuando quieras ·{' '}
          <strong>Sin tarjeta para empezar</strong>
        </p>
      </div>
    </section>
  );
}
