import type { Locale } from '@/lib/i18n/site';
import { directionTextClass, formatCurrency, formatPercent, formatQuarter } from '@/lib/sec13f-view';

type QuarterSummary = {
  quarter: string;
  totalValue: number;
};

type ManagerWithQuarters = {
  quarterSummaries?: QuarterSummary[];
};

export type ManagerPortfolioChange =
  | {
      status: 'available';
      currentQuarter: string;
      previousQuarter: string;
      currentValue: number;
      previousValue: number;
      valueDelta: number;
      percentDelta: number;
      toneClass: string;
    }
  | {
      status: 'unavailable';
    };

export function getManagerPortfolioChange(manager: ManagerWithQuarters): ManagerPortfolioChange {
  const current = manager.quarterSummaries?.[0];
  const previous = manager.quarterSummaries?.[1];
  if (!current || !previous || !Number.isFinite(current.totalValue) || !Number.isFinite(previous.totalValue) || previous.totalValue <= 0) {
    return { status: 'unavailable' };
  }

  const valueDelta = current.totalValue - previous.totalValue;
  return {
    status: 'available',
    currentQuarter: current.quarter,
    previousQuarter: previous.quarter,
    currentValue: current.totalValue,
    previousValue: previous.totalValue,
    valueDelta,
    percentDelta: (valueDelta / previous.totalValue) * 100,
    toneClass: directionTextClass(valueDelta),
  };
}

export function formatManagerPortfolioChange(change: ManagerPortfolioChange, locale: Locale) {
  if (change.status !== 'available') return null;
  return {
    currentQuarter: formatQuarter(change.currentQuarter, locale),
    previousQuarter: formatQuarter(change.previousQuarter, locale),
    currentValue: formatCurrency(change.currentValue, true, locale),
    previousValue: formatCurrency(change.previousValue, true, locale),
    valueDelta: `${change.valueDelta > 0 ? '+' : change.valueDelta < 0 ? '-' : ''}${formatCurrency(Math.abs(change.valueDelta), true, locale)}`,
    percentDelta: formatPercent(change.percentDelta, 1, locale),
  };
}
