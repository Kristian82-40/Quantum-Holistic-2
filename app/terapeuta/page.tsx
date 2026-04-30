'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';

type Profile = {
  id: string;
  full_name: string;
  email: string;
  especialidad: string | null;
  bio: string | null;
  verified: boolean;
  plan: string;
};

export default function TerapeutaDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, especialidad, bio, verified, plan, role')
        .eq('id', user.id)
        .single();

      if (!data || (data.role !== 'terapeuta' && data.role !== 'admin')) {
        router.push('/');
        return;
      }

      setProfile(data as Profile);
      setLoading(false);
    };
    load();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)' }}>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-serif)', letterSpacing: '0.1em' }}>Cargando...</p>
      </div>
    );
  }

  return (
    <main style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <a href="/" style={s.back}>← Inicio</a>
        <p style={s.headerTitle}>Dashboard Terapeuta</p>
        <button onClick={handleLogout} style={s.logoutBtn}>Cerrar sesión</button>
      </div>

      <div style={s.content}>
        {/* Estado verificación */}
        {!profile?.verified && (
          <div style={s.pendingBanner}>
            <span style={s.pendingDot} />
            <p style={s.pendingText}>
              Tu cuenta está <strong>pendiente de verificación</strong>. El equipo de Quantum Holistic revisará tu perfil en 24–48h.
            </p>
          </div>
        )}

        {/* Perfil */}
        <div style={s.card}>
          <p style={s.cardLabel}>Perfil profesional</p>
          <h1 style={s.name}>{profile?.full_name}</h1>
          <p style={s.email}>{profile?.email}</p>

          {profile?.especialidad && (
            <div style={s.field}>
              <span style={s.fieldLabel}>Especialidad</span>
              <p style={s.fieldValue}>{profile.especialidad}</p>
            </div>
          )}

          {profile?.bio && (
            <div style={s.field}>
              <span style={s.fieldLabel}>Bio</span>
              <p style={s.fieldValue}>{profile.bio}</p>
            </div>
          )}

          <div style={s.badges}>
            <span style={{ ...s.badge, background: profile?.verified ? '#e8f5e9' : '#fff3e0', color: profile?.verified ? '#2e7d32' : '#e65100' }}>
              {profile?.verified ? '✓ Verificado' : '⏳ Pendiente verificación'}
            </span>
            <span style={{ ...s.badge, background: '#f3f4f6', color: 'var(--text-muted)' }}>
              Plan {profile?.plan}
            </span>
          </div>
        </div>

        {/* Próximas funcionalidades */}
        <div style={s.card}>
          <p style={s.cardLabel}>Próximamente</p>
          <div style={s.comingList}>
            {[
              'Mis clientes y seguimiento',
              'Protocolos personalizados',
              'Chat con clientes',
              'Agenda y citas',
              'Recursos y formación',
            ].map((item) => (
              <div key={item} style={s.comingItem}>
                <span style={s.comingDot} />
                <p style={s.comingText}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-secondary)',
    fontFamily: 'var(--font-sans)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 32px',
    background: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border)',
  },
  back: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    letterSpacing: '0.05em',
    marginRight: 'auto',
  },
  headerTitle: {
    fontFamily: 'var(--font-serif)',
    fontWeight: 300,
    fontSize: '16px',
    color: 'var(--text-primary)',
    letterSpacing: '0.1em',
  },
  logoutBtn: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    background: 'none',
    border: '1px solid var(--border)',
    padding: '6px 14px',
    cursor: 'pointer',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  content: {
    maxWidth: '640px',
    margin: '0 auto',
    padding: '40px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  pendingBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px 20px',
    background: '#fff8e1',
    border: '1px solid #ffe082',
    borderRadius: '2px',
  },
  pendingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#f59e0b',
    flexShrink: 0,
    marginTop: '4px',
  },
  pendingText: {
    fontSize: '13px',
    color: '#92400e',
    lineHeight: 1.6,
    margin: 0,
  },
  card: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    padding: '32px',
  },
  cardLabel: {
    fontFamily: 'var(--font-serif)',
    fontSize: '11px',
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
    color: 'var(--sage)',
    marginBottom: '20px',
  },
  name: {
    fontFamily: 'var(--font-serif)',
    fontWeight: 300,
    fontSize: '28px',
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  email: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginBottom: '24px',
  },
  field: { marginBottom: '16px' },
  fieldLabel: {
    display: 'block',
    fontSize: '11px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '4px',
  },
  fieldValue: {
    fontSize: '14px',
    color: 'var(--text-primary)',
    lineHeight: 1.6,
    margin: 0,
  },
  badges: {
    display: 'flex',
    gap: '8px',
    marginTop: '20px',
    flexWrap: 'wrap',
  },
  badge: {
    fontSize: '11px',
    padding: '4px 10px',
    letterSpacing: '0.05em',
  },
  comingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  comingItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  comingDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--border)',
    flexShrink: 0,
  },
  comingText: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    margin: 0,
  },
};
