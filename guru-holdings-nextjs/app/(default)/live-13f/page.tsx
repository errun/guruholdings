import { permanentRedirect } from 'next/navigation';
import { Live13FPage } from '@/components/site-pages/Live13FPage';
import {
  legacyConsensusRedirect,
  normalizeConsensusPage,
  normalizeConsensusView,
} from '@/lib/consensus-view';
import { getLive13FMetadata } from '@/lib/i18n/page-metadata';
import { normalizeSignalMode } from '@/lib/signals';

export const metadata = getLive13FMetadata('en');

type SearchParams = Record<string, string | string[] | undefined>;

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export default async function Page({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const resolvedSearchParams = await searchParams;
  const legacyRedirect = legacyConsensusRedirect('/live-13f', resolvedSearchParams);
  if (legacyRedirect) permanentRedirect(legacyRedirect);
  return (
    <Live13FPage
      locale="en"
      consensusView={normalizeConsensusView(resolvedSearchParams?.view)}
      consensusPage={normalizeConsensusPage(resolvedSearchParams?.page)}
      signalMode={normalizeSignalMode(resolvedSearchParams?.signal)}
      initialQuery={readParam(resolvedSearchParams?.q)}
    />
  );
}
