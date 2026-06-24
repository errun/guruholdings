import { notFound, permanentRedirect } from 'next/navigation';
import { StockPage, getStockStaticParams } from '@/components/site-pages/StockPage';
import { getStockMetadata } from '@/lib/i18n/page-metadata';
import { isLocalizedLocale } from '@/lib/i18n/site';
import { localizedPath } from '@/lib/i18n/site';
import { resolveStockRoute, stockPath, withSearchParams } from '@/lib/stock-routes';

export const generateStaticParams = getStockStaticParams;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; companyId: string }> }) {
  const { locale, companyId } = await params;
  if (!isLocalizedLocale(locale)) return {};
  return getStockMetadata(locale, companyId);
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; companyId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, companyId } = await params;
  if (!isLocalizedLocale(locale)) notFound();
  const route = resolveStockRoute(companyId);
  if (!route) notFound();
  if (!route.isCanonical) {
    const destination = localizedPath(locale, stockPath(route.companyId));
    permanentRedirect(withSearchParams(destination, await searchParams));
  }
  return <StockPage companyId={route.companyId} locale={locale} />;
}
