'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { LanguageSelector } from './LanguageSelector';

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">GH</span>
          </div>
          <span className="text-xl font-semibold">{String(t('common.brand'))}</span>
        </Link>

        <nav className="flex items-center space-x-4 sm:space-x-8">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {String(t('common.navigation.home'))}
          </Link>
          <Link
            href="/#subscribe"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {String(t('common.navigation.subscribe'))}
          </Link>
          <LanguageSelector />
        </nav>
      </div>
    </header>
  );
}

