import snapshot from '@/data-generated/snapshots/latest.json';
import { buildMetadata } from './metadata';
import { seoKeywordMap } from './seo-keywords';
import type { Locale } from './site';
import { formatQuarter } from '@/lib/sec13f-view';
import { securitySeoName, stockReportingPeriod } from '@/lib/seo-identity';
import { getStockByCompanyId, resolveStockRoute, stockPath } from '@/lib/stock-routes';

const nameCounts = new Map<string, number>();
for (const stock of snapshot.stocks) {
  if (!/:(PUT|CALL)$/.test(stock.companyId)) nameCounts.set(stock.canonicalName, (nameCounts.get(stock.canonicalName) || 0) + 1);
}

export function getHomeMetadata(locale: Locale) {
  return buildMetadata(locale, {
    titleKey: 'seo.home.title',
    descriptionKey: 'seo.home.description',
    path: '/',
    keywords: seoKeywordMap[locale].home,
    titleValues: { quarter: formatQuarter(snapshot.latestQuarter, locale) },
    descriptionValues: { quarter: formatQuarter(snapshot.latestQuarter, locale), managers: snapshot.managers.length },
  });
}

export function getLive13FMetadata(locale: Locale) {
  return buildMetadata(locale, {
    titleKey: 'seo.live.title',
    descriptionKey: 'seo.live.description',
    path: '/live-13f',
    keywords: seoKeywordMap[locale].data,
    titleValues: { quarter: formatQuarter(snapshot.latestQuarter, locale) },
    descriptionValues: { quarter: formatQuarter(snapshot.latestQuarter, locale), managers: snapshot.managers.length },
  });
}

export function getManagerMetadata(locale: Locale, managerId: string) {
  const manager = snapshot.managers.find((item) => item.id === managerId);
  const name = manager?.displayName || managerId;
  return buildMetadata(locale, {
    titleKey: 'seo.manager.title',
    descriptionKey: 'seo.manager.description',
    titleValues: { name, quarter: manager ? formatQuarter(manager.latestQuarter, locale) : '' },
    descriptionValues: { name, investor: manager?.leadInvestor || name, quarter: manager ? formatQuarter(manager.latestQuarter, locale) : '',
      filingDate: manager?.latestFiling.filingDate || '', holdings: manager?.latestHoldingCount || 0 },
    path: `/live-13f/${encodeURIComponent(managerId)}`,
    keywords: [...seoKeywordMap[locale].manager, name],
    index: Boolean(manager),
  });
}

export function getStockMetadata(locale: Locale, routeSegment: string) {
  const route = resolveStockRoute(routeSegment);
  const stock = route ? getStockByCompanyId(route.companyId) : null;
  const name = stock ? securitySeoName(stock, (nameCounts.get(stock.canonicalName) || 0) > 1) : routeSegment;
  const period = stock ? stockReportingPeriod(stock) : null;
  return buildMetadata(locale, {
    titleKey: period ? 'seo.stock.title' : 'seo.stock.historical.title',
    descriptionKey: period ? 'seo.stock.description' : 'seo.stock.historical.description',
    titleValues: { name, quarter: period ? formatQuarter(period.quarter, locale) : '' },
    descriptionValues: { name, quarter: period ? formatQuarter(period.quarter, locale) : '', holders: period?.holderCount || 0 },
    path: route ? stockPath(route.companyId) : `/stocks/${encodeURIComponent(routeSegment)}`,
    keywords: [...seoKeywordMap[locale].stock, name, ...(stock?.canonicalTicker ? [stock.canonicalTicker] : [])],
    index: Boolean(stock && route?.isCanonical && period),
  });
}

export function getMethodologyMetadata(locale: Locale) {
  return buildMetadata(locale, { titleKey: 'seo.methodology.title', descriptionKey: 'seo.methodology.description', path: '/methodology' });
}
