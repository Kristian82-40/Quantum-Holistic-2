'use client';

import { useEffect, useState } from 'react';

interface FichaCientifica {
  familia_botanica: string;
  parte_usada: string;
  principios_activos: string[];
  propiedades: string[];
  indicaciones: string[];
  contraindicaciones: string[];
  posologia: string;
  evidencia: string;
}

interface FichaMistica {
  elemento: string;
  planeta_regente: string;
  chakra: string;
  energia: string;
  uso_ceremonial: string;
  afinidad_ayurvedica: string;
  simbolismo: string;
}

interface Plant {
  id: number;
  slug: string;
  nombre_es: string;
  nombre_latino: string;
  image_cientifica_url: string | null;
  ficha_cientifica: FichaCientifica;
  ficha_mistica: FichaMistica;
}

export default function AdminPlantasPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Plant | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch('/api/admin/plantas')
      .then(r => r.json())
      .then(data => { setPlants(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/plantas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selected.id,
          nombre_es: selected.nombre_es,
          nombre_latino: selected.nombre_latino,
          image_cientifica_url: selected.image_cientifica_url,
          ficha_cientifica: selected.ficha_cientifica,
          ficha_mistica: selected.ficha_mistica,
        }),
      });
      if (res.ok) {
        setPlants(prev => prev.map(p => p.id === selected.id ? selected : p));
        showToast('Guardado correctamente');
      } else {
        showToast('Error al guardar');
      }
    } catch {
      showToast('Error de red');
    } finally {
      setSaving(false);
    }
  }

  function updateFc(field: keyof FichaCientifica, value: string) {
    if (!selected) return;
    setSelected({
      ...selected,
      ficha_cientifica: { ...selected.ficha_cientifica, [field]: value },
    });
  }

  function updateFcArray(field: keyof FichaCientifica, value: string) {
    if (!selected) return;
    setSelected({
      ...selected,
      ficha_cientifica: {
        ...selected.ficha_cientifica,
        [field]: value.split('\n').map(s => s.trim()).filter(Boolean),
      },
    });
  }

  function updateFm(field: keyof FichaMistica, value: string) {
    if (!selected) return;
    setSelected({
      ...selected,
      ficha_mistica: { ...selected.ficha_mistica, [field]: value },
    });
  }

  const visible = plants.filter(p =>
    p.nombre_es.toLowerCase().includes(search.toLowerCase()) ||
    p.nombre_latino.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'var(--font-sans, sans-serif)', background: 'var(--bg-primary, #f7f4ee)' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '24px', zIndex: 999,
          background: 'var(--sage, #6B7C5E)', color: '#fff',
          padding: '12px 20px', borderRadius: '8px', fontSize: '13px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}>{toast}</div>
      )}

      {/* Lista */}
      <aside style={{ width: '280px', borderRight: '1px solid var(--border, #e0ddd5)', overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border, #e0ddd5)' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sage, #6B7C5E)', marginBottom: '8px' }}>Admin</p>
          <h1 style={{ fontFamily: 'var(--font-serif, serif)', fontWeight: 300, fontSize: '1.4rem', marginBottom: '12px' }}>Plantas</h1>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border, #e0ddd5)', borderRadius: '6px', fontSize: '13px', background: 'transparent', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        {loading && <p style={{ padding: '20px', color: 'var(--text-muted, #888)', fontSize: '13px' }}>Cargando…</p>}
        {visible.map(p => (
          <div
            key={p.id}
            onClick={() => setSelected(JSON.parse(JSON.stringify(p)))}
            style={{
              padding: '12px 20px',
              cursor: 'pointer',
              borderBottom: '1px solid var(--border, #e0ddd5)',
              background: selected?.id === p.id ? 'rgba(107,124,94,0.08)' : 'transparent',
              borderLeft: selected?.id === p.id ? '3px solid var(--sage, #6B7C5E)' : '3px solid transparent',
            }}
          >
            <p style={{ fontSize: '13px', fontWeight: 400, marginBottom: '2px' }}>{p.nombre_es}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted, #888)', fontStyle: 'italic' }}>{p.nombre_latino}</p>
          </div>
        ))}
      </aside>

      {/* Editor */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
        {!selected ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted, #888)', fontWeight: 300 }}>
            Selecciona una planta para editar
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
              <div>
                <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sage, #6B7C5E)', marginBottom: '6px' }}>
                  #{selected.id} · {selected.slug}
                </p>
                <h2 style={{ fontFamily: 'var(--font-serif, serif)', fontWeight: 300, fontSize: '1.8rem' }}>{selected.nombre_es}</h2>
              </div>
              <button
                onClick={save}
                disabled={saving}
                style={{ padding: '10px 28px', background: 'var(--sage, #6B7C5E)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>

            {/* Datos básicos */}
            <Section title="Datos básicos">
              <Field label="Nombre español">
                <input value={selected.nombre_es} onChange={e => setSelected({ ...selected, nombre_es: e.target.value })} style={inp} />
              </Field>
              <Field label="Nombre latino">
                <input value={selected.nombre_latino} onChange={e => setSelected({ ...selected, nombre_latino: e.target.value })} style={{ ...inp, fontStyle: 'italic' }} />
              </Field>
              <Field label="URL imagen científica">
                <input value={selected.image_cientifica_url ?? ''} onChange={e => setSelected({ ...selected, image_cientifica_url: e.target.value })} style={inp} />
              </Field>
            </Section>

            {/* Ficha científica */}
            <Section title="Ficha científica">
              <Field label="Familia botánica">
                <input value={selected.ficha_cientifica.familia_botanica ?? ''} onChange={e => updateFc('familia_botanica', e.target.value)} style={inp} />
              </Field>
              <Field label="Parte usada">
                <input value={selected.ficha_cientifica.parte_usada ?? ''} onChange={e => updateFc('parte_usada', e.target.value)} style={inp} />
              </Field>
              <Field label="Posología">
                <textarea value={selected.ficha_cientifica.posologia ?? ''} onChange={e => updateFc('posologia', e.target.value)} style={{ ...inp, height: '80px', resize: 'vertical' }} />
              </Field>
              <Field label="Evidencia">
                <textarea value={selected.ficha_cientifica.evidencia ?? ''} onChange={e => updateFc('evidencia', e.target.value)} style={{ ...inp, height: '80px', resize: 'vertical' }} />
              </Field>
              <Field label="Principios activos (uno por línea)">
                <textarea
                  value={(selected.ficha_cientifica.principios_activos ?? []).join('\n')}
                  onChange={e => updateFcArray('principios_activos', e.target.value)}
                  style={{ ...inp, height: '80px', resize: 'vertical' }}
                />
              </Field>
              <Field label="Propiedades (una por línea)">
                <textarea
                  value={(selected.ficha_cientifica.propiedades ?? []).join('\n')}
                  onChange={e => updateFcArray('propiedades', e.target.value)}
                  style={{ ...inp, height: '80px', resize: 'vertical' }}
                />
              </Field>
              <Field label="Indicaciones (una por línea)">
                <textarea
                  value={(selected.ficha_cientifica.indicaciones ?? []).join('\n')}
                  onChange={e => updateFcArray('indicaciones', e.target.value)}
                  style={{ ...inp, height: '80px', resize: 'vertical' }}
                />
              </Field>
              <Field label="Contraindicaciones (una por línea)">
                <textarea
                  value={(selected.ficha_cientifica.contraindicaciones ?? []).join('\n')}
                  onChange={e => updateFcArray('contraindicaciones', e.target.value)}
                  style={{ ...inp, height: '80px', resize: 'vertical' }}
                />
              </Field>
            </Section>

            {/* Ficha mística */}
            <Section title="Sabiduría ancestral">
              {(['elemento', 'planeta_regente', 'chakra', 'afinidad_ayurvedica'] as const).map(field => (
                <Field key={field} label={field.replace('_', ' ')}>
                  <input value={selected.ficha_mistica[field] ?? ''} onChange={e => updateFm(field, e.target.value)} style={inp} />
                </Field>
              ))}
              <Field label="Energía">
                <textarea value={selected.ficha_mistica.energia ?? ''} onChange={e => updateFm('energia', e.target.value)} style={{ ...inp, height: '80px', resize: 'vertical' }} />
              </Field>
              <Field label="Uso ceremonial">
                <textarea value={selected.ficha_mistica.uso_ceremonial ?? ''} onChange={e => updateFm('uso_ceremonial', e.target.value)} style={{ ...inp, height: '80px', resize: 'vertical' }} />
              </Field>
              <Field label="Simbolismo">
                <textarea value={selected.ficha_mistica.simbolismo ?? ''} onChange={e => updateFm('simbolismo', e.target.value)} style={{ ...inp, height: '80px', resize: 'vertical' }} />
              </Field>
            </Section>
          </>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sage, #6B7C5E)', marginBottom: '16px', fontWeight: 500 }}>{title}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: '11px', color: 'var(--text-muted, #888)', marginBottom: '6px', letterSpacing: '0.05em' }}>{label}</p>
      {children}
    </div>
  );
}

const inp: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid var(--border, #e0ddd5)',
  borderRadius: '6px',
  fontSize: '13px',
  background: '#fff',
  outline: 'none',
  fontFamily: 'inherit',
  color: 'var(--text-primary, #1a1a1a)',
  boxSizing: 'border-box',
};
