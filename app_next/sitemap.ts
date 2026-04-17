import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://quantumholistic.com';
  return [
    { url: base,              lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: `${base}/about`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/blog`,    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
  ];
}
