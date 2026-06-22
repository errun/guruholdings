import { HomePage } from '@/components/site-pages/HomePage';
import { getHomeMetadata } from '@/lib/i18n/page-metadata';
import { isLocalizedLocale } from '@/lib/i18n/site';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocalizedLocale(locale)) return {};
  return getHomeMetadata(locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocalizedLocale(locale)) notFound();
  return <HomePage locale={locale} />;
}
