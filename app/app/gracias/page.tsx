'use client';

import { useTranslations } from 'next-intl';
import { SITE_CONFIG } from '@/lib/config';
import styles from './gracias.module.css';

export default function GraciasPage() {
  const t = useTranslations('gracias');

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.badge}>{t('badge')}</p>

        <h1 className={styles.title}>
          {t.rich('title', { em: (chunks) => <em>{chunks}</em> })}
        </h1>

        <p className={styles.desc}>{t('desc')}</p>

        <div className={styles.steps}>
          <p className={styles.stepsLabel}>{t('next')}</p>
          <ol className={styles.stepList}>
            <li>{t('step1')}</li>
            <li>{t('step2')}</li>
            <li>{t('step3')}</li>
          </ol>
        </div>

        <a href="/" className={styles.cta}>
          {t('cta')} →
        </a>

        <p className={styles.support}>
          {t('support')}{' '}
          <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>
        </p>
      </div>
    </main>
  );
}
