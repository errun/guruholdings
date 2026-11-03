export type SecurityIdentity = { companyId: string; canonicalName: string; rawCusips: string[] };
export function securitySeoName(stock: SecurityIdentity, ambiguousName = false) {
  const option = /:(PUT|CALL)$/.exec(stock.companyId)?.[1];
  const identifier = ambiguousName ? ` [${stock.rawCusips.join(' / ') || stock.companyId.split(':')[0]}]` : '';
  return `${stock.canonicalName}${identifier}${option ? ` (${option})` : ''}`;
}
export function stockReportingPeriod(stock: { latestQuarter: string; quarters: { quarter: string; eventCount: number; holderCount: number }[] }) {
  // Retained historical securities may have no filing in the global latest quarter.
  const available = stock.quarters.filter(q => q.eventCount > 0).sort((a, b) => a.quarter.localeCompare(b.quarter));
  return available.at(-1) || null;
}
export function breadcrumbData(items: { name: string; url: string }[]) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({
    '@type': 'ListItem', position: index + 1, name: item.name, item: item.url,
  })) };
}
export function safeJsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, '\\u003c'); }
