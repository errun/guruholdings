import { getMarketDataSymbol } from '@/lib/stock-profiles';

export type CompanyMarketCap =
  | {
      status: 'available';
      symbol: string;
      value: number;
      currency: 'USD';
      sourceName: 'Nasdaq';
      sourceUrl: string;
      retrievedAt: string;
    }
  | {
      status: 'unavailable';
      symbol: string | null;
      reason: 'no_symbol' | 'fetch_failed' | 'missing_market_cap';
    };

const nasdaqHeaders = {
  Accept: 'application/json',
  Origin: 'https://www.nasdaq.com',
  Referer: 'https://www.nasdaq.com/',
  'User-Agent': 'Mozilla/5.0',
};

function parseNasdaqNumber(value: unknown) {
  if (typeof value !== 'string') return null;
  const parsed = Number(value.replace(/[$,\s]/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function getCompanyMarketCap(companyId: string): Promise<CompanyMarketCap> {
  const symbol = getMarketDataSymbol(companyId);
  if (!symbol) return { status: 'unavailable', symbol: null, reason: 'no_symbol' };

  try {
    const response = await fetch(`https://api.nasdaq.com/api/quote/${encodeURIComponent(symbol)}/summary?assetclass=stocks`, {
      headers: nasdaqHeaders,
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!response.ok) return { status: 'unavailable', symbol, reason: 'fetch_failed' };

    const body = await response.json();
    const marketCap = parseNasdaqNumber(body?.data?.summaryData?.MarketCap?.value);
    if (!marketCap) return { status: 'unavailable', symbol, reason: 'missing_market_cap' };

    return {
      status: 'available',
      symbol,
      value: marketCap,
      currency: 'USD',
      sourceName: 'Nasdaq',
      sourceUrl: `https://www.nasdaq.com/market-activity/stocks/${symbol.toLowerCase()}`,
      retrievedAt: new Date().toISOString(),
    };
  } catch {
    return { status: 'unavailable', symbol, reason: 'fetch_failed' };
  }
}

export async function getCompanyMarketCaps(companyIds: string[]) {
  const uniqueIds = [...new Set(companyIds)];
  const entries = await Promise.all(uniqueIds.map(async (companyId) => [companyId, await getCompanyMarketCap(companyId)] as const));
  return new Map(entries);
}
