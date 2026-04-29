import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { POSTS } from '@/lib/posts';
import BlogCard from './BlogCard';

export const metadata: Metadata = {
  title: 'Blog — Nutrición KM0, Herbología & Bienestar | Quantum Holistic',
  description:
    'Artículos sobre nutrición de proximidad, herbología, depuración y bienestar holístico basados en ciencia y tradición.',
};

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  image_url: string | null;
  created_at: string;
}

async function getPublishedPosts(): Promise<BlogPost[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return [];

  try {
    const res = await fetch(
      `${url}/rest/v1/blog_posts?select=id,title,excerpt,slug,category,image_url,created_at&published=eq.true&order=created_at.desc`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function BlogPage() {
  const supabasePosts = await getPublishedPosts();

  const posts =
    supabasePosts.length > 0
      ? supabasePosts.map((p) => ({
          slug: p.slug,
          cat: p.category,
          title: p.title,
          excerpt: p.excerpt,
          date: formatDate(p.created_at),
          image: p.image_url,
          fromSupabase: true,
        }))
      : POSTS.map((p) => ({
          slug: p.slug,
          cat: p.cat,
          title: p.title,
          excerpt: p.excerpt,
          date: p.date,
          image: null,
          fromSupabase: false,
        }));

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '120px', minHeight: '60vh' }}>
        <div className="container section">
          {/* Header */}
          <p
            style={{
              fontSize: '10px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'var(--sage)',
              marginBottom: '18px',
            }}
          >
            Blog
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 300,
              marginBottom: '12px',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            }}
          >
            Sabiduría holística
          </h1>
          <p
            style={{
              color: 'var(--text-muted)',
              maxWidth: '520px',
              fontWeight: 300,
              marginBottom: '64px',
            }}
          >
            Nutrición km0, herbología, bienestar y medicina tradicional.
            Conocimiento práctico para vivir en equilibrio.
          </p>

          {/* Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '32px',
            }}
          >
            {posts.map((post) => (
              <BlogCard key={post.slug} {...post} />
            ))}
          </div>

          {posts.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontWeight: 300 }}>
              Próximamente — estamos preparando contenido de alta calidad.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
