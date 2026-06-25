import { formatDate, formatQuarter } from '@/lib/sec13f-view';
import type { Locale } from '@/lib/i18n/site';

const DAY_MS = 24 * 60 * 60 * 1000;

function utcDate(year: number, monthIndex: number, day: number) {
  return new Date(Date.UTC(year, monthIndex, day));
}

export function parseQuarter(value: string) {
  const match = /^(\d{4})Q([1-4])$/.exec(value);
  if (!match) return null;
  return { year: Number(match[1]), quarter: Number(match[2]) };
}

export function getQuarterEndDate(value: string) {
  const parsed = parseQuarter(value);
  if (!parsed) return null;
  return utcDate(parsed.year, parsed.quarter * 3, 0);
}

export function getNextQuarter(value: string) {
  const parsed = parseQuarter(value);
  if (!parsed) return value;
  const quarter = parsed.quarter === 4 ? 1 : parsed.quarter + 1;
  const year = parsed.quarter === 4 ? parsed.year + 1 : parsed.year;
  return `${year}Q${quarter}`;
}

export function getApproximateFilingWindow(value: string) {
  const quarterEnd = getQuarterEndDate(value);
  if (!quarterEnd) return null;
  return new Date(quarterEnd.getTime() + 45 * DAY_MS);
}

export function getNextMonthlyCheck(dayOfMonth = 16, now = new Date()) {
  const current = utcDate(now.getUTCFullYear(), now.getUTCMonth(), dayOfMonth);
  if (now.getTime() <= current.getTime()) return current;
  return utcDate(now.getUTCFullYear(), now.getUTCMonth() + 1, dayOfMonth);
}

export function getFreshnessDisplay(latestQuarter: string, locale: Locale, now = new Date()) {
  const nextQuarter = getNextQuarter(latestQuarter);
  const filingWindow = getApproximateFilingWindow(nextQuarter);
  const nextCheck = getNextMonthlyCheck(16, now);

  return {
    latestQuarter: formatQuarter(latestQuarter, locale),
    nextQuarter: formatQuarter(nextQuarter, locale),
    nextCheckDate: formatDate(nextCheck.toISOString(), locale),
    filingWindowDate: filingWindow ? formatDate(filingWindow.toISOString(), locale) : 'n/a',
  };
}
