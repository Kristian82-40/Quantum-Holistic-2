'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/components/providers/LanguageProvider';
import Button from '@/components/ui/Button';
import styles from './Pricing.module.css';

const PRO_PRICE         = 9.9;
const PRO_PRICE_ANNUAL  = 89;

type ProFeature = { text: string; highlight: boolean };

/* ── Payment method icons (SVG, thin lines, monochrome) ── */
function IconCard() {
  return (
    <svg viewBox="0 0 40 28" fill="none" aria-hidden className={styles.payIcon}>
      <rect x="1" y="1" width="38" height="26" rx="3" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="1" y1="9" x2="39" y2="9" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="5" y="14" width="9" height="5" rx="1" stroke="currentColor" strokeWidth="1"/>
    </svg>
  );
}

function IconPayPal() {
  return (
    <svg viewBox="0 0 40 28" fill="none" aria-hidden className={styles.payIcon}>
      <text x="5" y="20" fontFamily="Georgia, serif" fontSize="14" fontWeight="300" fill="currentColor">Pay</text>
      <text x="18" y="14" fontFamily="Georgia, serif" fontSize="10" fontWeight="300" fill="currentColor" opacity="0.6">Pal</text>
    </svg>
  );
}

function IconApplePay() {
  return (
    <svg viewBox="0 0 48 28" fill="none" aria-hidden className={styles.payIcon}>
      <path d="M10 9 C10 6 12 5 14 5 C14 7 12 8 12 10 C10 10 10 9 10 9Z M14 11 C16 11 18 13 18 13 C18 13 16 21 14 21 C12 21 11 20 10 20 C9 20 8 21 6 21 C4 21 2 17 2 14 C2 11 4 9 6 9 C8 9 9 11 10 11 C11 11 12 11 14 11Z" stroke="currentColor" strokeWidth="1" fill="none"/>
      <text x="22" y="18" fontFamily="Georgia, serif" fontSize="11" fontWeight="300" fill="currentColor">Pay</text>
    </svg>
  );
}

function IconGooglePay() {
  return (
    <svg viewBox="0 0 48 28" fill="none" aria-hidden className={styles.payIcon}>
      <text x="2" y="19" fontFamily="Georgia, serif" fontSize="13" fontWeight="300" fill="currentColor">G</text>
      <text x="14" y="19" fontFamily="Georgia, serif" fontSize="11" fontWeight="300" fill="currentColor" opacity="0.7">Pay</text>
    </svg>
  );
}

function IconBizum() {
  return (
    <svg viewBox="0 0 48 28" fill="none" aria-hidden className={styles.payIcon}>
      <text x="4" y="20" fontFamily="Georgia, serif" fontSize="12" fontWeight="300" fill="currentColor" letterSpacing="0.5">Bizum</text>
    </svg>
  );
}

function IconBitcoin() {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden className={styles.payIcon}>
      <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.2"/>
      <text x="8" y="19" fontFamily="Georgia, serif" fontSize="13" fontWeight="300" fill="currentColor">₿</text>
    </svg>
  );
}

