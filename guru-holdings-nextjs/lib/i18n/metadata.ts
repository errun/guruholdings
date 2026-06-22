import type { Metadata } from 'next';
import {
  hreflangTags,
  localizedPath,
  locales,
  type Locale,
  type MessageKey,
  translate,
} from './site';

export const SITE_URL = 'https://guruholdings.net';
export const SITE_NAME = 'Guru Holdings';

export type MetadataContent = {
  titleKey: MessageKey;
  descriptionKey: MessageKey;
  titleValues?: Record<string, string | number>;
  descriptionValues?: Record<string, string | number>;
  path: string;
  index?: boolean;
  keywords?: string[];
};

export function absoluteUrl(path: string): string {
  const url = new URL(path, SITE_URL).toString();
  return url === `${SITE_URL}/` ? SITE_URL : url;
}

export function languageAlternates(path: string): Record<string, string> {
  const alternates = Object.fromEntries(
    locales.map((locale) => [hreflangTags[locale], absoluteUrl(localizedPath(locale, path))]),
  );

  return {
    ...alternates,
    'x-default': absoluteUrl(localizedPath('en', path)),
  };
}

export function buildMetadata(locale: Locale, content: MetadataContent): Metadata {
  const title = translate(locale, content.titleKey, content.titleValues);
  const description = translate(locale, content.descriptionKey, content.descriptionValues);
  const canonicalPath = localizedPath(locale, content.path);
  const shouldIndex = content.index !== false;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords: content.keywords,
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates(content.path),
    },
    robots: {
      index: shouldIndex,
      follow: shouldIndex,
      googleBot: {
        index: shouldIndex,
        follow: shouldIndex,
      },
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url: canonicalPath,
      locale: locale === 'zh' ? 'zh_CN' : locale === 'ja' ? 'ja_JP' : locale === 'ko' ? 'ko_KR' : 'en_US',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}
