'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/components/providers/LanguageProvider';
import Button from '@/components/ui/Button';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations('nav');
  const { locale, setLocale } = useLanguage();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { label: t('method'),     href: '/#pillars' },
    { label: t('process'),    href: '/#how' },
    { label: t('quantumPro'), href: '/#pro-detail' },
    { label: t('plans'),      href: '/#pricing' },
    { label: t('blog'),       href: '/blog' },
    { label: 'Plantas',       href: '/plantas' },
  ];

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <a href="/" className={styles.logo}>
        Quantum <span>Holistic</span>
      </a>

      <nav aria-label="Navegación principal">
        <ul className={styles.links}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={styles.link}>
                {link.label}
              </a>
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
          >
            ES
          </button>
          <span className={styles.langDivider} aria-hidden>|</span>
          <button
            className={`${styles.langBtn} ${locale === 'en' ? styles.langActive : ''}`}
            onClick={() => setLocale('en')}
            aria-pressed={locale === 'en'}
          >
            EN
          </button>
        </div>

        <Button as="a" href="/#pricing">
          {t('startFree')}
        </Button>
      </div>
    </header>
  );
}
