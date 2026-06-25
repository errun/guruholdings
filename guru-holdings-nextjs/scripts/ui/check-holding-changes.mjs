import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildHoldingChangeModel } from '../../lib/holding-change.mjs';

const cases = [
  { changeType: 'increase', currentWeight: 3.4, previousWeight: 2.1, weightChange: 1.3, currentShares: 120, previousShares: 100, shareChange: 20 },
  { changeType: 'decrease', currentWeight: 1.2, previousWeight: 2.5, weightChange: -1.3, currentShares: 60, previousShares: 100, shareChange: -40 },
  { changeType: 'increase', currentWeight: 2.5, previousWeight: 4.1, weightChange: -1.6, currentShares: 150, previousShares: 100, shareChange: 50 },
  { changeType: 'decrease', currentWeight: 19.4, previousWeight: 6.87, weightChange: 12.53, currentShares: 1940000, previousShares: 2165000, shareChange: -225000 },
  { changeType: 'new', currentWeight: 1.8, previousWeight: 0, weightChange: 1.8, currentShares: 50, previousShares: 0, shareChange: 50 },
  { changeType: 'exit', currentWeight: 0, previousWeight: 2.4, weightChange: -2.4, currentShares: 0, previousShares: 70, shareChange: -70 },
  { changeType: 'unchanged', currentWeight: 4, previousWeight: 4, weightChange: 0, currentShares: 90, previousShares: 90, shareChange: 0 },
];

for (const input of cases) {
  const model = buildHoldingChangeModel(input);
  assert.equal(model.action, input.changeType);
  assert.equal(model.currentWeight, input.currentWeight);
  assert.equal(model.previousWeight, input.previousWeight);
  assert.ok(Math.abs(model.weightDelta - input.weightChange) < 1e-9);
  assert.equal(model.shareDelta, input.shareChange);
}

assert.equal(buildHoldingChangeModel(cases[0]).showWeightTransition, true);
const newCase = cases.find((item) => item.changeType === 'new');
const exitCase = cases.find((item) => item.changeType === 'exit');
assert.equal(buildHoldingChangeModel(newCase).isSpecial, true);
assert.equal(buildHoldingChangeModel(newCase).specialWeight, 1.8);
assert.equal(buildHoldingChangeModel(exitCase).specialWeight, 2.4);

const derivedPrevious = buildHoldingChangeModel({ changeType: 'increase', currentWeight: 5, weightChange: 1.25 });
assert.equal(derivedPrevious.previousWeight, 3.75);

const missingPrevious = buildHoldingChangeModel({ changeType: 'unchanged', currentWeight: 5 });
assert.equal(missingPrevious.previousWeight, null);
assert.equal(missingPrevious.showWeightTransition, false);

const snapshot = JSON.parse(fs.readFileSync('data-generated/snapshots/latest.json', 'utf8'));
const managerProfiles = JSON.parse(fs.readFileSync('data-source/manager-profiles.json', 'utf8'));
const stockProfiles = JSON.parse(fs.readFileSync('data-source/stock-profiles.json', 'utf8'));

const requiredManagers = [
  'berkshire',
  'himalaya',
  'bridgewater',
  'pershing',
  'scion',
  'tiger',
  'palliser',
  'ark',
  'coatue',
  'icahn',
  'third-point',
  'baupost',
  'greenlight',
  'oaktree',
  'hhlr',
  'greenwoods',
];

for (const managerId of requiredManagers) {
  assert.ok(managerProfiles[managerId], `missing manager profile: ${managerId}`);
  for (const field of ['overview', 'style', 'history', 'scale', 'leader', 'record']) {
    for (const locale of ['en', 'zh', 'ja', 'ko']) {
      const minimumLength = locale === 'en' ? 24 : 10;
      assert.ok(managerProfiles[managerId][field]?.[locale]?.length > minimumLength, `short manager profile: ${managerId}.${field}.${locale}`);
    }
  }
}

const requiredStockProfiles = new Set([
  'alphabet',
  '023135106',
  '191216100',
  'microsoft',
  'nvidia',
  ...snapshot.consensus.sharedIncrease.slice(0, 10).map((item) => item.companyId),
  ...snapshot.consensus.sharedDecrease.slice(0, 10).map((item) => item.companyId),
]);

for (const companyId of requiredStockProfiles) {
  assert.ok(stockProfiles[companyId], `missing stock profile: ${companyId}`);
  assert.ok(stockProfiles[companyId].marketDataSymbol, `missing market data symbol: ${companyId}`);
  for (const locale of ['en', 'zh', 'ja', 'ko']) {
    const minimumLength = locale === 'en' ? 24 : 10;
    assert.ok(stockProfiles[companyId].descriptions?.[locale]?.length > minimumLength, `short stock profile: ${companyId}.${locale}`);
  }
}

for (const manager of snapshot.managers) {
  for (const change of manager.latestCompanyChanges || []) {
    const model = buildHoldingChangeModel(change);
    if (model.currentWeight !== null && model.previousWeight !== null && model.weightDelta !== null) {
      assert.ok(Math.abs(model.previousWeight + model.weightDelta - model.currentWeight) < 1e-7, `${manager.id}:${change.companyId}`);
    }
  }
}

