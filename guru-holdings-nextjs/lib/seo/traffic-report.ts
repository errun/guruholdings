// Fixed aggregate queries, without identifiers, free-text searches or query strings.
export function trafficReportRequests() {
  const dateRanges = [{ startDate: '28daysAgo', endDate: 'yesterday' }];
  const dimensionFilter = { andGroup: { expressions: [
    { filter: { fieldName: 'hostName', inListFilter: { values: ['guruholdings.net', 'www.guruholdings.net'] } } },
    { notExpression: { filter: { fieldName: 'sessionSource', stringFilter: { matchType: 'BEGINS_WITH', value: 'codex_', caseSensitive: false } } } },
  ] } };
  const sessions = ['sessions', 'engagedSessions', 'screenPageViews', 'userEngagementDuration'];
  const query = (dimensions: string[], metrics = sessions, limit = 100) => ({
    dateRanges, dimensionFilter, dimensions: dimensions.map(name => ({ name })),
    metrics: metrics.map(name => ({ name })), limit,
    orderBys: [{ metric: { metricName: metrics[0] }, desc: true }],
  });
  return {
    totals: query([], sessions, 1),
    sources: query(['sessionSourceMedium', 'sessionDefaultChannelGroup']),
    geography: query(['sessionSourceMedium', 'country', 'deviceCategory']),
    landing: query(['sessionSourceMedium', 'landingPage'], sessions, 200),
    dailySources: query(['date', 'sessionSourceMedium'], sessions, 200),
    technology: query(['browser', 'operatingSystem', 'deviceCategory']),
    events: query(['eventName', 'sessionSourceMedium'], ['eventCount', 'totalUsers', 'userEngagementDuration'], 200),
  };
}

export type TrafficReport = {
  rows?: unknown[]; rowCount?: number; metadata?: Record<string, unknown>; [key: string]: unknown;
};

export async function collectTrafficReports(request: (source: string, query: unknown) => Promise<TrafficReport>) {
  const reports: Record<string, TrafficReport> = {};
  const unavailable: string[] = [];
  const limited: string[] = [];
  const entries = Object.entries(trafficReportRequests());
  // Bound concurrent calls, preserve independent successes and never serialize SDK errors.
  for (let i = 0; i < entries.length; i += 3) {
    await Promise.all(entries.slice(i, i + 3).map(async ([name, query]) => {
      try {
        const report = await request('ga4_traffic_' + name, query);
        reports[name] = report;
        const metadata = report.metadata;
        if ((report.rowCount || 0) > query.limit || metadata?.subjectToThresholding ||
            metadata?.dataLossFromOtherRow || (Array.isArray(metadata?.samplingMetadatas) && metadata.samplingMetadatas.length)) limited.push(name);
      } catch { unavailable.push(name); }
    }));
  }
  return { status: unavailable.length === entries.length ? 'unavailable' : unavailable.length ? 'partial' : 'available',
    dateRange: { startDate: '28daysAgo', endDate: 'yesterday' }, reports, unavailable, limited };
}
