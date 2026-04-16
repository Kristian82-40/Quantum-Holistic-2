import Link from 'next/link';
import { POSTS } from '@/lib/posts';
import styles from './BlogPreview.module.css';

export default function BlogPreview() {
  const preview = POSTS.slice(0, 3);

  return (
    <section className={`section ${styles.blog}`} id="blog">
      <div className="container">
        <p className={styles.label}>Conocimiento libre</p>
        <h2 className={styles.title}>
          Aprende. Aplica. <em>Transforma.</em>
        </h2>

        <div className={styles.grid}>
          {preview.map((post) => (
            <article key={post.slug} className={`${styles.card} reveal`}>
              <div className={styles.thumb}>
                <LeafSVG />
                <span className={styles.cat}>{post.cat}</span>
              </div>
              <div className={styles.body}>
                <h3 className={styles.postTitle}>{post.title}</h3>
                <p className={styles.excerpt}>{post.excerpt}</p>
                <div className={styles.footer}>
                  <span className={styles.date}>{post.date}</span>
                  <Link href={`/blog/${post.slug}`} className={styles.read}>
                    Leer →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.cta}>
          <Link href="/blog" className={styles.allLink}>
            Ver todos los artículos →
          </Link>
        </div>
      </div>
    </section>
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
