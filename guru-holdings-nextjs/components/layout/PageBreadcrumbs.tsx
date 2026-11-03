import Link from 'next/link';
import { absoluteUrl } from '@/lib/i18n/metadata';
import { localizedPath, translate, type Locale } from '@/lib/i18n/site';
import { breadcrumbData, safeJsonLd } from '@/lib/seo-identity';
export function PageBreadcrumbs({ locale, current, path, inSignals = false }: { locale: Locale; current: string; path: string; inSignals?: boolean }) {
  const items = [{ name: translate(locale, 'nav.home'), path: '/' },
    ...(inSignals ? [{ name: translate(locale, 'nav.data'), path: '/live-13f' }] : []), { name: current, path }];
  const data = breadcrumbData(items.map(item => ({ name: item.name, url: absoluteUrl(localizedPath(locale, item.path)) })));
  return <>
    <nav aria-label={translate(locale, 'nav.breadcrumb')} className="mb-4 text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">{items.map((item, index) => <li key={item.path} className="inline-flex items-center gap-2">
        {index > 0 ? <span aria-hidden="true">/</span> : null}
        {index === items.length - 1 ? <span aria-current="page">{item.name}</span>
          : <Link href={localizedPath(locale, item.path)} className="hover:text-foreground hover:underline">{item.name}</Link>}
      </li>)}</ol>
    </nav>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  </>;
}
