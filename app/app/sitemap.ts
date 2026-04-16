import { MetadataRoute } from 'next';
import { POSTS } from '@/lib/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://quantumholistic.com';
  const now  = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                       lastModified: now, changeFrequency: 'weekly',  priority: 1   },
    { url: `${base}/blog`,             lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/privacidad`,       lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/terminos`,         lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/cookies`,          lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = POSTS.map((post) => ({
    url:             `${base}/blog/${post.slug}`,
    lastModified:    now,
    changeFrequency: 'monthly' as const,
    priority:        0.7,
  }));

  return [...staticRoutes, ...blogRoutes];
}
