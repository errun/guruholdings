'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { LanguageSelector } from './LanguageSelector';

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex min-w-0 items-center space-x-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">GH</span>
          </div>
          <span className="hidden truncate text-xl font-semibold sm:inline">{String(t('common.brand'))}</span>
        </Link>

        <nav className="flex shrink-0 items-center space-x-3 sm:space-x-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {String(t('common.navigation.home'))}
          </Link>
          <Link
            href="/live-13f"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            13F 数据
          </Link>
          <Link
            href="/data-automation-check"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline"
          >
            流程验证
          </Link>
          <LanguageSelector />
        </nav>
      </div>
    </header>
  );
}
