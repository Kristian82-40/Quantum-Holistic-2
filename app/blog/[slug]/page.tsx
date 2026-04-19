import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getPostBySlug, POSTS } from '@/lib/posts';

interface SupabasePost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  category: string;
  image_url: string | null;
  created_at: string;
}

async function getSupabasePost(slug: string): Promise<SupabasePost | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  try {
    const res = await fetch(
      `${url}/rest/v1/blog_posts?select=*&slug=eq.${encodeURIComponent(slug)}&published=eq.true&limit=1`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data[0] ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supaPost = await getSupabasePost(params.slug);
  if (supaPost) {
    return { title: `${supaPost.title} | Quantum Holistic`, description: supaPost.excerpt };
  }
  const staticPost = getPostBySlug(params.slug);
  if (staticPost) {
    return { title: `${staticPost.title} | Quantum Holistic`, description: staticPost.excerpt };
  }
  return { title: 'Artículo no encontrado' };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const supaPost = await getSupabasePost(params.slug);
  const staticPost = getPostBySlug(params.slug);

  if (!supaPost && !staticPost) notFound();

  const title = supaPost?.title ?? staticPost!.title;
  const excerpt = supaPost?.excerpt ?? staticPost!.excerpt;
  const content = supaPost?.content ?? staticPost!.content;
  const category = supaPost?.category ?? staticPost!.cat;
  const date = supaPost ? formatDate(supaPost.created_at) : staticPost!.date;
  const image = supaPost?.image_url ?? null;

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '120px' }}>
        <article style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px 80px' }}>
          {/* Breadcrumb */}
          <p style={{ marginBottom: '40px' }}>
            <a
              href="/blog"
              style={{ color: 'var(--sage)', fontSize: '13px', textDecoration: 'none' }}
            >
              ← Blog
            </a>
          </p>

          {/* Header */}
          <span
            style={{
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--sage)',
              fontWeight: 500,
            }}
          >
            {category}
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 300,
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              lineHeight: 1.2,
              margin: '16px 0 20px',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              color: 'var(--text-muted)',
              fontWeight: 300,
              fontSize: '1.05rem',
              marginBottom: '12px',
              lineHeight: 1.6,
            }}
          >
            {excerpt}
          </p>
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              opacity: 0.6,
              marginBottom: '48px',
            }}
          >
            {date}
          </p>

          {/* Imagen */}
          {image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={image}
              alt={title}
              style={{
                width: '100%',
                borderRadius: '12px',
                marginBottom: '48px',
                maxHeight: '420px',
                objectFit: 'cover',
              }}
            />
          )}

          {/* Contenido */}
          <div
            style={{
              fontWeight: 300,
              lineHeight: 1.8,
              fontSize: '1rem',
              color: 'var(--text)',
            }}
            dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
          />
        </article>
      </main>
      <Footer />
    </>
  );
}

export async function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}
