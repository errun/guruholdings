import type { Metadata } from 'next';
import '../globals.css';
import { fontVariables } from '@/components/layout/fonts';
import { SiteShell, Analytics } from '@/components/layout';
import { SITE_URL } from '@/lib/i18n/metadata';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: { icon: '/favicon.svg' },
};

export default function EnglishRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <Analytics />
      </head>
      <body className={`${fontVariables} min-h-screen bg-background font-sans antialiased`}>
        <SiteShell locale="en">{children}</SiteShell>
      </body>
    </html>
  );
}
