'use client';

import { useParams } from 'next/navigation';
import { NotFoundState } from '@/components/layout/NotFoundState';
import { isLocalizedLocale } from '@/lib/i18n/site';

export default function NotFound() {
  const { locale: segment } = useParams<{ locale?: string }>();
  const locale = segment && isLocalizedLocale(segment) ? segment : 'zh';
  return <NotFoundState locale={locale} />;
}
