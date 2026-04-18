'use client';

import { useTranslations } from 'next-intl';
import { SITE_CONFIG } from '@/lib/config';
import CincoElementos from '@/components/illustrations/CincoElementos';
import styles from './Footer.module.css';

export default function Footer() {
  const t = useTranslations('footer');

  const cols = [
    { heading: t('platform'), links: t.raw('platformLinks') as string[] },
    { heading: t('company'),  links: t.raw('companyLinks') as string[] },
    { heading: t('legal'),    links: t.raw('legalLinks') as string[] },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.botanical} aria-hidden>
        <CincoElementos size={150} />
      </div>

      <div className={`container ${styles.top}`}>
        <div className={styles.brand}>
          <p className={styles.name}>Quantum <span>Holistic</span></p>
          <p className={styles.desc}>{t('desc')}</p>
        </div>

        {cols.map((col) => (
          <div key={col.heading} className={styles.col}>
            <h4 className={styles.colTitle}>{col.heading}</h4>
            <ul>
              {col.links.map((link) => (
                <li key={link}><a href="#">{link}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={`container ${styles.bottom}`}>
        <span>© {new Date().getFullYear()} Quantum Holistic · Bristol, UK</span>
        <div className={styles.social}>
          <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="#">{t('newsletter')}</a>
          <a href={SITE_CONFIG.social.youtube} target="_blank" rel="noopener noreferrer">YouTube</a>
        </div>
      </div>
    </footer>
  );
}