const PAYMENT_METHODS = [
  { key: 'card',    label: 'Visa / Mastercard', icon: <IconCard /> },
  { key: 'paypal',  label: 'PayPal',             icon: <IconPayPal /> },
  { key: 'apple',   label: 'Apple Pay',          icon: <IconApplePay /> },
  { key: 'google',  label: 'Google Pay',         icon: <IconGooglePay /> },
  { key: 'bizum',   label: 'Bizum',              icon: <IconBizum /> },
  { key: 'crypto',  label: 'Bitcoin / ETH',      icon: <IconBitcoin />, soon: true },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('pricing');
  const { locale } = useLanguage();
  const freeFeatures      = t.raw('freeFeatures')      as string[];
  const proFeatures       = t.raw('proFeatures')       as ProFeature[];
  const therapistFeatures = t.raw('therapistFeatures') as string[];

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billingCycle: annual ? 'annual' : 'monthly',
          locale,
        }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`section ${styles.pricing}`} id="pricing">
      <div className="container">
        <p className={styles.label}>{t('label')}</p>
        <h2 className={styles.title}>
          {t.rich('title', { em: (chunks) => <em>{chunks}</em> })}
        </h2>

        {/* Toggle mensual / anual */}
        <div className={styles.toggle}>
          <span className={!annual ? styles.toggleActive : ''}>{t('monthly')}</span>
          <button
            className={styles.toggleBtn}
            onClick={() => setAnnual((v) => !v)}
            aria-label="Toggle annual billing"
          >
            <span className={`${styles.toggleKnob} ${annual ? styles.toggleKnobOn : ''}`} />
          </button>
          <span className={annual ? styles.toggleActive : ''}>
            {t('annual')} <em className={styles.saveBadge}>{t('twoFree')}</em>
          </span>
        </div>

        {/* ── 3 Cards ── */}
        <div className={styles.grid}>

          {/* Freemium */}
          <div className={`${styles.card} reveal`}>
            <p className={styles.tier}>{t('freeName')}</p>
            <div className={styles.priceRow}>
              <span className={styles.amount}>€0</span>
              <span className={styles.period}>{t('forever')}</span>
            </div>
            <p className={styles.annualNote}>{t('freeNote')}</p>
            <ul className={styles.features}>
              {freeFeatures.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <Button variant="outline" fullWidth>{t('freeCta')}</Button>
          </div>

          {/* Quantum Pro — destacado */}
          <div className={`${styles.card} ${styles.proCard} reveal`}>
            <span className={styles.badge}>{t('popular')}</span>
            <p className={styles.tier}>{t('proName')}</p>
            <div className={styles.priceRow}>
              <span className={styles.amount}>
                €{annual ? Math.round(PRO_PRICE_ANNUAL / 12) : PRO_PRICE.toFixed(2).replace('.', ',')}
              </span>
              <span className={styles.period}>{t('perMonth')}</span>
            </div>
            <p className={styles.annualNote}>
              {annual
                ? t('billedAnnual', { price: PRO_PRICE_ANNUAL })
                : t('saveAnnual', { price: PRO_PRICE_ANNUAL, savings: Math.round(PRO_PRICE * 12 - PRO_PRICE_ANNUAL) })}
            </p>
            <ul className={styles.features}>
              {proFeatures.map((f) => (
                <li key={f.text} className={f.highlight ? styles.highlight : ''}>{f.text}</li>
              ))}
            </ul>
            <Button variant="gold" fullWidth onClick={handleCheckout} disabled={loading}>
              {loading ? '…' : t('proCta')}
            </Button>
          </div>

          {/* Terapeuta */}
          <div className={`${styles.card} ${styles.therapistCard} reveal`}>
            <span className={`${styles.badge} ${styles.betaBadge}`}>{t('therapistBadge')}</span>
            <p className={styles.tier}>{t('therapistName')}</p>
            <div className={styles.priceRow}>
              <span className={`${styles.amount} ${styles.therapistAmount}`}>{t('therapistPriceLabel')}</span>
            </div>
            <p className={styles.annualNote}>{t('therapistNote')}</p>
            <ul className={styles.features}>
              {therapistFeatures.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <Button variant="outline" fullWidth>{t('therapistCta')}</Button>
          </div>
        </div>

        <p className={styles.note}>{t('note')}</p>

        {/* ── Métodos de pago ── */}
        <div className={styles.paymentSection}>
          <p className={styles.paymentTitle}>{t('paymentTitle')}</p>
          <div className={styles.paymentGrid}>
            {PAYMENT_METHODS.map((m) => (
              <div key={m.key} className={`${styles.payMethod} ${m.soon ? styles.payMethodSoon : ''}`}>
                {m.icon}
                <span className={styles.payLabel}>{m.label}</span>
                {m.soon && (
                  <span className={styles.payComingSoon}>{t('paymentComingSoon')}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
