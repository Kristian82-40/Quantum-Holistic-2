'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';

type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  dosha: 'Vata' | 'Pitta' | 'Kapha' | null;
  plan: string;
  role: string;
};

type Purchase = {
  id: string;
  amount_eur: number | null;
  payment_status: string;
  created_at: string;
  products: { name: string; type: string } | null;
};

const DOSHAS: Array<'Vata' | 'Pitta' | 'Kapha'> = ['Vata', 'Pitta', 'Kapha'];

export default function CuentaPage() {
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading]   = useState(true);
  const [savingDosha, setSavingDosha] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login?redirect=/cuenta'); return; }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, email, dosha, plan, role')
        .eq('id', user.id)
        .single();

      setProfile(profileData as Profile);

      const { data: purchaseData } = await supabase
        .from('purchases')
        .select('id, amount_eur, payment_status, created_at, products(name, type)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setPurchases((purchaseData as unknown as Purchase[]) ?? []);
      setLoading(false);
    };
    load();
  }, [router]);

  const handleDosha = async (dosha: 'Vata' | 'Pitta' | 'Kapha') => {
    if (!profile) return;
    setSavingDosha(true);
    await supabase.from('profiles').update({ dosha }).eq('id', profile.id);
    setProfile({ ...profile, dosha });
    setSavingDosha(false);
  };

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
      <div style={s.header}>
        <a href="/" style={s.back}>← Inicio</a>
        <p style={s.headerTitle}>Mi cuenta</p>
        <button onClick={handleLogout} style={s.logoutBtn}>Cerrar sesión</button>
      </div>

      <div style={s.content}>
        <div style={s.card}>
          <p style={s.cardLabel}>Perfil</p>
          <h1 style={s.name}>{profile?.full_name || profile?.email}</h1>
          <p style={s.email}>{profile?.email}</p>
          <span style={{ ...s.badge, background: '#f3f4f6', color: 'var(--text-muted)' }}>
            Plan {profile?.plan}
          </span>
        </div>

        <div style={s.card}>
          <p style={s.cardLabel}>Mi dosha</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
            Tu tipo constitucional ayurvédico. Se usa para personalizar recomendaciones.
          </p>
          <div style={s.doshaRow}>
            {DOSHAS.map((d) => (
              <button
                key={d}
                onClick={() => handleDosha(d)}
                disabled={savingDosha}
                style={{ ...s.doshaBtn, ...(profile?.dosha === d ? s.doshaBtnActive : {}) }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div style={s.card}>
          <p style={s.cardLabel}>Mis descargas</p>
          {purchases.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Todavía no tienes compras. Explora nuestros{' '}
              <a href="/#pricing" style={s.link}>planes</a>.
            </p>
          ) : (
            <div style={s.comingList}>
              {purchases.map((p) => (
                <div key={p.id} style={s.purchaseItem}>
                  <div>
                    <p style={s.purchaseName}>{p.products?.name ?? 'Producto'}</p>
                    <p style={s.purchaseDate}>{new Date(p.created_at).toLocaleDateString('es-ES')}</p>
                  </div>
                  <span style={{
                    ...s.badge,
                    background: p.payment_status === 'completed' ? '#e8f5e9' : '#fff3e0',
                    color: p.payment_status === 'completed' ? '#2e7d32' : '#e65100',
                  }}>
                    {p.payment_status === 'completed' ? 'Completado' : p.payment_status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {(profile?.role === 'terapeuta' || profile?.role === 'admin') && (
          <a href="/terapeuta" style={{ ...s.btn, display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            Ir a mi panel de terapeuta →
          </a>
        )}
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'var(--bg-secondary)', fontFamily: 'var(--font-sans)' },
  header: {
    display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 32px',
    background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)',
  },
  back: { fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '0.05em', marginRight: 'auto' },
  headerTitle: { fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '16px', color: 'var(--text-primary)', letterSpacing: '0.1em' },
  logoutBtn: {
    fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: '1px solid var(--border)',
    padding: '6px 14px', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase',
  },
  content: { maxWidth: '640px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '24px' },
  card: { background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '32px' },
  cardLabel: {
    fontFamily: 'var(--font-serif)', fontSize: '11px', letterSpacing: '0.3em',
    textTransform: 'uppercase', color: 'var(--sage)', marginBottom: '20px',
  },
  name: { fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '28px', color: 'var(--text-primary)', marginBottom: '4px' },
  email: { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' },
  badge: { fontSize: '11px', padding: '4px 10px', letterSpacing: '0.05em' },
  doshaRow: { display: 'flex', gap: '8px' },
  doshaBtn: {
    flex: 1, padding: '14px', background: 'none', border: '1px solid var(--border)',
    color: 'var(--text-muted)', fontFamily: 'var(--font-serif)', fontSize: '14px', cursor: 'pointer', letterSpacing: '0.05em',
  },
  doshaBtnActive: { background: 'var(--sage)', borderColor: 'var(--sage)', color: '#fff' },
  comingList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  purchaseItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' },
  purchaseName: { fontSize: '14px', color: 'var(--text-primary)', margin: 0 },
  purchaseDate: { fontSize: '12px', color: 'var(--text-muted)', margin: 0, marginTop: '2px' },
  btn: {
    padding: '14px', background: 'var(--sage)', color: '#fff', border: 'none', cursor: 'pointer',
    fontFamily: 'var(--font-serif)', fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase',
  },
  link: { color: 'var(--sage)', textDecoration: 'none' },
};
