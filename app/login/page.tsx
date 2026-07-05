'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MagicLinkForm from '@/components/auth/MagicLinkForm';

function LoginForm() {
  const params = useSearchParams();
  const redirectPath = params.get('redirect') || '/cuenta';
  return <MagicLinkForm mode="login" redirectPath={redirectPath} />;
}

export default function LoginPage() {
  return (
    <main style={s.page}>
      <div style={s.card}>
        <p style={s.label}>Quantum Holistic</p>
        <h1 style={s.title}>Iniciar sesión</h1>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <p style={s.footer}>
          ¿No tienes cuenta?{' '}
          <a href="/registro" style={s.link}>Regístrate</a>
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
