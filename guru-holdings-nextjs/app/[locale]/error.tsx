'use client';

import { usePathname } from 'next/navigation';
import { ErrorState } from '@/components/layout/ErrorState';
import { isLocalizedLocale } from '@/lib/i18n/site';

export default function ErrorPage({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const segment = usePathname().split('/')[1];
  const locale = isLocalizedLocale(segment) ? segment : 'zh';
  return <ErrorState locale={locale} error={error} reset={reset} />;
}
