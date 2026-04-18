'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import styles from './Pricing.module.css';

const PRO_PRICE = 9;
const PRO_PRICE_ANNUAL = 79;

type ProFeature = { text: string; highlight: boolean };

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const t = useTranslations('pricing');
  const freeFeatures = t.raw('freeFeatures') as string[];
  const proFeatures = t.raw('proFeatures') as ProFeature[];

  return (
    <section className={`section ${styles.pricing}`} id="pricing">
      <div className="container">
        <p className={styles.label}>{t('label')}</p>
        <h2 className={styles.title}>
          {t.rich('title', { em: (chunks) => <em>{chunks}</em> })}
        </h2>

        {/* Toggle */}
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

        {/* Cards */}
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
              {freeFeatures.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>

            <Button variant="outline" fullWidth>
              {t('freeCta')}
            </Button>
          </div>

          {/* Quantum Pro */}
          <div className={`${styles.card} ${styles.proCard} reveal`}>
            <span className={styles.badge}>{t('popular')}</span>

            <p className={styles.tier}>{t('proName')}</p>

            <div className={styles.priceRow}>
              <span className={styles.amount}>
                €{annual ? Math.round(PRO_PRICE_ANNUAL / 12) : PRO_PRICE}
              </span>
              <span className={styles.period}>{t('perMonth')}</span>
            </div>

            <p className={styles.annualNote}>
              {annual
                ? t('billedAnnual', { price: PRO_PRICE_ANNUAL })
                : t('saveAnnual', { price: PRO_PRICE_ANNUAL, savings: PRO_PRICE * 12 - PRO_PRICE_ANNUAL })}
            </p>

            <ul className={styles.features}>
              {proFeatures.map((f) => (
                <li key={f.text} className={f.highlight ? styles.highlight : ''}>
                  {f.text}
                </li>
              ))}
            </ul>

            <Button variant="gold" fullWidth>
              {t('proCta')}
            </Button>
          </div>
        </div>

        <p className={styles.note}>{t('note')}</p>
      </div>
    </section>
  );
}
