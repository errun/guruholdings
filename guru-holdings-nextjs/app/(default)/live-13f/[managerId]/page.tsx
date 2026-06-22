import { ManagerPage, getManagerStaticParams } from '@/components/site-pages/ManagerPage';
import { getManagerMetadata } from '@/lib/i18n/page-metadata';

export const generateStaticParams = getManagerStaticParams;

export async function generateMetadata({ params }: { params: Promise<{ managerId: string }> }) {
  const { managerId } = await params;
  return getManagerMetadata('en', managerId);
}

export default async function Page({ params }: { params: Promise<{ managerId: string }> }) {
  const { managerId } = await params;
  return <ManagerPage managerId={managerId} locale="en" />;
}
