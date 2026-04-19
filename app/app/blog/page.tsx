import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { POSTS } from '@/lib/posts';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Blog — Nutrición KM0, Herbología & Bienestar',
  description: 'Artículos sobre nutrición de proximidad, herbología, depuración y bienestar holístico basados en ciencia y tradición.',
};

interface SupabasePost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  created_at: string;
}

async function getPublishedPosts(): Promise<SupabasePost[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/blog_posts?select=id,title,excerpt,slug,category,created_at&published=eq.true&order=created_at.desc`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
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
  return new Date(iso).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
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
          readingTime: '5 min',
        }))
      : POSTS;

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={`container ${styles.inner}`}>
          {/* Header */}
          <div className={styles.header}>
            <p className={styles.label}>Conocimiento libre</p>
            <h1 className={styles.title}>
              Aprende. Aplica. <em>Transforma.</em>
            </h1>
            <p className={styles.subtitle}>
              Artículos sobre nutrición km0, herbología y bienestar holístico —
              escritos por especialistas, basados en evidencia y adaptados a la vida real.
            </p>
          </div>

          {/* Posts grid */}
          <div className={styles.grid}>
            {posts.map((post) => (
              <article key={post.slug} className={styles.card}>
                <div className={styles.thumb}>
                  <LeafSVG />
                  <span className={styles.cat}>{post.cat}</span>
                </div>
                <div className={styles.body}>
                  <div className={styles.meta}>
                    <span>{post.date}</span>
                    <span className={styles.dot}>·</span>
                    <span>{post.readingTime} lectura</span>
                  </div>
                  <h2 className={styles.postTitle}>{post.title}</h2>
                  <p className={styles.excerpt}>{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`} className={styles.read}>
                    Leer artículo →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function LeafSVG() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden>
      <path d="M40 72V20" stroke="#6B7C5E" strokeWidth="1.4"/>
      <path d="M40 55C40 55 20 44 12 30" stroke="#A8B89A" strokeWidth="1"/>
      <path d="M40 55C40 55 60 44 68 30" stroke="#A8B89A" strokeWidth="1"/>
      <path d="M40 40C40 40 25 33 18 22" stroke="#A8B89A" strokeWidth=".7"/>
      <path d="M40 40C40 40 55 33 62 22" stroke="#A8B89A" strokeWidth=".7"/>
      <ellipse cx="40" cy="72" rx="10" ry="3.5" stroke="#6B7C5E" strokeWidth=".6"/>
    </svg>
  );
}
