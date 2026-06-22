import { notFound } from 'next/navigation';
import { Live13FPage } from '@/components/site-pages/Live13FPage';
import { getLive13FMetadata } from '@/lib/i18n/page-metadata';
import { isLocalizedLocale } from '@/lib/i18n/site';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocalizedLocale(locale)) return {};
  return getLive13FMetadata(locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocalizedLocale(locale)) notFound();
  return <Live13FPage locale={locale} />;
}
