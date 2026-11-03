import { Fragment, Suspense, type ReactNode } from 'react';
import type { Locale } from '@/lib/i18n/site';
import { Footer } from './Footer';
import { Header } from './Header';
import { ResearchObserver } from './ResearchObserver';

export function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header locale={locale} />
      <main className="flex-1">
        {/* Keep a keyed child fiber between the host and lazy Flight content.
            Unlike a page-wide Suspense boundary, this preserves HTTP redirects
            and 404s while preventing the host's hydration cursor from replaying. */}
        <Fragment key="page-content">
          {children}
        </Fragment>
      </main>
      <Suspense fallback={null}><ResearchObserver /></Suspense>
      <Footer locale={locale} />
    </div>
  );
}
