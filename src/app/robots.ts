import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/data';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/terminal-x-92/', '/api/'] },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
