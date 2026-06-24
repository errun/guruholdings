import profiles from '@/data-source/stock-profiles.json';
import type { Locale } from '@/lib/i18n/site';

type StockProfile = {
  marketDataSymbol?: string;
  descriptions?: Partial<Record<Locale, string>>;
};

const profileMap = profiles as Record<string, StockProfile>;

export function getStockProfile(companyId: string): StockProfile | null {
  return profileMap[companyId] || null;
}

export function getStockDescription(companyId: string, locale: Locale): string | null {
  const profile = getStockProfile(companyId);
  return profile?.descriptions?.[locale] || null;
}

export function getMarketDataSymbol(companyId: string): string | null {
  const symbol = getStockProfile(companyId)?.marketDataSymbol;
  return symbol ? symbol.toUpperCase() : null;
}
