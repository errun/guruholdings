import { getMarketDataSymbol } from '@/lib/stock-profiles';

type PricePoint = {
  low: number;
  high: number;
  close: number;
};

export type TradePriceEstimate =
  | {
      status: 'available';
      symbol: string;
      quarter: string;
      low: number;
      high: number;
      referencePrice: number;
      sourceName: 'Yahoo Finance';
      sourceUrl: string;
      retrievedAt: string;
    }
  | {
      status: 'unavailable';
      symbol: string | null;
      quarter: string;
      reason: 'no_symbol' | 'invalid_quarter' | 'fetch_failed' | 'missing_prices';
    };

function parseQuarter(value: string) {
  const match = /^(\d{4})Q([1-4])$/.exec(value);
  if (!match) return null;
  return { year: Number(match[1]), quarter: Number(match[2]) };
}

function getQuarterRange(value: string) {
  const parsed = parseQuarter(value);
  if (!parsed) return null;
  const start = new Date(Date.UTC(parsed.year, (parsed.quarter - 1) * 3, 1));
  const endExclusive = new Date(Date.UTC(parsed.year, parsed.quarter * 3, 1));
  return {
    period1: Math.floor(start.getTime() / 1000),
    period2: Math.floor(endExclusive.getTime() / 1000),
  };
}

function parseYahooPoints(body: any): PricePoint[] {
  const result = body?.chart?.result?.[0];
  const quote = result?.indicators?.quote?.[0];
  if (!quote) return [];

  const lows = quote.low || [];
  const highs = quote.high || [];
  const closes = quote.close || [];
  return lows.map((low: unknown, index: number) => ({
    low: Number(low),
    high: Number(highs[index]),
    close: Number(closes[index]),
  })).filter((point: PricePoint) =>
    Number.isFinite(point.low)
    && Number.isFinite(point.high)
    && Number.isFinite(point.close)
    && point.low > 0
    && point.high > 0
    && point.close > 0
  );
}

export async function getTradePriceEstimate(companyId: string, quarter: string): Promise<TradePriceEstimate> {
  const symbol = getMarketDataSymbol(companyId);
  if (!symbol) return { status: 'unavailable', symbol: null, quarter, reason: 'no_symbol' };

  const range = getQuarterRange(quarter);
  if (!range) return { status: 'unavailable', symbol, quarter, reason: 'invalid_quarter' };

  try {
    const params = new URLSearchParams({
      period1: String(range.period1),
      period2: String(range.period2),
      interval: '1d',
    });
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?${params.toString()}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!response.ok) return { status: 'unavailable', symbol, quarter, reason: 'fetch_failed' };

    const points = parseYahooPoints(await response.json());
    if (!points.length) return { status: 'unavailable', symbol, quarter, reason: 'missing_prices' };

    const low = Math.min(...points.map((point) => point.low));
    const high = Math.max(...points.map((point) => point.high));
    const referencePrice = points.reduce((sum, point) => sum + point.close, 0) / points.length;

    return {
      status: 'available',
      symbol,
      quarter,
      low,
      high,
      referencePrice,
      sourceName: 'Yahoo Finance',
      sourceUrl: `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}/history`,
      retrievedAt: new Date().toISOString(),
    };
  } catch {
    return { status: 'unavailable', symbol, quarter, reason: 'fetch_failed' };
  }
}

export async function getTradePriceEstimateMap(requests: Array<{ companyId: string; quarter: string }>) {
  const uniqueRequests = Array.from(
    new Map(requests.map((request) => [`${request.companyId}:${request.quarter}`, request])).values(),
  );
  const entries = await Promise.all(uniqueRequests.map(async (request) => {
    const estimate = await getTradePriceEstimate(request.companyId, request.quarter);
    return [`${request.companyId}:${request.quarter}`, estimate] as const;
  }));
  return new Map(entries);
}
