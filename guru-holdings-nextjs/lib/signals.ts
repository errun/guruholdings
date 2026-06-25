import snapshot from '@/data-generated/snapshots/latest.json';
import { stockPath } from '@/lib/stock-routes';

type AnyRecord = Record<string, any>;

export const signalModes = ['all', 'new', 'increase', 'decrease', 'exit'] as const;
export type SignalMode = (typeof signalModes)[number];
export type SignalKind = Exclude<SignalMode, 'all'>;

export type SignalCounts = Record<SignalMode, number>;

export type SignalItem = {
  id: string;
  kind: SignalKind;
  companyId: string;
  stockHref: string;
  canonicalName: string;
  issuerName: string;
  ticker: string | null;
  cusips: string[];
  themes: string[];
  managerId: string;
  managerName: string;
  leadInvestor: string | null;
  managerHref: string;
  managerQuarter: string;
  siteQuarter: string;
  isStale: boolean;
  filingDate: string | null;
  accessionNumber: string | null;
  sourceUrl: string | null;
  currentShares: number;
  previousShares: number;
  shareChange: number;
  shareChangePercent: number | null;
  currentValue: number;
  previousValue: number;
  valueChange: number;
  currentWeight: number | null;
  previousWeight: number | null;
  weightChange: number | null;
};

const actionableKinds = new Set<SignalKind>(['new', 'increase', 'decrease', 'exit']);
const actionPriority: Record<SignalKind, number> = {
  new: 0,
  increase: 1,
  decrease: 2,
  exit: 3,
};

function numeric(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function nullableNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function quarterSortKey(quarter: string) {
  const match = /^(\d{4})Q([1-4])$/.exec(quarter || '');
  if (!match) return 0;
  return Number(match[1]) * 10 + Number(match[2]);
}

function toSignalItem(manager: AnyRecord, change: AnyRecord): SignalItem | null {
  if (!actionableKinds.has(change.changeType)) return null;

  const kind = change.changeType as SignalKind;
  const latestFiling = manager.latestFiling || {};
  const sourceUrl = latestFiling.sourceUrl || change.sourceUrl || null;
  const companyId = String(change.companyId || change.canonicalCompanyId || change.securityId || '');
  if (!companyId) return null;

  return {
    id: `${manager.id}-${companyId}-${kind}-${change.quarter || manager.latestQuarter}`,
    kind,
    companyId,
    stockHref: stockPath(companyId),
    canonicalName: change.canonicalName || change.issuerName || companyId,
    issuerName: change.issuerName || change.canonicalName || companyId,
    ticker: change.canonicalTicker || null,
    cusips: change.rawCusips || change.canonicalCusips || (change.cusip ? [change.cusip] : []),
    themes: change.themes || [],
    managerId: manager.id,
    managerName: manager.displayName || manager.managerName || manager.id,
    leadInvestor: manager.leadInvestor || null,
    managerHref: `/live-13f/${manager.id}`,
    managerQuarter: manager.latestQuarter,
    siteQuarter: snapshot.latestQuarter,
    isStale: manager.latestQuarter !== snapshot.latestQuarter,
    filingDate: latestFiling.filingDate || null,
    accessionNumber: latestFiling.accessionNumber || change.accessionNumber || null,
    sourceUrl,
    currentShares: numeric(change.currentShares),
    previousShares: numeric(change.previousShares),
    shareChange: numeric(change.shareChange),
    shareChangePercent: nullableNumber(change.shareChangePercent),
    currentValue: numeric(change.currentValue),
    previousValue: numeric(change.previousValue),
    valueChange: numeric(change.valueChange),
    currentWeight: nullableNumber(change.currentWeight),
    previousWeight: nullableNumber(change.previousWeight),
    weightChange: nullableNumber(change.weightChange),
  };
}

function sortSignals(a: SignalItem, b: SignalItem) {
  return quarterSortKey(b.managerQuarter) - quarterSortKey(a.managerQuarter)
    || actionPriority[a.kind] - actionPriority[b.kind]
    || Math.abs(b.valueChange) - Math.abs(a.valueChange)
    || Math.abs(b.shareChange) - Math.abs(a.shareChange);
}

export function normalizeSignalMode(value: string | string[] | undefined | null): SignalMode {
  const candidate = Array.isArray(value) ? value[0] : value;
  return signalModes.includes(candidate as SignalMode) ? candidate as SignalMode : 'all';
}

export function getSignalItems(mode: SignalMode = 'all', limit?: number): SignalItem[] {
  const items = (snapshot.managers as AnyRecord[])
    .flatMap((manager) => (manager.latestCompanyChanges || [])
      .map((change: AnyRecord) => toSignalItem(manager, change))
      .filter((item: SignalItem | null): item is SignalItem => Boolean(item)))
    .filter((item) => mode === 'all' || item.kind === mode)
    .sort(sortSignals);

  return typeof limit === 'number' ? items.slice(0, limit) : items;
}

export function getSignalCounts(items: SignalItem[] = getSignalItems('all')): SignalCounts {
  return items.reduce<SignalCounts>((counts, item) => {
    counts.all += 1;
    counts[item.kind] += 1;
    return counts;
  }, { all: 0, new: 0, increase: 0, decrease: 0, exit: 0 });
}

export function getSignalsByCompanyId(companyId: string) {
  return getSignalItems('all').filter((item) => item.companyId === companyId);
}

export function getSignalsByManagerId(managerId: string) {
  return getSignalItems('all').filter((item) => item.managerId === managerId);
}
