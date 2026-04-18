'use client';

import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import QuantumCircle from '@/components/illustrations/QuantumCircle';
import styles from './Hero.module.css';

export default function Hero() {
  const t = useTranslations('hero');
  const elements = t.raw('elements') as string[];

  return (
    <section className={styles.hero}>
      {/* ── CSS Art Background ── */}
      <div className={styles.bgGradient} aria-hidden />
      <div className={styles.bgLight} aria-hidden />
      <div className={styles.bgWaves} aria-hidden>
        {[0,1,2,3,4].map((i) => (
          <span key={i} className={styles.wave} style={{ '--w': i } as React.CSSProperties} />
        ))}
      </div>
      <div className={styles.bgParticles} aria-hidden>
        {Array.from({ length: 24 }, (_, i) => (
          <span key={i} className={styles.particle} style={{ '--i': i } as React.CSSProperties} />
        ))}
      </div>

      {/* ── QuantumCircle flotando a la derecha ── */}
      <div className={styles.quantumFloat} aria-hidden>
        <QuantumCircle size={380} />
      </div>

      {/* ── Contenido centrado ── */}
      <div className={styles.content}>
        <p className={styles.badge}>{t('badge')}</p>

        <h1 className={styles.title}>
          {t('line1')}<br />
          {t('line2')} <em>{t('line2em')}</em><br />
          {t('line3')}
        </h1>

        <div className={styles.elements}>
          {elements.map((el, i) => (
            <span key={el}>
              {i > 0 && <span className={styles.elemDiv}>·</span>}
              {el}
            </span>
          ))}
        </div>

        <p className={styles.desc}>{t('desc')}</p>

        <div className={styles.actions}>
          <Button as="a" href="/#pricing">{t('cta')}</Button>
          <a href="#how" className={styles.textLink}>
            {t('howLink')} <span className={styles.arrow}>→</span>
          </a>
        </div>
      </div>

      <div className={styles.scrollHint} aria-hidden>
        <span className={styles.scrollLine} />
        <span className={styles.scrollLabel}>{t('scroll')}</span>
      </div>
    </section>
  );
}
