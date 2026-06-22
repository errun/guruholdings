import { notFound } from 'next/navigation';
import snapshot from '@/data-generated/snapshots/latest.json';
import { StockPage, getStockStaticParams } from '@/components/site-pages/StockPage';
import { getStockMetadata } from '@/lib/i18n/page-metadata';
import { isLocalizedLocale } from '@/lib/i18n/site';

export const generateStaticParams = getStockStaticParams;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; companyId: string }> }) {
  const { locale, companyId } = await params;
  if (!isLocalizedLocale(locale)) return {};
  return getStockMetadata(locale, companyId);
}

export default async function Page({ params }: { params: Promise<{ locale: string; companyId: string }> }) {
  const { locale, companyId } = await params;
  if (!isLocalizedLocale(locale)) notFound();
  const decodedCompanyId = decodeURIComponent(companyId);
  if (!snapshot.stocks.some((stock) => stock.companyId === decodedCompanyId)) notFound();
  return <StockPage companyId={companyId} locale={locale} />;
}
