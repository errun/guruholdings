import type { ReactNode } from 'react';
import type { Locale } from '@/lib/i18n/site';
import { Footer } from './Footer';
import { Header } from './Header';

export function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header locale={locale} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
