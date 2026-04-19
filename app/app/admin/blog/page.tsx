'use client';

import { useEffect, useState } from 'react';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  published: boolean;
  created_at: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'published' | 'all'>('pending');

  useEffect(() => {
    fetch('/api/admin/blog')
      .then((r) => r.json())
      .then((data) => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function action(id: string, published: boolean) {
    setActing(id);
    await fetch(`/api/admin/blog/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published }),
    });
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, published } : p))
    );
    setActing(null);
  }

  async function deletePost(id: string) {
    if (!confirm('¿Eliminar este post permanentemente?')) return;
    setActing(id);
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setActing(null);
  }

  const visible = posts.filter((p) => {
    if (filter === 'pending') return !p.published;
    if (filter === 'published') return p.published;
    return true;
  });

  const pending = posts.filter((p) => !p.published).length;

  return (
    <div style={{ padding: '40px 32px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'var(--font-sans, sans-serif)' }}>
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sage, #6B7C5E)', marginBottom: '8px' }}>
          Admin
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif, serif)', fontWeight: 300, fontSize: '2rem', marginBottom: '8px' }}>
          Panel de Blog
        </h1>
        <p style={{ color: 'var(--text-muted, #888)', fontWeight: 300 }}>
          {pending} post{pending !== 1 ? 's' : ''} pendiente{pending !== 1 ? 's' : ''} de revisión · {posts.length} total
        </p>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['pending', 'published', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: '1px solid var(--border, #333)',
              background: filter === f ? 'var(--sage, #6B7C5E)' : 'transparent',
              color: filter === f ? '#fff' : 'var(--text-muted, #888)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.05em',
            }}
          >
            {f === 'pending' ? 'Pendientes' : f === 'published' ? 'Publicados' : 'Todos'}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--text-muted, #888)' }}>Cargando posts…</p>}

      {!loading && visible.length === 0 && (
        <p style={{ color: 'var(--text-muted, #888)', fontWeight: 300 }}>
          No hay posts en esta categoría.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {visible.map((post) => (
          <div
            key={post.id}
            style={{
              border: '1px solid var(--border, #2a2a2a)',
              borderRadius: '10px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '20px',
              opacity: acting === post.id ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {/* Status dot */}
            <div style={{ paddingTop: '4px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: post.published ? '#4CAF50' : '#FF9800',
                flexShrink: 0,
              }} />
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: 'var(--sage, #6B7C5E)', fontWeight: 500,
                }}>
                  {post.category}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted, #888)' }}>
                  {new Date(post.created_at).toLocaleDateString('es-ES')}
                </span>
              </div>
              <h2 style={{ fontWeight: 400, fontSize: '0.95rem', marginBottom: '6px', lineHeight: 1.4 }}>
                {post.title}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #888)', fontWeight: 300, lineHeight: 1.5, margin: 0 }}>
                {post.excerpt?.slice(0, 140)}{post.excerpt?.length > 140 ? '…' : ''}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0, paddingTop: '2px' }}>
              {!post.published ? (
                <button
                  onClick={() => action(post.id, true)}
                  disabled={acting === post.id}
                  style={{
                    padding: '6px 14px', borderRadius: '6px', border: 'none',
                    background: 'var(--sage, #6B7C5E)', color: '#fff',
                    cursor: 'pointer', fontSize: '12px', fontWeight: 500,
                  }}
                >
                  Publicar
                </button>
              ) : (
                <button
                  onClick={() => action(post.id, false)}
                  disabled={acting === post.id}
                  style={{
                    padding: '6px 14px', borderRadius: '6px',
                    border: '1px solid var(--border, #333)', background: 'transparent',
                    color: 'var(--text-muted, #888)', cursor: 'pointer', fontSize: '12px',
                  }}
                >
                  Despublicar
                </button>
              )}
              <button
                onClick={() => deletePost(post.id)}
                disabled={acting === post.id}
                style={{
                  padding: '6px 10px', borderRadius: '6px',
                  border: '1px solid #c0392b33', background: 'transparent',
                  color: '#c0392b', cursor: 'pointer', fontSize: '12px',
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
