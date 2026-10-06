'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  id: string;
  title: string;
  excerpt: string;
  content: string;
}

export default function AdminPostControls({ id, title, excerpt, content }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title, excerpt, content });

  async function patch(body: Record<string, string>) {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      return true;
    } catch {
      setError('No se ha podido completar la acción.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (await patch(form)) {
      setEditing(false);
      router.refresh();
    }
  }

  async function unpublish() {
    if (await patch({ status: 'draft' })) router.push('/blog');
  }

  const btn = { padding: '6px 12px', border: '1px solid #c9bfa8', borderRadius: 6, background: '#fff', cursor: 'pointer' } as const;
  const field = { width: '100%', padding: 8, border: '1px solid #c9bfa8', borderRadius: 6, font: 'inherit' } as const;

  return (
    <div style={{ maxWidth: 760, margin: '16px auto', padding: 12, border: '1px dashed #c9bfa8', borderRadius: 8, background: '#faf6ec', fontSize: 14 }}>
      <div style={{ marginBottom: 8, color: '#7a6f58' }}>Solo tú ves esto (admin)</div>
      {editing ? (
        <div style={{ display: 'grid', gap: 8 }}>
          <input style={field} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} aria-label="Título" />
          <textarea style={field} rows={3} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} aria-label="Resumen" />
          <textarea style={field} rows={14} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} aria-label="Contenido" />
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={btn} disabled={busy} onClick={save}>Guardar</button>
            <button style={btn} disabled={busy} onClick={() => setEditing(false)}>Cancelar</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btn} disabled={busy} onClick={() => setEditing(true)}>✏️ Modificar</button>
          <button style={btn} disabled={busy} onClick={unpublish}>🙈 Despublicar</button>
        </div>
      )}
      {error && <div style={{ marginTop: 8, color: '#a33' }}>{error}</div>}
    </div>
  );
}
