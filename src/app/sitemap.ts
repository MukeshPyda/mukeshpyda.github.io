import type { MetadataRoute } from 'next';
import { getBlogs } from './intelligence/posts';
import { siteConfig } from '@/lib/data';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${siteConfig.url}${path}`;
  return [
    { url: url('/'), changeFrequency: 'monthly', priority: 1 },
    { url: url('/intelligence/'), changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/courses/'), changeFrequency: 'weekly', priority: 0.8 },
    ...getBlogs().map((blog) => ({
      url: url(`/intelligence/${blog.slug}/`),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