for (const manager of snapshot.managers) {
  const [current, previous] = manager.quarterSummaries || [];
  if (!current || !previous) continue;
  const delta = current.totalValue - previous.totalValue;
  assert.equal(Number.isFinite(delta), true, `invalid portfolio value delta: ${manager.id}`);
}

const marketDataSource = fs.readFileSync('lib/market-data.ts', 'utf8');
assert.ok(marketDataSource.includes('revalidate: 60 * 60 * 24'), 'company market cap must refresh every 24 hours');

const freshnessSource = fs.readFileSync('components/signals/FilingFreshnessStrip.tsx', 'utf8');
assert.ok(!freshnessSource.includes('getNextExpectedFiling'), 'public freshness strip must not predict a specific manager filing date');
assert.ok(freshnessSource.includes('signal.freshness.nextCheck'), 'freshness strip must show the monthly automated check cadence');

const homeSource = fs.readFileSync('components/site-pages/HomePage.tsx', 'utf8');
assert.ok(homeSource.includes('home.consensus.viewAllIncrease'), 'home page must link to all shared increases');
assert.ok(homeSource.includes('home.consensus.viewAllDecrease'), 'home page must link to all shared decreases');
assert.ok(homeSource.includes('ManagerPortfolioMini'), 'home manager cards must show disclosed portfolio value change');

const stockSource = fs.readFileSync('components/site-pages/StockPage.tsx', 'utf8');
assert.ok(stockSource.includes('stock.estimatedPriceRange'), 'stock actions must show estimated quarter price ranges');
assert.ok(!stockSource.includes('average buy price'), 'stock page must not describe estimated prices as average buy price');
assert.ok(!stockSource.includes('average sell price'), 'stock page must not describe estimated prices as average sell price');

const priceEstimateSource = fs.readFileSync('lib/price-estimates.ts', 'utf8');
assert.ok(priceEstimateSource.includes('query1.finance.yahoo.com'), 'price estimates must use a verifiable historical quote source');
assert.ok(priceEstimateSource.includes('revalidate: 60 * 60 * 24'), 'price estimates must refresh every 24 hours');

function parseRawInfoTable(path) {
  const xml = fs.readFileSync(path, 'utf8');
  const blocks = xml.match(/<[^:>]*:?infoTable[\s\S]*?<\/[^:>]*:?infoTable>/g) || [];
  let totalValue = 0;
  let amazon = null;
  for (const block of blocks) {
    const value = Number((block.match(/<[^:>]*:?value>([^<]+)/) || [])[1] || 0);
    const cusip = (block.match(/<[^:>]*:?cusip>([^<]+)/) || [])[1];
    const shares = Number((block.match(/<[^:>]*:?sshPrnamt>([^<]+)/) || [])[1] || 0);
    totalValue += value;
    if (cusip === '023135106') amazon = { value, shares, weight: value / totalValue };
  }
  if (amazon) amazon.weight = (amazon.value / totalValue) * 100;
  return { totalValue, amazon };
}

const amazon2025Q4 = parseRawInfoTable('data-source/raw/sec-13f/2025Q4/third-point/0001040273-26-000001/infotable.xml');
const amazon2026Q1 = parseRawInfoTable('data-source/raw/sec-13f/2026Q1/third-point/0001040273-26-000002/infotable.xml');
assert.equal(amazon2025Q4.amazon.shares, 2165000);
assert.equal(amazon2025Q4.amazon.value, 499725300);
assert.equal(amazon2025Q4.totalValue, 7274621868);
assert.ok(Math.abs(amazon2025Q4.amazon.weight - 6.869433340559166) < 1e-9);
assert.equal(amazon2026Q1.amazon.shares, 1940000);
assert.equal(amazon2026Q1.amazon.value, 404043800);
assert.equal(amazon2026Q1.totalValue, 2082795760);
assert.ok(Math.abs(amazon2026Q1.amazon.weight - 19.39910805272621) < 1e-9);

const thirdPoint = snapshot.managers.find((manager) => manager.id === 'third-point');
const amazonChange = thirdPoint.latestCompanyChanges.find((change) => change.companyId === '023135106');
assert.equal(amazonChange.changeType, 'decrease');
assert.equal(amazonChange.shareChange, -225000);
assert.ok(amazonChange.weightChange > 0);

const forbiddenText = [
  'stock.description.fallback',
  '暂未提供人工整理',
  '按近期节奏估算',
  '估算基于各机构近期 SEC 13F 提交节奏',
  'Next expected filing signal',
  '次に予想されるfiling',
  '다음 예상 filing',
];
for (const file of ['lib/i18n/site.ts', 'components/site-pages/HomePage.tsx', 'components/site-pages/Live13FPage.tsx', 'components/site-pages/StockPage.tsx']) {
  const text = fs.readFileSync(file, 'utf8');
  for (const phrase of forbiddenText) {
    assert.ok(!text.includes(phrase), `forbidden phrase remains in ${file}: ${phrase}`);
  }
}

console.log(`Holding change check passed: ${cases.length} action states, profile coverage, Amazon raw XML cross-check, and published snapshot formulas.`);
