import { RESEARCH_EVENTS } from '../research-analytics';

// Relative dates use the GA4 property's timezone and do not inherit GSC's longer final-data lag.
export const RESEARCH_PERIODS = [
  { startDate: '7daysAgo', endDate: 'yesterday' },
  { startDate: '14daysAgo', endDate: '8daysAgo' },
];

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
