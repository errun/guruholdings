import { StockPage, getStockStaticParams } from '@/components/site-pages/StockPage';
import { getStockMetadata } from '@/lib/i18n/page-metadata';

export const generateStaticParams = getStockStaticParams;

export async function generateMetadata({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  return getStockMetadata('en', companyId);
}

export default async function Page({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const decodedCompanyId = decodeURIComponent(companyId);
  if (!snapshot.stocks.some((stock) => stock.companyId === decodedCompanyId)) notFound();
  return <StockPage companyId={companyId} locale="en" />;
}
import { notFound } from 'next/navigation';
import snapshot from '@/data-generated/snapshots/latest.json';
