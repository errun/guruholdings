import { test } from 'node:test';
import assert from 'node:assert/strict';
import snapshot from '../../data-generated/snapshots/latest.json';
import { securitySeoName, stockReportingPeriod, breadcrumbData, safeJsonLd } from '../../lib/seo-identity';
import { methodologyCopy } from '../../lib/i18n/methodology';
import { translate, locales } from '../../lib/i18n/site';
import { formatQuarter } from '../../lib/sec13f-view';

test('equity, options and same-issuer securities have distinct search identities across the full catalog', () => {
  const counts = new Map<string, number>();
  for (const s of snapshot.stocks) if (!/:(PUT|CALL)$/.test(s.companyId)) counts.set(s.canonicalName,(counts.get(s.canonicalName)||0)+1);
  const names = snapshot.stocks.map(s => securitySeoName(s, (counts.get(s.canonicalName)||0)>1));
  assert.equal(new Set(names).size, snapshot.stocks.length);
  const nvidiaPut = snapshot.stocks.find(s => s.companyId === 'nvidia:PUT')!;
  assert.match(securitySeoName(nvidiaPut), /\(PUT\)$/);
});
test('historical-only stocks use the last evidenced reporting period instead of the global latest', () => {
  assert.deepEqual(stockReportingPeriod({ latestQuarter:'2026Q2', quarters:[
    {quarter:'2025Q4',eventCount:1,holderCount:1},{quarter:'2026Q1',eventCount:0,holderCount:0},{quarter:'2026Q2',eventCount:0,holderCount:0},
  ] }), {quarter:'2025Q4',eventCount:1,holderCount:1});
});
test('older manager snippets retain their actual quarter in all supported languages', () => {
  const manager=snapshot.managers.find(m => m.id==='scion')!;
  for (const locale of locales) {
    const title=translate(locale,'seo.manager.title',{name:manager.displayName,quarter:formatQuarter(manager.latestQuarter,locale)});
    assert.ok(title.includes(formatQuarter(manager.latestQuarter,locale)));
    assert.ok(!title.includes(formatQuarter(snapshot.latestQuarter,locale)));
  }
});
test('breadcrumb serialization cannot break out of JSON-LD with externally sourced names', () => {
  const data=breadcrumbData([{name:'Home',url:'https://guruholdings.net'},{name:'</script><script>bad()</script>',url:'https://guruholdings.net/stocks/example'}]);
  const text=safeJsonLd(data);
  assert.ok(!text.includes('</script>'));
  assert.deepEqual(JSON.parse(text),data);
  assert.deepEqual(data.itemListElement.map(i=>i.position),[1,2]);
});
test('methodology is complete in each locale and provides human-readable source and limitation sections', () => {
  for (const locale of locales) {
    const copy=methodologyCopy[locale];
    assert.equal(copy.sections.length,6);
    assert.ok(copy.title && copy.meaning && copy.sources);
    assert.ok(copy.sections.every(s=>s.title.trim() && s.body.trim()));
  }
});
