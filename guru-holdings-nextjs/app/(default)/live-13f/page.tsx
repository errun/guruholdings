import { Live13FPage } from '@/components/site-pages/Live13FPage';
import { getLive13FMetadata } from '@/lib/i18n/page-metadata';
import { normalizeSignalMode } from '@/lib/signals';

export const metadata = getLive13FMetadata('en');

type SearchParams = Record<string, string | string[] | undefined>;

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export default async function Page({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const resolvedSearchParams = await searchParams;
  return (
    <Live13FPage
      locale="en"
      signalMode={normalizeSignalMode(resolvedSearchParams?.signal)}
      initialQuery={readParam(resolvedSearchParams?.q)}
    />
  );
}
