'use client';

import { useTranslations } from 'next-intl';
import styles from './ProDetail.module.css';

type ProItem = { icon: string; title: string; desc: string; tag: string };

export default function ProDetail() {
  const t = useTranslations('pro');
  const items = t.raw('items') as ProItem[];

  return (
    <section className={`section ${styles.pro}`} id="pro-detail">
      <div className="container">
        <p className={styles.label}>{t('label')}</p>
        <h2 className={styles.title}>
          {t('titleLine1')} <em>{t('titleEm')}</em>.<br />
          {t('titleLine2')}
        </h2>
      </div>

      <div className="container">
        <div className={styles.grid}>
          {items.map((item) => (
            <article key={item.title} className={`${styles.item} reveal`}>
              <span className={styles.icon} aria-hidden>{item.icon}</span>
              <h3 className={styles.itemTitle}>{item.title}</h3>
              <p className={styles.desc}>{item.desc}</p>
              <span className={styles.tag}>{item.tag}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
