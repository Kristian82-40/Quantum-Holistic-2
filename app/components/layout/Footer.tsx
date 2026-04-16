import { SITE_CONFIG } from '@/lib/config';
import styles from './Footer.module.css';

const FOOTER_COLS = [
  {
    heading: 'Plataforma',
    links: [
      { label: 'Mi perfil',    href: '/#profile' },
      { label: 'Plan semanal', href: '/#how' },
      { label: 'Herbología',   href: '/#pillars' },
      { label: 'Quantum Pro',  href: '/#pricing' },
    ],
  },
  {
    heading: 'Empresa',
    links: [
      { label: 'Método',        href: '/#pillars' },
      { label: 'Blog',          href: '/blog' },
      { label: 'Contacto',      href: `mailto:${SITE_CONFIG.email}` },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacidad', href: '/privacidad' },
      { label: 'Términos',   href: '/terminos' },
      { label: 'Cookies',    href: '/cookies' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <div className={styles.brand}>
          <p className={styles.name}>
            Quantum <span>Holistic</span>
          </p>
          <p className={styles.desc}>{SITE_CONFIG.description}</p>
        </div>

        {FOOTER_COLS.map((col) => (
          <div key={col.heading} className={styles.col}>
            <h4 className={styles.colTitle}>{col.heading}</h4>
            <ul>
              {col.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={`container ${styles.bottom}`}>
        <span>© {new Date().getFullYear()} Quantum Holistic · Bristol, UK</span>
        <div className={styles.social}>
          <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href={`mailto:${SITE_CONFIG.email}`}>Newsletter</a>
          <a href={SITE_CONFIG.social.youtube} target="_blank" rel="noopener noreferrer">YouTube</a>
        </div>
      </div>
    </footer>
  );
}
