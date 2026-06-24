import snapshot from '@/data-generated/snapshots/latest.json';
import { stockPath } from '@/lib/stock-routes';

type AnyRecord = Record<string, any>;

const managerSearchTextById = new Map(
  (snapshot.searchIndex?.managers || []).map((item: AnyRecord) => [item.id, item.searchText])
);

const pickManagerBasics = (manager: AnyRecord) => ({
  id: manager.id,
  displayName: manager.displayName,
  leadInvestor: manager.leadInvestor,
  managerName: manager.managerName,
  aliases: manager.aliases || [],
  styleTags: manager.styleTags || [],
  descriptions: manager.descriptions || null,
  logoUrl: manager.logoUrl || null,
  logoFallbackReason: manager.logoFallbackReason || null,
  sourceIdentifiers: manager.sourceIdentifiers || null,
  cik: manager.cik,
  latestQuarter: manager.latestQuarter,
  latestTotalValue: manager.latestTotalValue,
  latestFiling: manager.latestFiling,
  metrics: {
    top10Weight: manager.metrics?.top10Weight || 0,
    concentration: manager.metrics?.concentration || 'unknown',
    changeCounts: manager.metrics?.changeCounts || {},
  },
  themeAllocation: (manager.themeAllocation || []).map((item: AnyRecord) => ({
    theme: item.theme,
    value: item.value,
    weight: item.weight,
  })),
  companyHoldingCount: manager.companyHoldings?.length || 0,
  searchText: managerSearchTextById.get(manager.id) || '',
});

const pickStockSearchResult = (stock: AnyRecord) => ({
  companyId: stock.companyId,
  href: stockPath(stock.companyId),
  canonicalName: stock.canonicalName,
  canonicalTicker: stock.canonicalTicker,
  rawCusips: stock.rawCusips,
  latestHolderCount: stock.latestHolderCount,
  latestTotalValue: stock.latestTotalValue,
  themes: stock.themes || [],
  searchText: stock.searchText,
  holders: (stock.holders || []).map((holder: AnyRecord) => ({
    managerId: holder.managerId,
    managerName: holder.managerName,
    changeType: holder.changeType,
  })),
});

const pickConsensusSearchResult = (item: AnyRecord) => ({
  companyId: item.companyId,
  href: stockPath(item.companyId),
  canonicalName: item.canonicalName,
  canonicalTicker: item.canonicalTicker,
  issuerName: item.issuerName,
  rawCusips: item.rawCusips,
  cusip: item.cusip,
  themes: item.themes || [],
  managers: (item.managers || []).map((manager: AnyRecord) => ({
    managerId: manager.managerId,
    managerName: manager.managerName,
    changeType: manager.changeType,
    shareChange: manager.shareChange,
    weightChange: manager.weightChange,
  })),
  increaseManagers: item.increaseManagers,
  decreaseManagers: item.decreaseManagers,
  netShareChange: item.netShareChange,
  netShareChangePercent: item.netShareChangePercent,
  netValueChange: item.netValueChange,
  netWeightChange: item.netWeightChange,
});

export function getExplorerData() {
  const stocks = (snapshot.stocks || []).map(pickStockSearchResult);
  const managers = (snapshot.managers || []).map(pickManagerBasics);
  const themes = Array.from(new Set(stocks.flatMap((stock: AnyRecord) => stock.themes || []))).sort();

  return {
    stocks,
    managers,
    themes,
    stockTotal: snapshot.stocks.length,
    managerTotal: snapshot.managers.length,
    consensus: {
      sharedIncrease: (snapshot.consensus?.sharedIncrease || []).map(pickConsensusSearchResult),
      sharedDecrease: (snapshot.consensus?.sharedDecrease || []).map(pickConsensusSearchResult),
    },
  };
}

export function getManagerCompareData() {
  return (snapshot.managers || []).map((manager: AnyRecord) => ({
    ...pickManagerBasics(manager),
    companyHoldings: (manager.companyHoldings || []).map((holding: AnyRecord) => ({
      companyId: holding.companyId,
      href: stockPath(holding.companyId),
      canonicalName: holding.canonicalName,
      issuerName: holding.issuerName,
      rawCusips: holding.rawCusips,
      cusip: holding.cusip,
      value: holding.value,
    })),
    latestCompanyChanges: (manager.latestCompanyChanges || []).map((change: AnyRecord) => ({
      companyId: change.companyId,
      href: stockPath(change.companyId),
      canonicalName: change.canonicalName,
      issuerName: change.issuerName,
      changeType: change.changeType,
      shareChange: change.shareChange,
    })),
  }));
}

export function getManagerChartData(manager: AnyRecord) {
  return {
    quarterAnalytics: manager.quarterAnalytics || [],
    topHoldingWeights: manager.topHoldingWeights || [],
    themeAllocation: manager.themeAllocation || [],
  };
}

export function getManagerOperationData(manager: AnyRecord) {
  const quarterlyCompanyChanges = Object.fromEntries(
    Object.entries(manager.quarterlyCompanyChanges || {}).map(([quarter, changes]) => [
      quarter,
      (changes as AnyRecord[]).map((change) => ({ ...change, href: stockPath(change.companyId) })),
    ]),
  );
  return {
    latestQuarter: manager.latestQuarter,
    quarterlyCompanyChanges,
  };
}

export function getStockChartData(stock: AnyRecord) {
  return {
    quarters: stock.quarters || [],
  };
}
