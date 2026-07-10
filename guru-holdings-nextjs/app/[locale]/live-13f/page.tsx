import { notFound, permanentRedirect } from 'next/navigation';
import { Live13FPage } from '@/components/site-pages/Live13FPage';
import {
  legacyConsensusRedirect,
  normalizeConsensusPage,
  normalizeConsensusView,
} from '@/lib/consensus-view';
import { getLive13FMetadata } from '@/lib/i18n/page-metadata';
import { isLocalizedLocale, localizedPath } from '@/lib/i18n/site';
import { normalizeSignalMode } from '@/lib/signals';

type SearchParams = Record<string, string | string[] | undefined>;

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocalizedLocale(locale)) return {};
  return getLive13FMetadata(locale);
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<SearchParams>;
}) {
  const { locale } = await params;
  if (!isLocalizedLocale(locale)) notFound();
  const resolvedSearchParams = await searchParams;
  const legacyRedirect = legacyConsensusRedirect(
    localizedPath(locale, '/live-13f'),
    resolvedSearchParams,
  );
  if (legacyRedirect) permanentRedirect(legacyRedirect);
  return (
    <Live13FPage
      locale={locale}
      consensusView={normalizeConsensusView(resolvedSearchParams?.view)}
      consensusPage={normalizeConsensusPage(resolvedSearchParams?.page)}
      signalMode={normalizeSignalMode(resolvedSearchParams?.signal)}
      initialQuery={readParam(resolvedSearchParams?.q)}
    />
  );
}
