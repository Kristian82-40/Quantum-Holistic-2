'use client';

import { useEffect, useState } from 'react';
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
        <a href="/" className={styles.logo} onClick={() => setOpen(false)}>
          Quantum <span>Holistic</span>
        </a>

        <nav aria-label="Navegación principal">
          <ul className={styles.links}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={styles.link}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.desktopCta}>
          <Button as="a" href="/#pricing">Empezar gratis</Button>
        </div>

        <button
          className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* Mobile menu overlay */}
      <div className={`${styles.mobileMenu} ${open ? styles.mobileMenuOpen : ''}`}>
        <nav>
          <ul className={styles.mobileLinks}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={styles.mobileLink} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className={styles.mobileCta}>
            <Button as="a" href="/#pricing" onClick={() => setOpen(false)}>
              Empezar gratis
            </Button>
          </div>
        </nav>
      </div>
    </>
  );
}
