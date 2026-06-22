import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import '../globals.css';
import { fontVariables } from '@/components/layout/fonts';
import { SiteShell, Analytics } from '@/components/layout';
import { SITE_URL } from '@/lib/i18n/metadata';
import {
  isLocalizedLocale,
  localeTags,
  localizedLocales,
} from '@/lib/i18n/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: { icon: '/favicon.svg' },
};

export function generateStaticParams() {
  return localizedLocales.map((locale) => ({ locale }));
}

export default async function LocalizedRootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocalizedLocale(locale)) notFound();

  return (
    <html lang={localeTags[locale]}>
      <head>
        <Analytics />
      </head>
      <body className={`${fontVariables} min-h-screen bg-background font-sans antialiased`}>
        <SiteShell locale={locale}>{children}</SiteShell>
      </body>
    </html>
  );
}
