import type { TrafficReport } from './traffic-report';

export const ACQUISITION_TIME_ZONE = 'America/Los_Angeles';
export const ACQUISITION_DEFINITION = {
  metric: 'newUsers', channelDimension: 'firstUserDefaultChannelGroup', channel: 'Organic Search',
  attribution: 'first_user', testExclusionDimension: 'firstUserSource',
} as const;

// Resolve once, before requests, so a run crossing property midnight stays consistent.
export function acquisitionPeriods(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: ACQUISITION_TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now).map(p => [p.type, p.value]));
  const today = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
  const day = (offset: number) => new Date(today - offset * 86400000).toISOString().slice(0, 10);
  const range = (length: number, offset = 0) => ({ startDate: day(length + offset), endDate: day(1 + offset) });
  return { current7: range(7), previous7: range(7, 7), current28: range(28), previous28: range(28, 28) };
}

export function acquisitionReportRequests(now = new Date()) {
  const periods = acquisitionPeriods(now);
  const dimensionFilter = { andGroup: { expressions: [
    { filter: { fieldName: 'hostName', inListFilter: { values: ['guruholdings.net', 'www.guruholdings.net'] } } },
    { filter: { fieldName: 'firstUserDefaultChannelGroup', stringFilter: { matchType: 'EXACT', value: 'Organic Search', caseSensitive: true } } },
    { notExpression: { filter: { fieldName: 'firstUserSource', stringFilter: { matchType: 'BEGINS_WITH', value: 'codex_', caseSensitive: false } } } },
  ] } };
  const query = (range: { startDate: string; endDate: string }, dimensions: string[] = [], limit = 1) => ({
    dateRanges: [range], dimensionFilter, dimensions: dimensions.map(name => ({ name })),
    metrics: [{ name: 'newUsers' }], limit,
  });
  return {
    current7: query(periods.current7), previous7: query(periods.previous7),
    current28: query(periods.current28), previous28: query(periods.previous28),
    daily28: { ...query(periods.current28, ['date'], 28), orderBys: [{ dimension: { dimensionName: 'date' } }] },
    sources28: { ...query(periods.current28, ['firstUserSourceMedium'], 100), orderBys: [{ metric: { metricName: 'newUsers' }, desc: true }] },
  };
}

export function acquisitionCount(report?: TrafficReport) {
  if (!report) return { newUsers: null, state: 'unavailable' } as const;
  if (!report.rows?.length) return { newUsers: null, state: 'no_rows' } as const;
  if (report.rows.length !== 1) return { newUsers: null, state: 'ambiguous_rows' } as const;
  const raw = (report.rows[0] as { metricValues?: { value?: unknown }[] })?.metricValues?.[0]?.value;
  if (typeof raw !== 'string' || !/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw))) {
    return { newUsers: null, state: 'invalid_metric' } as const;
  }
  return { newUsers: Number(raw), state: 'reported' } as const;
}

export async function collectAcquisitionReports(request: (source: string, query: unknown) => Promise<TrafficReport>, now = new Date()) {
  const periods = acquisitionPeriods(now), queries = acquisitionReportRequests(now);
  const reports: Record<string, TrafficReport> = {}, unavailable: string[] = [], limited: string[] = [];
  const entries = Object.entries(queries);
  for (let index = 0; index < entries.length; index += 3) {
    await Promise.all(entries.slice(index, index + 3).map(async ([name, query]) => {
      try {
        const report = await request('ga4_organic_acquisition_' + name, query);
        const headers = report.metricHeaders;
        if (!Array.isArray(headers) || headers.length !== 1 || headers[0]?.name !== 'newUsers') throw new Error('metric_schema_mismatch');
        reports[name] = report;
        const metadata = report.metadata;
        if ((report.rowCount || 0) > query.limit || metadata?.subjectToThresholding || metadata?.dataLossFromOtherRow ||
            (Array.isArray(metadata?.samplingMetadatas) && metadata.samplingMetadatas.length) ||
            (metadata?.timeZone && metadata.timeZone !== ACQUISITION_TIME_ZONE)) limited.push(name);
      } catch { unavailable.push(name); }
    }));
  }
  const totals = Object.fromEntries(Object.keys(periods).map(name => [name, { ...acquisitionCount(reports[name]), limited: limited.includes(name) }]));
  return { status: unavailable.length === entries.length ? 'unavailable' : unavailable.length ? 'partial' : 'available',
    definition: ACQUISITION_DEFINITION, timeZone: ACQUISITION_TIME_ZONE, periods, totals, reports, unavailable, limited };
}
