'use client';

import { useTranslations } from 'next-intl';
import PlantaMedicinal from '@/components/illustrations/PlantaMedicinal';
import BioZenScene from '../ui/BioZenScene';
import styles from './Pillars.module.css';

type PillarItem = {
  num: string;
  title: string;
  desc: string;
  tags: string[];
};

export default function Pillars() {
  const t = useTranslations('pillars');
  const items = t.raw('items') as PillarItem[];

  return (
    <section className={`section ${styles.pillars}`} id="pillars">
      <div className="container">
        <p className={styles.label}>{t('label')}</p>
        <h2 className={styles.title}>
          {t.rich('title', { em: (chunks) => <em>{chunks}</em> })}
        </h2>
      </div>

      <div className="container">
        <div className={styles.grid}>
          {items.map((p) => p.num === '04' ? (
            <article key={p.num} className={`${styles.pillar} ${styles.pillarWide} reveal`}>
              <div className={styles.pillarWideText}>
                <span className={styles.num}>{p.num}</span>
                <h3 className={styles.pillarTitle}>{p.title}</h3>
                <p className={styles.desc}>{p.desc}</p>
                <div className={styles.tags}>
                  {p.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
              <div className={styles.pillarWideVisual} aria-hidden>
                <BioZenScene />
              </div>
            </article>
          ) : (
            <article key={p.num} className={`${styles.pillar} reveal`}>
              <div className={styles.pillarIllus} aria-hidden>
                <PlantaMedicinal size={110} />
              </div>
              <span className={styles.num}>{p.num}</span>
              <h3 className={styles.pillarTitle}>{p.title}</h3>
              <p className={styles.desc}>{p.desc}</p>
              <div className={styles.tags}>
                {p.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
