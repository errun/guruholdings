import { RESEARCH_EVENTS } from '../research-analytics';

// Relative dates use the GA4 property's timezone and do not inherit GSC's longer final-data lag.
export const RESEARCH_PERIODS = [
  { startDate: '7daysAgo', endDate: 'yesterday' },
  { startDate: '14daysAgo', endDate: '8daysAgo' },
];

export function researchRealtimeRequest() {
  return {
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: { filter: { fieldName: 'eventName', inListFilter: { values: [...RESEARCH_EVENTS] } } },
    limit: '100',
  };
}

// Built-in dimensions only: the existing read-only grant can read event totals
// without creating GA4 custom dimensions or requesting administrative access.
export function researchReportRequest(range: { startDate: string; endDate: string }) {
  return {
    dateRanges: [range],
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
    dimensionFilter: { andGroup: { expressions: [
      { filter: { fieldName: 'hostName', inListFilter: { values: ['guruholdings.net', 'www.guruholdings.net'] } } },
      { filter: { fieldName: 'eventName', inListFilter: { values: [...RESEARCH_EVENTS] } } },
    ] } },
    limit: 100,
  };
}

// Bounded daily aggregates allow before/after comparisons around a release,
// without identifiers, query strings or GA4 administrative permissions.
export function releaseFollowupRequests() {
  const dateRanges = [{ startDate: '14daysAgo', endDate: 'yesterday' }];
  const expressions = [
    { filter: { fieldName: 'hostName', inListFilter: { values: ['guruholdings.net', 'www.guruholdings.net'] } } },
    { notExpression: { filter: { fieldName: 'sessionSource', stringFilter: { matchType: 'BEGINS_WITH', value: 'codex_', caseSensitive: false } } } },
  ];
  return {
    engagement: { dateRanges, dimensions: [{ name: 'date' }, { name: 'newVsReturning' }, { name: 'deviceCategory' }],
      metrics: ['sessions', 'engagedSessions', 'screenPageViews', 'userEngagementDuration'].map(name => ({ name })),
      dimensionFilter: { andGroup: { expressions } }, limit: 500 },
    events: { dateRanges, dimensions: [{ name: 'date' }, { name: 'eventName' }],
      metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
      dimensionFilter: { andGroup: { expressions: [...expressions,
        { filter: { fieldName: 'eventName', inListFilter: { values: [...RESEARCH_EVENTS] } } },
      ] } }, limit: 500 },
  };
}
