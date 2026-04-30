'use client';

import { useEffect, useState } from 'react';

interface Lead {
  id: string;
  email: string;
  source: string;
  dosha: string | null;
  converted: boolean;
  created_at: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/leads')
      .then(r => r.json())
      .then(data => { setLeads(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const converted = leads.filter(l => l.converted).length;
  const rate = leads.length ? Math.round((converted / leads.length) * 100) : 0;

  return (
    <div style={{ padding: '40px 32px', maxWidth: '900px', margin: '0 auto', fontFamily: 'var(--font-sans, sans-serif)' }}>
      <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sage, #6B7C5E)', marginBottom: '8px' }}>Admin</p>
      <h1 style={{ fontFamily: 'var(--font-serif, serif)', fontWeight: 300, fontSize: '2rem', marginBottom: '8px' }}>Leads</h1>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total leads', value: leads.length },
          { label: 'Convertidos', value: converted },
          { label: 'Tasa conversión', value: `${rate}%` },
        ].map(kpi => (
          <div key={kpi.label} style={{ padding: '20px', border: '1px solid var(--border, #333)', borderRadius: '8px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted, #888)', marginBottom: '8px' }}>{kpi.label}</p>
            <p style={{ fontFamily: 'var(--font-serif, serif)', fontSize: '2rem', fontWeight: 300 }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--text-muted, #888)' }}>Cargando…</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {leads.map(lead => (
          <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', border: '1px solid var(--border, #2a2a2a)', borderRadius: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: lead.converted ? '#4CAF50' : '#888', flexShrink: 0 }} />
            <p style={{ flex: 1, fontSize: '14px', fontWeight: 400 }}>{lead.email}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted, #888)', letterSpacing: '0.1em' }}>{lead.source}</p>
            {lead.dosha && <p style={{ fontSize: '11px', color: 'var(--sage, #6B7C5E)', letterSpacing: '0.1em' }}>{lead.dosha}</p>}
            <p style={{ fontSize: '11px', color: 'var(--text-muted, #888)' }}>{new Date(lead.created_at).toLocaleDateString('es-ES')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
