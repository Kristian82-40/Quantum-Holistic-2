'use client';

import Link from 'next/link';

interface BlogCardProps {
  slug: string;
  cat: string;
  title: string;
  excerpt: string;
  date: string;
  image: string | null;
}

export default function BlogCard({ slug, cat, title, excerpt, date, image }: BlogCardProps) {
  return (
    <Link href={`/blog/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <article
        style={{
          border: '1px solid var(--border)',
          borderRadius: '12px',
          overflow: 'hidden',
          transition: 'border-color 0.2s, transform 0.2s',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--sage)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        }}
      >
        {image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={image}
            alt={title}
            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
          />
        )}
        <div style={{ padding: '24px' }}>
          <span
            style={{
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--sage)',
              fontWeight: 500,
            }}
          >
            {cat}
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 300,
              fontSize: '1.25rem',
              margin: '10px 0 12px',
              lineHeight: 1.3,
            }}
          >
            {title}
          </h2>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              fontWeight: 300,
              marginBottom: '16px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {excerpt}
          </p>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', opacity: 0.7 }}>
            {date}
          </span>
        </div>
      </article>
    </Link>
  );
}
