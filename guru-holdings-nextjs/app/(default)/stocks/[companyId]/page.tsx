import { StockPage, getStockStaticParams } from '@/components/site-pages/StockPage';
import { getStockMetadata } from '@/lib/i18n/page-metadata';
import { permanentRedirect, notFound } from 'next/navigation';
import { resolveStockRoute, stockPath, withSearchParams } from '@/lib/stock-routes';

export const generateStaticParams = getStockStaticParams;

export async function generateMetadata({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  return getStockMetadata('en', companyId);
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ companyId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { companyId } = await params;
  const route = resolveStockRoute(companyId);
  if (!route) notFound();
  if (!route.isCanonical) permanentRedirect(withSearchParams(stockPath(route.companyId), await searchParams));
  return <StockPage companyId={route.companyId} locale="en" />;
}
