import snapshot from '@/data-generated/snapshots/latest.json';
import { buildMetadata } from './metadata';
import { seoKeywordMap } from './seo-keywords';
import type { Locale } from './site';
import { getStockByCompanyId, resolveStockRoute, stockPath } from '@/lib/stock-routes';

export function getHomeMetadata(locale: Locale) {
  return buildMetadata(locale, {
    titleKey: 'seo.home.title',
    descriptionKey: 'seo.home.description',
    path: '/',
    keywords: seoKeywordMap[locale].home,
  });
}

export function getLive13FMetadata(locale: Locale) {
  return buildMetadata(locale, {
    titleKey: 'seo.live.title',
    descriptionKey: 'seo.live.description',
    path: '/live-13f',
    keywords: seoKeywordMap[locale].data,
  });
}

export function getManagerMetadata(locale: Locale, managerId: string) {
  const manager = snapshot.managers.find((item) => item.id === managerId);
  const name = manager?.displayName || managerId;
  return buildMetadata(locale, {
    titleKey: 'seo.manager.title',
    descriptionKey: 'seo.manager.description',
    titleValues: { name },
    descriptionValues: { name },
    path: `/live-13f/${encodeURIComponent(managerId)}`,
    keywords: [...seoKeywordMap[locale].manager, name],
    index: Boolean(manager),
  });
}

export function getStockMetadata(locale: Locale, routeSegment: string) {
  const route = resolveStockRoute(routeSegment);
  const stock = route ? getStockByCompanyId(route.companyId) : null;
  const name = stock?.canonicalName || routeSegment;
  return buildMetadata(locale, {
    titleKey: 'seo.stock.title',
    descriptionKey: 'seo.stock.description',
    titleValues: { name },
    descriptionValues: { name },
    path: route ? stockPath(route.companyId) : `/stocks/${encodeURIComponent(routeSegment)}`,
    keywords: [...seoKeywordMap[locale].stock, name, ...(stock?.canonicalTicker ? [stock.canonicalTicker] : [])],
    index: Boolean(stock && route?.isCanonical),
  });
}
