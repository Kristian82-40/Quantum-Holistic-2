'use client';

import { useEffect, useState } from 'react';
import { PLANS } from '@/lib/config';
import Button from '@/components/ui/Button';
import styles from './Pricing.module.css';

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Si vuelve de Stripe con «atrás», el navegador restaura la página tal cual: reactivar los botones.
  useEffect(() => {
    const reactivar = (e: PageTransitionEvent) => { if (e.persisted) setLoadingId(null); };
    window.addEventListener('pageshow', reactivar);
    return () => window.removeEventListener('pageshow', reactivar);
  }, []);

  // Pro → tarjeta (Stripe). Crypto → BTCPay. El plan gratuito es un enlace a /registro.
  async function handleCheckout(planId: string) {
    const paymentMethod = planId === 'plan_crypto' ? 'crypto' : 'card';
    try {
      setLoadingId(planId);
      const res = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          paymentMethod,
          billingCycle:  annual ? 'annual' : 'monthly',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Checkout falló');
      window.location.href = data.url;
    } catch (err) {
      console.error(`[checkout/${paymentMethod}]`, err);
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
                  const text    = typeof f === 'string' ? f : f.text;
                  const isHigh  = typeof f === 'object' && f.highlight;
                  return (
                    <li key={text} className={isHigh ? styles.highlight : ''}>
                      {text}
                    </li>
                  );
                })}
              </ul>

              {plan.id === 'freemium' ? (
                <Button as="a" href="/registro" variant="outline" fullWidth>
                  {plan.cta}
                </Button>
              ) : (
                <Button
                  variant={plan.featured ? 'gold' : 'outline'}
                  fullWidth
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loadingId !== null}
                >
                  {loadingId === plan.id ? 'Procesando…' : plan.cta}
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
