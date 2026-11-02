import type { ReactNode } from 'react';
import type { Locale } from '@/lib/i18n/site';
import { Footer } from './Footer';
import { Header } from './Header';
import { ResearchObserver } from './ResearchObserver';

export function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header locale={locale} />
      <main className="flex-1">{children}</main>
      <ResearchObserver />
      <Footer locale={locale} />
    </div>
  );
}
