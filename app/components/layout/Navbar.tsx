'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/components/providers/LanguageProvider';
import Button from '@/components/ui/Button';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations('nav');
  const { locale, setLocale } = useLanguage();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
    { label: t('method'),     href: '/#pillars' },
    { label: t('process'),    href: '/#how' },
    { label: t('quantumPro'), href: '/#pro-detail' },
    { label: t('plans'),      href: '/#pricing' },
    { label: t('blog'),       href: '/blog' },
    { label: 'Plantas',       href: '/plantas' },
    { label: 'Recomendador',  href: '/recomendador' },
  ];

  return (
    <>
      <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <a href="/" className={styles.logo}>
          Quantum <span>Holistic</span>
        </a>

        <nav aria-label="Navegación principal">
          <ul className={styles.links}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={styles.link}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <div className={styles.langSelector} role="group" aria-label="Idioma / Language">
            <button
              className={`${styles.langBtn} ${locale === 'es' ? styles.langActive : ''}`}
              onClick={() => setLocale('es')}
              aria-pressed={locale === 'es'}
            >ES</button>
            <span className={styles.langDivider} aria-hidden>|</span>
            <button
              className={`${styles.langBtn} ${locale === 'en' ? styles.langActive : ''}`}
              onClick={() => setLocale('en')}
              aria-pressed={locale === 'en'}
            >EN</button>
          </div>

          <Button as="a" href="/#pricing" className={styles.ctaDesktop}>
            {t('startFree')}
          </Button>

          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ''}`} />
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ''}`} />
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ''}`} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className={styles.mobileMenu} onClick={() => setMenuOpen(false)}>
          <nav className={styles.mobileNav} onClick={e => e.stopPropagation()}>
            <ul className={styles.mobileLinks}>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </a>
                </li>
              ))}
              <li style={{ marginTop: '28px' }}>
                <a href="/#pricing" className={styles.mobileCta} onClick={() => setMenuOpen(false)}>
                  {t('startFree')}
                </a>
              </li>
            </ul>
            <div className={styles.mobileLang}>
              <button
                className={`${styles.langBtn} ${locale === 'es' ? styles.langActive : ''}`}
                onClick={() => { setLocale('es'); setMenuOpen(false); }}
              >ES</button>
              <span className={styles.langDivider}>|</span>
              <button
                className={`${styles.langBtn} ${locale === 'en' ? styles.langActive : ''}`}
                onClick={() => { setLocale('en'); setMenuOpen(false); }}
              >EN</button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
