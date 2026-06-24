type AnyRecord = Record<string, any>;

type FilingExpectationCandidate = {
  managerId: string;
  managerName: string;
  expectedDate: Date;
  expectedQuarter: string;
  medianLagDays: number;
};

export type FilingExpectation = FilingExpectationCandidate & {
  daysUntil: number;
  isWindowOpen: boolean;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function parseQuarter(quarter: string) {
  const match = /^(\d{4})Q([1-4])$/.exec(quarter || '');
  if (!match) return null;
  return { year: Number(match[1]), quarter: Number(match[2]) };
}

function formatQuarterId(year: number, quarter: number) {
  return `${year}Q${quarter}`;
}

function addQuarter(quarter: string, amount = 1) {
  const parsed = parseQuarter(quarter);
  if (!parsed) return null;
  const zeroBased = (parsed.quarter - 1) + amount;
  const year = parsed.year + Math.floor(zeroBased / 4);
  const nextQuarter = (zeroBased % 4) + 1;
  return formatQuarterId(year, nextQuarter);
}

function quarterEndDate(quarter: string) {
  const parsed = parseQuarter(quarter);
  if (!parsed) return null;
  const monthByQuarter = [2, 5, 8, 11];
  const month = monthByQuarter[parsed.quarter - 1];
  const day = new Date(Date.UTC(parsed.year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(parsed.year, month, day));
}

function parseUtcDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function median(values: number[]) {
  if (!values.length) return 45;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

function medianFilingLagDays(filings: AnyRecord[]) {
  const lags = filings
    .map((filing) => {
      const reportDate = parseUtcDate(filing.reportDate);
      const filingDate = parseUtcDate(filing.filingDate);
      if (!reportDate || !filingDate) return null;
      return Math.max(0, Math.round((filingDate.getTime() - reportDate.getTime()) / DAY_MS));
    })
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

  return median(lags);
}

function expectedDateForQuarter(quarter: string, lagDays: number) {
  const end = quarterEndDate(quarter);
  if (!end) return null;
  return new Date(end.getTime() + lagDays * DAY_MS);
}

export function getNextExpectedFiling(snapshot: AnyRecord, reference = new Date()): FilingExpectation | null {
  const managers = Array.isArray(snapshot?.managers) ? snapshot.managers : [];
  const baseQuarter = addQuarter(snapshot?.latestQuarter, 1);
  if (!baseQuarter || managers.length === 0) return null;

  const referenceUtc = new Date(Date.UTC(
    reference.getUTCFullYear(),
    reference.getUTCMonth(),
    reference.getUTCDate(),
  ));

  const candidates = managers
    .map((manager): FilingExpectationCandidate | null => {
      const lagDays = medianFilingLagDays(manager.filings || []);
      let expectedQuarter = baseQuarter;
      let expectedDate = expectedDateForQuarter(expectedQuarter, lagDays);
      let guard = 0;

      while (expectedDate && expectedDate.getTime() < referenceUtc.getTime() && guard < 8) {
        const nextQuarter = addQuarter(expectedQuarter, 1);
        if (!nextQuarter) break;
        expectedQuarter = nextQuarter;
        expectedDate = expectedDateForQuarter(expectedQuarter, lagDays);
        guard += 1;
      }

      if (!expectedDate) return null;
      return {
        managerId: manager.id,
        managerName: manager.displayName,
        expectedDate,
        expectedQuarter,
        medianLagDays: lagDays,
      };
    })
    .filter((candidate): candidate is FilingExpectationCandidate => Boolean(candidate))
    .sort((a, b) => a.expectedDate.getTime() - b.expectedDate.getTime());

  const next = candidates[0];
  if (!next) return null;

  const daysUntil = Math.ceil((next.expectedDate.getTime() - referenceUtc.getTime()) / DAY_MS);
  return {
    ...next,
    daysUntil,
    isWindowOpen: daysUntil <= 0,
  };
}

