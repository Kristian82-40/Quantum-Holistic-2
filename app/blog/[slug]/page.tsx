import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminPostControls from '@/components/ui/AdminPostControls';
import { requireAdmin } from '@/lib/require-admin';
import CuentaScrollModal from '@/components/ui/CuentaScrollModal';
import { getPostBySlug, cleanPostTitle } from '@/lib/posts';
import styles from './page.module.css';

const SITE_URL = 'https://quantum-holistic.com';

interface SupabasePost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  category: string;
  created_at: string;
  image_url?: string;
}

async function getSupabasePost(slug: string): Promise<SupabasePost | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/blog_posts?select=*&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const post = data[0] ?? null;
    return post ? { ...post, title: cleanPostTitle(post.title) } : null;
  } catch {
    return null;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const supa = await getSupabasePost(slug);
  const post = supa ?? getPostBySlug(slug);
  if (!post) return {};
  const canonical = `/blog/${slug}`;
  // Local image_url paths often point to files never uploaded to public/; only
  // trust absolute URLs (Pollinations-generated), otherwise fall back to the
  // site default so og:image never 404s.
  const imageUrl = (post as SupabasePost).image_url;
  const ogImage = imageUrl?.startsWith('http') ? imageUrl : '/images/og-default.jpg';
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical },
    openGraph: { title: post.title, description: post.excerpt, url: canonical, type: 'article', images: [ogImage] },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt, images: [ogImage] },
  };
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supaPost = await getSupabasePost(slug);
  const staticPost = getPostBySlug(slug);

  if (!supaPost && !staticPost) notFound();

  const title    = supaPost?.title    ?? staticPost!.title;
  const excerpt  = supaPost?.excerpt  ?? staticPost!.excerpt;
  const content  = supaPost?.content  ?? staticPost!.content;
  const cat      = supaPost?.category ?? staticPost!.cat;
  const date     = supaPost ? formatDate(supaPost.created_at) : staticPost!.date;
  const readTime = staticPost?.readingTime ?? '5 min';
  const isAdmin = supaPost ? Boolean(await requireAdmin().catch(() => null)) : false;

  // Datos estructurados Article (SEO). "<" escapado para que el texto del post no pueda cerrar el <script>.
  const imagen = supaPost?.image_url?.startsWith('http') ? supaPost.image_url : `${SITE_URL}/images/og-default.jpg`;
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title.slice(0, 110),
    description: excerpt,
    image: [imagen],
    ...(supaPost ? { datePublished: supaPost.created_at } : {}),
    inLanguage: 'es',
    mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
    author: { '@type': 'Organization', name: 'Quantum Holistic', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'Quantum Holistic', url: SITE_URL },
  }).replace(/</g, '\\u003c');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <Navbar />
      <main className={styles.main}>
        {supaPost && isAdmin && (
          <AdminPostControls id={supaPost.id} title={title} excerpt={excerpt} content={content} />
        )}
        <article className={styles.article}>
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.meta}>
              <span className={styles.cat}>{cat}</span>
              <span className={styles.sep}>·</span>
              <span className={styles.date}>{date}</span>
              <span className={styles.sep}>·</span>
              <span className={styles.reading}>{readTime} lectura</span>
            </div>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.excerpt}>{excerpt}</p>
          </header>

          {/* Divider */}
          <div className={styles.divider} aria-hidden />

          {/* Content */}
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
          />

          {/* Back */}
          <div className={styles.back}>
            <Link href="/blog">← Volver al blog</Link>
          </div>
        </article>
      </main>
      <Footer />
      <CuentaScrollModal />
    </>
  );
}
