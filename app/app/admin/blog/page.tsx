'use client';

import { useEffect, useState } from 'react';

type PostStatus = 'draft' | 'published' | 'rejected';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  status: PostStatus;
  created_at: string;
}

const STATUS_COLOR: Record<PostStatus, string> = {
  draft: '#FF9800',
  published: '#4CAF50',
  rejected: '#c0392b',
};

const STATUS_LABEL: Record<PostStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  rejected: 'Rechazado',
};

type FilterType = 'draft' | 'published' | 'all';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('draft');

  useEffect(() => {
    fetch('/api/admin/blog')
      .then((r) => r.json())
      .then((data) => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: PostStatus) {
    setActing(id);
    await fetch(`/api/admin/blog/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
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
    if (filter === 'draft') return p.status === 'draft';
    if (filter === 'published') return p.status === 'published';
    return true;
  });

  const draftCount = posts.filter((p) => p.status === 'draft').length;

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
          {draftCount} post{draftCount !== 1 ? 's' : ''} pendiente{draftCount !== 1 ? 's' : ''} de revisión · {posts.length} total
        </p>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['draft', 'published', 'all'] as const).map((f) => (
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
            {f === 'draft' ? 'Pendientes' : f === 'published' ? 'Publicados' : 'Todos'}
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
                background: STATUS_COLOR[post.status] ?? '#888',
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
                <span style={{
                  fontSize: '10px', color: STATUS_COLOR[post.status],
                  fontWeight: 500, letterSpacing: '0.05em',
                }}>
                  {STATUS_LABEL[post.status]}
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
              {post.status !== 'published' && (
                <button
                  onClick={() => updateStatus(post.id, 'published')}
                  disabled={acting === post.id}
                  style={{
                    padding: '6px 14px', borderRadius: '6px', border: 'none',
                    background: 'var(--sage, #6B7C5E)', color: '#fff',
                    cursor: 'pointer', fontSize: '12px', fontWeight: 500,
                  }}
                >
                  Publicar
                </button>
              )}
              {post.status === 'published' && (
                <button
                  onClick={() => updateStatus(post.id, 'draft')}
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
              {post.status !== 'rejected' && (
                <button
                  onClick={() => updateStatus(post.id, 'rejected')}
                  disabled={acting === post.id}
                  style={{
                    padding: '6px 10px', borderRadius: '6px',
                    border: '1px solid #c0392b55', background: 'transparent',
                    color: '#c0392b', cursor: 'pointer', fontSize: '12px',
                  }}
                >
                  Rechazar
                </button>
              )}
              <button
                onClick={() => deletePost(post.id)}
                disabled={acting === post.id}
                style={{
                  padding: '6px 10px', borderRadius: '6px',
                  border: '1px solid var(--border, #333)', background: 'transparent',
                  color: 'var(--text-muted, #555)', cursor: 'pointer', fontSize: '12px',
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
