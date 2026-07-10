export const consensusViews = ['overview', 'shared-increase', 'shared-decrease', 'divergent'] as const;

export type ConsensusView = (typeof consensusViews)[number];
type FocusedConsensusView = Exclude<ConsensusView, 'overview'>;
export type SearchParamsRecord = Record<string, string | string[] | undefined>;

const focusedConsensusViews: readonly FocusedConsensusView[] = [
  'shared-increase',
  'shared-decrease',
  'divergent',
];

export function normalizeConsensusView(value: string | string[] | undefined | null): ConsensusView {
  const candidate = Array.isArray(value) ? value[0] : value;
  return consensusViews.includes(candidate as ConsensusView) ? candidate as ConsensusView : 'overview';
}

export function normalizeConsensusPage(value: string | string[] | undefined | null): number {
  const candidate = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(candidate || '1', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function consensusViewPath(view: ConsensusView, page = 1): string {
  if (view === 'overview') return '/live-13f#consensus-results';
  const params = new URLSearchParams({ view });
  if (page > 1) params.set('page', String(page));
  return `/live-13f?${params.toString()}#consensus-results`;
}

export function legacyModeToConsensusView(value: string | string[] | undefined | null): ConsensusView | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (candidate === 'increase') return 'shared-increase';
  if (candidate === 'decrease') return 'shared-decrease';
  return null;
}

export function legacyConsensusRedirect(
  pathname: string,
  searchParams: SearchParamsRecord | undefined,
): string | null {
  const legacyView = legacyModeToConsensusView(searchParams?.mode);
  if (!legacyView) return null;

  const params = new URLSearchParams();
  for (const [key, rawValue] of Object.entries(searchParams || {})) {
    if (key === 'mode' || rawValue === undefined) continue;
    for (const value of Array.isArray(rawValue) ? rawValue : [rawValue]) params.append(key, value);
  }

  const explicitView = normalizeConsensusView(searchParams?.view);
  params.set(
    'view',
    explicitView !== 'overview' && focusedConsensusViews.includes(explicitView)
      ? explicitView
      : legacyView,
  );
  return `${pathname}?${params.toString()}#consensus-results`;
}
