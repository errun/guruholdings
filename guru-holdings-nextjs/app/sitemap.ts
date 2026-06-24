import type { MetadataRoute } from 'next';
import snapshot from '@/data-generated/snapshots/latest.json';
import { absoluteUrl, languageAlternates } from '@/lib/i18n/metadata';
import { localizedPath, locales } from '@/lib/i18n/site';
import { stockPath } from '@/lib/stock-routes';

const canonicalPaths = [
  '/',
  '/live-13f',
  ...snapshot.managers.map((manager) => `/live-13f/${encodeURIComponent(manager.id)}`),
  ...snapshot.stocks.map((stock) => stockPath(stock.companyId)),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(snapshot.generatedAt);

  return canonicalPaths.flatMap((path) =>
    locales.map((locale) => ({
      url: absoluteUrl(localizedPath(locale, path)),
      lastModified,
      changeFrequency: path === '/' ? 'weekly' as const : 'monthly' as const,
      priority: path === '/' ? 1 : path === '/live-13f' ? 0.9 : 0.7,
      alternates: {
        languages: languageAlternates(path),
      },
    })),
  );
}
