'use client';

import MagicLinkForm from '@/components/auth/MagicLinkForm';

export default function RegistroPage() {
  return (
    <main style={s.page}>
      <div style={s.card}>
        <p style={s.label}>Quantum Holistic</p>
        <h1 style={s.title}>Crear cuenta</h1>

        <MagicLinkForm mode="registro" redirectPath="/cuenta" />

        <p style={s.footer}>
          ¿Ya tienes cuenta?{' '}
          <a href="/login" style={s.link}>Inicia sesión</a>
        </p>
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-secondary)',
    padding: '24px',
  },
  card: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    padding: '56px 48px',
    maxWidth: '420px',
    width: '100%',
  },
  label: {
    fontFamily: 'var(--font-serif)',
    fontSize: '11px',
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
    color: 'var(--sage)',
    marginBottom: '32px',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontWeight: 300,
    fontSize: '32px',
    color: 'var(--text-primary)',
    marginBottom: '40px',
    lineHeight: 1.2,
  },
  footer: {
    textAlign: 'center',
    marginTop: '28px',
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  link: {
    color: 'var(--sage)',
    textDecoration: 'none',
  },
};
