'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase-client';

type Props = {
  mode: 'login' | 'registro';
  redirectPath?: string;
};

export default function MagicLinkForm({ mode, redirectPath = '/cuenta' }: Props) {
  const [email, setEmail]       = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole]         = useState<'user' | 'terapeuta'>('user');
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
        shouldCreateUser: mode === 'registro',
        ...(mode === 'registro' ? { data: { full_name: fullName, role } } : {}),
      },
    });

    if (error) {
      setError(
        error.message.toLowerCase().includes('signups not allowed')
          ? 'No existe una cuenta con ese email. Regístrate primero.'
          : error.message
      );
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div>
        <h1 style={{ ...s.title, fontSize: '28px' }}>Revisa tu email</h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          Te hemos enviado un enlace mágico a <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
          Haz clic para {mode === 'registro' ? 'crear tu cuenta' : 'iniciar sesión'}. El enlace caduca en 1 hora.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {mode === 'registro' && (
        <>
          <div style={s.field}>
            <label style={s.fieldLabel}>Nombre</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={s.input}
              autoComplete="name"
            />
          </div>
          <div style={{ ...s.field, marginBottom: '24px' }}>
            <label style={s.fieldLabel}>Soy</label>
            <div style={s.roleToggle}>
              <button
                type="button"
                onClick={() => setRole('user')}
                style={{ ...s.roleBtn, ...(role === 'user' ? s.roleBtnActive : {}) }}
              >
                Cliente
              </button>
              <button
                type="button"
                onClick={() => setRole('terapeuta')}
                style={{ ...s.roleBtn, ...(role === 'terapeuta' ? s.roleBtnActive : {}) }}
              >
                Terapeuta
              </button>
            </div>
          </div>
        </>
      )}

      <div style={{ ...s.field, marginBottom: 32 }}>
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

      {error && <p style={s.error}>{error}</p>}

      <button type="submit" disabled={loading} style={s.btn}>
        {loading ? '...' : mode === 'registro' ? 'Enviarme el enlace' : 'Enviarme el enlace de acceso'}
      </button>
    </form>
  );
}

const s: Record<string, React.CSSProperties> = {
  title: {
    fontFamily: 'var(--font-serif)',
    fontWeight: 300,
    color: 'var(--text-primary)',
    marginBottom: '24px',
    lineHeight: 1.2,
  },
  field: { marginBottom: '20px' },
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
  roleToggle: {
    display: 'flex',
    gap: '8px',
  },
  roleBtn: {
    flex: 1,
    padding: '10px',
    background: 'none',
    border: '1px solid var(--border)',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    cursor: 'pointer',
  },
  roleBtnActive: {
    background: 'var(--sage)',
    borderColor: 'var(--sage)',
    color: '#fff',
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
};
