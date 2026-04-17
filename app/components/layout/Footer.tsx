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
      <div className={styles.botanical} aria-hidden>
        <svg viewBox="0 0 120 200" fill="none">
          <line x1="60" y1="200" x2="60" y2="20" stroke="rgba(168,184,154,0.2)" strokeWidth="1"/>
          <path d="M60 160 C60 160 30 140 20 110 C40 108 55 120 60 160Z" fill="rgba(168,184,154,0.12)"/>
          <path d="M60 140 C60 140 90 120 100 90 C80 88 65 100 60 140Z" fill="rgba(168,184,154,0.12)"/>
          <path d="M60 110 C60 110 34 96 28 70 C44 68 58 80 60 110Z" fill="rgba(168,184,154,0.10)"/>
          <path d="M60 90 C60 90 86 76 92 50 C76 48 62 60 60 90Z" fill="rgba(168,184,154,0.10)"/>
          <circle cx="60" cy="20" r="4" fill="rgba(168,184,154,0.25)"/>
        </svg>
      </div>

      <div className={`container ${styles.top}`}>
        <div className={styles.brand}>
          <p className={styles.name}>
            Quantum <span>Holistic</span>
          </p>
          <p className={styles.desc}>{SITE_CONFIG.description}</p>
          <a href={`mailto:${SITE_CONFIG.email}`} className={styles.email}>
            {SITE_CONFIG.email}
          </a>
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
