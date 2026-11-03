import { Suspense, type ReactNode } from 'react';
import type { Locale } from '@/lib/i18n/site';
import { translate } from '@/lib/i18n/site';
import { Footer } from './Footer';
import { Header } from './Header';
import { ResearchObserver } from './ResearchObserver';

export function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header locale={locale} />
      <main className="flex-1">
        {/* Flight children can resolve while hydration yields. The boundary keeps
            the host <main> from being reclaimed with its cursor already inside. */}
        <Suspense fallback={<div role="status" className="container py-12 text-sm text-muted-foreground">{translate(locale, 'common.loading')}</div>}>
          {children}
        </Suspense>
      </main>
      <Suspense fallback={null}><ResearchObserver /></Suspense>
      <Footer locale={locale} />
    </div>
  );
}
