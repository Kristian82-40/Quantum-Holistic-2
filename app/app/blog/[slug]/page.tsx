import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { POSTS, getPostBySlug } from '@/lib/posts';
import styles from './page.module.css';

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title:       post.title,
    description: post.excerpt,
    openGraph: {
      title:       post.title,
      description: post.excerpt,
      type:        'article',
    },
  };
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <article className={styles.article}>
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.meta}>
              <span className={styles.cat}>{post.cat}</span>
              <span className={styles.sep}>·</span>
              <span className={styles.date}>{post.date}</span>
              <span className={styles.sep}>·</span>
              <span className={styles.reading}>{post.readingTime} lectura</span>
            </div>
            <h1 className={styles.title}>{post.title}</h1>
            <p className={styles.excerpt}>{post.excerpt}</p>
          </header>

          {/* Divider */}
          <div className={styles.divider} aria-hidden />

          {/* Content */}
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Back */}
          <div className={styles.back}>
            <Link href="/blog">← Volver al blog</Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
