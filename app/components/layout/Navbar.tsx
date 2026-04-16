'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { NAV_LINKS } from '@/lib/config';
import Button from '@/components/ui/Button';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo} aria-label="Quantum Holistic — inicio">
          <svg width="22" height="26" viewBox="0 0 22 26" fill="none" aria-hidden>
            <path d="M11 24C11 24 2 18.5 2 10C2 5.58 6.03 2 11 2C15.97 2 20 5.58 20 10C20 18.5 11 24 11 24Z" stroke="#6B7C5E" strokeWidth="1.2" fill="none"/>
            <path d="M11 24V11" stroke="#6B7C5E" strokeWidth="0.9"/>
            <path d="M11 17C11 17 6.5 14 4 10.5" stroke="#A8B89A" strokeWidth="0.7"/>
            <path d="M11 17C11 17 15.5 14 18 10.5" stroke="#A8B89A" strokeWidth="0.7"/>
          </svg>
          <span>Quantum <em>Holistic</em></span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Navegación principal" className={styles.desktopNav}>
          <ul className={styles.links}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.link}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <Button as="a" href="/#pricing" className={styles.ctaDesktop}>
            Empezar gratis
          </Button>

          {/* Hamburger */}
          <button
            className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={`${styles.overlay} ${open ? styles.overlayOpen : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      <nav
        className={`${styles.mobileMenu} ${open ? styles.mobileMenuOpen : ''}`}
        aria-label="Menú móvil"
      >
        <ul className={styles.mobileLinks}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={styles.mobileLink}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Button as="a" href="/#pricing" fullWidth>
          Empezar gratis
        </Button>
      </nav>
    </>
  );
}
