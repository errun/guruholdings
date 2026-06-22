import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import { localizedPath, translate, type Locale } from '@/lib/i18n/site';
import { LanguageSelector } from './LanguageSelector';

export function Header({ locale }: { locale: Locale }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-background/92 backdrop-blur supports-[backdrop-filter]:bg-background/78">
      <div className="container flex h-16 items-center justify-between gap-3">
        <Link href={localizedPath(locale, '/')} className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BarChart3 className="h-4 w-4" />
          </span>
          <span className="hidden truncate text-lg font-semibold text-slate-950 sm:inline">
            {translate(locale, 'brand.name')}
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-3 sm:gap-5" aria-label="Primary">
          <Link href={localizedPath(locale, '/')} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {translate(locale, 'nav.home')}
          </Link>
          <Link href={localizedPath(locale, '/live-13f')} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {translate(locale, 'nav.data')}
          </Link>
          <LanguageSelector locale={locale} />
        </nav>
      </div>
    </header>
  );
}
