import { notFound } from 'next/navigation';
import { ManagerPage, getManagerStaticParams } from '@/components/site-pages/ManagerPage';
import { getManagerMetadata } from '@/lib/i18n/page-metadata';
import { isLocalizedLocale } from '@/lib/i18n/site';

export const generateStaticParams = getManagerStaticParams;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; managerId: string }> }) {
  const { locale, managerId } = await params;
  if (!isLocalizedLocale(locale)) return {};
  return getManagerMetadata(locale, managerId);
}

export default async function Page({ params }: { params: Promise<{ locale: string; managerId: string }> }) {
  const { locale, managerId } = await params;
  if (!isLocalizedLocale(locale)) notFound();
  return <ManagerPage managerId={managerId} locale={locale} />;
}
