import { notFound } from 'next/navigation';
import { MethodologyPage } from '@/components/site-pages/MethodologyPage';
import { getMethodologyMetadata } from '@/lib/i18n/page-metadata';
import { isLocalizedLocale } from '@/lib/i18n/site';
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return isLocalizedLocale(locale) ? getMethodologyMetadata(locale) : {};
}
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocalizedLocale(locale)) notFound();
  return <MethodologyPage locale={locale} />;
}
