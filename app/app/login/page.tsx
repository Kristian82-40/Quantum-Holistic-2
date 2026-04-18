'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Email o contraseña incorrectos.'
        : error.message);
    } else {
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <main style={s.page}>
      <div style={s.card}>
        <p style={s.label}>Quantum Holistic</p>
        <h1 style={s.title}>Iniciar sesión</h1>

        <form onSubmit={handleLogin}>
          <div style={s.field}>
            <label style={s.fieldLabel}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={s.input}
              autoComplete="email"
            />
          </div>
          <div style={{ ...s.field, marginBottom: 32 }}>
            <label style={s.fieldLabel}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={s.input}
              autoComplete="current-password"
            />
          </div>

          {error && <p style={s.error}>{error}</p>}

          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? '...' : 'Entrar'}
          </button>
        </form>

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
  field: {
    marginBottom: '20px',
  },
  fieldLabel: {
    display: 'block',
    fontSize: '11px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 0',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: '1px solid var(--border)',
    background: 'none',
    outline: 'none',
    fontSize: '15px',
    color: 'var(--text-primary)',
    boxSizing: 'border-box',
    fontFamily: 'var(--font-sans)',
  },
  error: {
    color: '#c0392b',
    fontSize: '13px',
    marginBottom: '20px',
  },
  btn: {
    width: '100%',
    padding: '14px',
    background: 'var(--sage)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-serif)',
    fontSize: '13px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
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
