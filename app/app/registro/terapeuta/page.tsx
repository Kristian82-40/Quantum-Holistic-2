'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase-client';

export default function RegistroTerapeutaPage() {
  const [fullName, setFullName]       = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [bio, setBio]                 = useState('');
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(false);
  const [loading, setLoading]         = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        plan: 'freemium',
        role: 'terapeuta',
        verified: false,
        especialidad,
        bio,
      });
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <main style={s.page}>
        <div style={s.card}>
          <p style={s.label}>Quantum Holistic · Terapeutas</p>
          <h1 style={{ ...s.title, fontSize: '26px' }}>Solicitud recibida</h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '12px' }}>
            Hemos recibido tu solicitud para unirte como terapeuta.
          </p>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '32px' }}>
            El equipo de Quantum Holistic revisará tu perfil y te contactará en <strong style={{ color: 'var(--text-primary)' }}>24–48 horas</strong> a <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
          </p>
          <a href="/" style={{ ...s.btn, display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            Volver al inicio
          </a>
        </div>
      </main>
    );
  }

  return (
    <main style={s.page}>
      <div style={s.card}>
        <p style={s.label}>Quantum Holistic · Terapeutas</p>
        <h1 style={s.title}>Registro terapeuta</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
          Tu perfil será revisado manualmente antes de activarse.
        </p>

        <form onSubmit={handleRegister}>
          <div style={s.field}>
            <label style={s.fieldLabel}>Nombre completo</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              required style={s.input} autoComplete="name" />
          </div>
          <div style={s.field}>
            <label style={s.fieldLabel}>Email profesional</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required style={s.input} autoComplete="email" />
          </div>
          <div style={s.field}>
            <label style={s.fieldLabel}>Contraseña <span style={{ fontStyle: 'italic', textTransform: 'none', letterSpacing: 0 }}>(mín. 6 caracteres)</span></label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={6} style={s.input} autoComplete="new-password" />
          </div>
          <div style={s.field}>
            <label style={s.fieldLabel}>Especialidad</label>
            <input type="text" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)}
              required placeholder="Ej: Nutrición funcional, Herbología, Ayurveda..." style={s.input} />
          </div>
          <div style={{ ...s.field, marginBottom: 32 }}>
            <label style={s.fieldLabel}>Bio breve</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)}
              required rows={3} placeholder="Cuéntanos tu experiencia y enfoque terapéutico..."
              style={{ ...s.input, resize: 'vertical', padding: '12px 0' }} />
          </div>

          {error && <p style={s.error}>{error}</p>}

          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? '...' : 'Enviar solicitud'}
          </button>
        </form>

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
    maxWidth: '440px',
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
    marginBottom: '16px',
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
  error: { color: '#c0392b', fontSize: '13px', marginBottom: '20px' },
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
  footer: { textAlign: 'center', marginTop: '28px', fontSize: '13px', color: 'var(--text-muted)' },
  link: { color: 'var(--sage)', textDecoration: 'none' },
};
