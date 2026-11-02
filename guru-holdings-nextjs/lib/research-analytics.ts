import { GA_MEASUREMENT_ID } from './analytics';

export const RESEARCH_EVENTS = [
  'research_section_view', 'signal_view', 'signal_select', 'research_navigation',
  'search_results', 'search_no_results', 'search_result_select',
  'compare_start', 'compare_results', 'compare_result_select',
  'history_quarter_change', 'history_details_open', 'chart_interact',
] as const;
export type ResearchEvent = (typeof RESEARCH_EVENTS)[number];
type Params = Record<string, string | number | boolean | undefined>;
export type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  __guruAnalyticsInitialized?: boolean;
};
const token = /^[a-z0-9][a-z0-9_-]{0,79}$/i;
const tokens = new Set(['section', 'signal_type', 'entity_id', 'manager_id', 'target_type', 'target_id',
  'result_type', 'query_state', 'change_type', 'concentration', 'quarter', 'interaction']);
const counts = new Set(['result_count', 'stock_results', 'manager_results', 'signal_results',
  'selected_count', 'shared_holdings', 'shared_increases', 'shared_decreases']);
const flags = new Set(['has_manager', 'has_theme']);

export function researchContext(pathname: string) {
  const parts = pathname.split(/[?#]/, 1)[0].split('/').filter(Boolean);
  const locale = ['zh', 'ja', 'ko', 'en'].includes(parts[0]) ? parts.shift()! : 'en';
  const pageType = parts.length === 0 ? 'home'
    : parts[0] === 'stocks' && parts.length === 2 ? 'stock'
    : parts[0] === 'live-13f' && parts.length === 2 ? 'manager'
    : parts[0] === 'live-13f' && parts.length === 1 ? 'signals' : 'other';
  return { page_type: pageType, page_locale: locale,
    ...(parts[1] && token.test(parts[1]) && ['stock', 'manager'].includes(pageType) ? { page_entity: parts[1] } : {}) };
}

// Only public entity identifiers, bounded counts and controlled categories may leave the browser.
// Free-text queries, full URLs and user identifiers are absent from this schema.
export function researchPayload(pathname: string, params: Params = {}) {
  const safe: Record<string, string | number | boolean> = { ...researchContext(pathname), measurement_version: 1 };
  for (const [key, value] of Object.entries(params)) {
    if (tokens.has(key) && typeof value === 'string' && token.test(value)) safe[key] = value;
    if (counts.has(key) && typeof value === 'number' && Number.isFinite(value) && value >= 0) safe[key] = Math.min(100_000, Math.floor(value));
    if (flags.has(key) && typeof value === 'boolean') safe[key] = value;
  }
  return safe;
}

export function trackResearch(name: ResearchEvent, params: Params = {}): boolean {
  if (typeof window === 'undefined' || document.visibilityState === 'hidden') return false;
  const analytics = window as AnalyticsWindow;
  if (typeof analytics.gtag !== 'function') return false;
  try {
    analytics.gtag('event', name, { ...researchPayload(window.location.pathname, params),
      send_to: GA_MEASUREMENT_ID, page_location: window.location.origin + window.location.pathname });
    return true;
  } catch { return false; }
}
