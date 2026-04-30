import { MetadataRoute } from 'next';
import { POSTS } from '@/lib/posts';

const BASE = 'https://quantumholistic.com';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getPlantSlugs(): Promise<string[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/plants?select=slug&order=id.asc`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json() as { slug: string }[];
    return data.map(p => p.slug);
  } catch { return []; }
}

async function getBlogSlugs(): Promise<string[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?select=slug&status=eq.published&order=created_at.desc`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json() as { slug: string }[];
    return data.map(p => p.slug);
  } catch { return []; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                         lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/blog`,               lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/plantas`,            lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/recomendador`,       lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/privacidad`,         lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terminos`,           lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/cookies`,            lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const [plantSlugs, supabaseBlogSlugs] = await Promise.all([getPlantSlugs(), getBlogSlugs()]);

  const plantRoutes: MetadataRoute.Sitemap = plantSlugs.map(slug => ({
    url: `${BASE}/plantas/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const localBlogRoutes: MetadataRoute.Sitemap = POSTS.map(post => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const supaBlogRoutes: MetadataRoute.Sitemap = supabaseBlogSlugs
    .filter(slug => !POSTS.find(p => p.slug === slug))
    .map(slug => ({
      url: `${BASE}/blog/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  return [...staticRoutes, ...plantRoutes, ...localBlogRoutes, ...supaBlogRoutes];
}
