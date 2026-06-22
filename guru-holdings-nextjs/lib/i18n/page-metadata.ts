import snapshot from '@/data-generated/snapshots/latest.json';
import { buildMetadata } from './metadata';
import { seoKeywordMap } from './seo-keywords';
import type { Locale } from './site';

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

export function getStockMetadata(locale: Locale, companyId: string) {
  const decodedCompanyId = decodeURIComponent(companyId);
  const stock = snapshot.stocks.find((item) => item.companyId === decodedCompanyId);
  const name = stock?.canonicalName || decodedCompanyId;
  return buildMetadata(locale, {
    titleKey: 'seo.stock.title',
    descriptionKey: 'seo.stock.description',
    titleValues: { name },
    descriptionValues: { name },
    path: `/stocks/${encodeURIComponent(decodedCompanyId)}`,
    keywords: [...seoKeywordMap[locale].stock, name, ...(stock?.canonicalTicker ? [stock.canonicalTicker] : [])],
    index: Boolean(stock),
  });
}
