import 'server-only';
import snapshot from '@/data-generated/snapshots/latest.json';
import stockSlugsJson from '@/data-source/stock-slugs.json';

const stockSlugs = stockSlugsJson as Record<string, string>;
const stockByCompanyId = new Map(snapshot.stocks.map((stock) => [stock.companyId, stock]));
const companyIdBySlug = new Map(Object.entries(stockSlugs).map(([companyId, slug]) => [slug, companyId]));
const legacyCompanyIdByAlias = new Map(snapshot.stocks.map((stock) => [stock.companyId, stock.companyId]));
const isOptionCompanyId = (companyId: string) => /:(?:CALL|PUT)$/.test(companyId);

for (const stock of snapshot.stocks) {
  for (const cusip of stock.rawCusips || []) {
    const existing = legacyCompanyIdByAlias.get(cusip);
    if (!existing || (isOptionCompanyId(existing) && !isOptionCompanyId(stock.companyId))) {
      legacyCompanyIdByAlias.set(cusip, stock.companyId);
    }
  }
}

export type StockRouteResolution = {
  companyId: string;
  slug: string;
  isCanonical: boolean;
};

export function getStockSlug(companyId: string): string {
  const slug = stockSlugs[companyId];
  if (!slug) throw new Error(`Missing stock slug for ${companyId}`);
  return slug;
}

export function stockPath(companyId: string): string {
  return `/stocks/${getStockSlug(companyId)}`;
}

export function resolveStockRoute(segment: string): StockRouteResolution | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    return null;
  }

  const canonicalCompanyId = companyIdBySlug.get(decoded);
  if (canonicalCompanyId && stockByCompanyId.has(canonicalCompanyId)) {
    return { companyId: canonicalCompanyId, slug: decoded, isCanonical: true };
  }

  const legacyCompanyId = legacyCompanyIdByAlias.get(decoded);
  if (!legacyCompanyId || !stockByCompanyId.has(legacyCompanyId)) return null;

  return {
    companyId: legacyCompanyId,
    slug: getStockSlug(legacyCompanyId),
    isCanonical: false,
  };
}

export function getStockByCompanyId(companyId: string) {
  return stockByCompanyId.get(companyId) || null;
}

export function withSearchParams(
  pathname: string,
  searchParams: Record<string, string | string[] | undefined> | undefined,
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams || {})) {
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item));
    else if (value !== undefined) query.set(key, value);
  }
  const serialized = query.toString();
  return serialized ? `${pathname}?${serialized}` : pathname;
}
