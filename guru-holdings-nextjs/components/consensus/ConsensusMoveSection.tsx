import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Scale,
} from 'lucide-react';
import snapshot from '@/data-generated/snapshots/latest.json';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildHoldingChangeModel } from '@/lib/holding-change.mjs';
import { consensusViewPath, type ConsensusView } from '@/lib/consensus-view';
import { localizedPath, translate, type Locale } from '@/lib/i18n/site';
import {
  changeBadgeVariant,
  directionTextClass,
  getViewFormatters,
} from '@/lib/sec13f-view';
import { stockPath } from '@/lib/stock-routes';

type Snapshot = typeof snapshot;
export type ConsensusItem = Snapshot['consensus']['divergent'][number];
type ConsensusManager = ConsensusItem['managers'][number];
type MoveDirection = 'increase' | 'decrease' | 'divergent';

const isIncrease = (manager: ConsensusManager) =>
  manager.changeType === 'increase' || manager.changeType === 'new';

const isDecrease = (manager: ConsensusManager) =>
  manager.changeType === 'decrease' || manager.changeType === 'exit';

function directionalManagers(item: ConsensusItem, direction: MoveDirection) {
  if (direction === 'increase') return item.managers.filter(isIncrease);
  if (direction === 'decrease') return item.managers.filter(isDecrease);
  return [...item.managers.filter(isIncrease), ...item.managers.filter(isDecrease)];
}

function viewForDirection(direction: MoveDirection): ConsensusView {
  if (direction === 'increase') return 'shared-increase';
  if (direction === 'decrease') return 'shared-decrease';
  return 'divergent';
}

function directionIcon(direction: MoveDirection) {
  if (direction === 'increase') return ArrowUpRight;
  if (direction === 'decrease') return ArrowDownRight;
  return Scale;
}

function directionClasses(direction: MoveDirection) {
  if (direction === 'increase') return { icon: 'text-emerald-700', border: 'border-emerald-200', accent: 'bg-emerald-700' };
  if (direction === 'decrease') return { icon: 'text-red-700', border: 'border-red-200', accent: 'bg-red-700' };
  return { icon: 'text-amber-700', border: 'border-amber-200', accent: 'bg-amber-600' };
}

export function ConsensusViewNav({ locale, activeView }: { locale: Locale; activeView: ConsensusView }) {
  const options = [
    { view: 'shared-increase' as const, label: translate(locale, 'home.sharedIncrease'), count: snapshot.consensus.sharedIncrease.length, icon: ArrowUpRight, tone: 'text-emerald-700' },
    { view: 'shared-decrease' as const, label: translate(locale, 'home.sharedDecrease'), count: snapshot.consensus.sharedDecrease.length, icon: ArrowDownRight, tone: 'text-red-700' },
    { view: 'divergent' as const, label: translate(locale, 'live.divergent'), count: snapshot.consensus.divergent.length, icon: Scale, tone: 'text-amber-700' },
  ];

  return (
    <nav aria-label={translate(locale, 'live.consensusNav')} className="grid gap-2 sm:grid-cols-3">
      {options.map(({ view, label, count, icon: Icon, tone }) => {
        const active = activeView === view;
        return (
          <Link
            key={view}
            href={localizedPath(locale, consensusViewPath(view))}
            aria-current={active ? 'page' : undefined}
            className={`flex min-h-12 items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm transition-colors ${
              active ? 'border-slate-900 bg-slate-950 text-white' : 'border-stone-200 bg-white text-slate-800 hover:border-slate-400 hover:bg-stone-50'
            }`}
          >
            <span className="flex min-w-0 items-center gap-2 font-medium">
              <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : tone}`} aria-hidden="true" />
              <span className="truncate">{label}</span>
            </span>
            <span className={`shrink-0 font-mono text-sm font-semibold ${active ? 'text-white' : tone}`}>{count}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function ConsensusMoveSection({
  title,
  description,
  items,
  direction,
  locale,
  page = 1,
  pageSize,
  showViewAll = false,
}: {
  title: string;
  description: string;
  items: ConsensusItem[];
  direction: MoveDirection;
  locale: Locale;
  page?: number;
  pageSize?: number;
  showViewAll?: boolean;
}) {
  const Icon = directionIcon(direction);
  const classes = directionClasses(direction);
  const totalPages = pageSize ? Math.max(1, Math.ceil(items.length / pageSize)) : 1;
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const visibleItems = pageSize
    ? items.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : items;
  const view = viewForDirection(direction);

  return (
    <section
      id={`${view}-results`}
      data-consensus-view={view}
      data-consensus-total={items.length}
      aria-labelledby={`${view}-title`}
      className="scroll-mt-32"
    >
      <div className={`mb-4 border-b pb-4 ${classes.border}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={`${view}-title`} className="flex items-center gap-2 text-xl font-semibold text-slate-950 sm:text-2xl">
              <Icon className={`h-5 w-5 shrink-0 ${classes.icon}`} aria-hidden="true" />
              {title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          <Badge variant={direction === 'increase' ? 'success' : direction === 'decrease' ? 'destructive' : 'warning'} className="rounded-sm">
            {translate(locale, 'live.matchedCompanies', { count: items.length })}
          </Badge>
        </div>
        <div className={`mt-3 h-1 w-12 ${classes.accent}`} aria-hidden="true" />
      </div>

      <div className="space-y-3">
        {visibleItems.map((item) => (
          <ConsensusMoveCard key={`${view}-${item.companyId}`} item={item} direction={direction} locale={locale} />
        ))}
        {visibleItems.length === 0 && (
          <div className="rounded-md border border-dashed border-stone-300 bg-white p-5 text-sm text-muted-foreground">
            {translate(locale, 'live.noConsensus')}
          </div>
        )}
      </div>

      {showViewAll && items.length > visibleItems.length && (
        <Link href={localizedPath(locale, consensusViewPath(view))} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          {translate(locale, 'live.viewAll', { count: items.length })}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}

      {pageSize && !showViewAll && totalPages > 1 && (
        <nav aria-label={translate(locale, 'live.pagination')} className="mt-5 flex items-center justify-between gap-3 border-t border-stone-200 pt-4">
          {currentPage > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={localizedPath(locale, consensusViewPath(view, currentPage - 1))}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {translate(locale, 'live.previousPage')}
              </Link>
            </Button>
          ) : <span />}
          <span className="font-mono text-xs text-muted-foreground">
            {translate(locale, 'live.pageCount', { current: currentPage, total: totalPages })}
          </span>
          {currentPage < totalPages ? (
            <Button asChild variant="outline" size="sm">
              <Link href={localizedPath(locale, consensusViewPath(view, currentPage + 1))}>
                {translate(locale, 'live.nextPage')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : <span />}
        </nav>
      )}
    </section>
  );
}

function ConsensusMoveCard({ item, direction, locale }: { item: ConsensusItem; direction: MoveDirection; locale: Locale }) {
  const rows = directionalManagers(item, direction);
  const {
    changeName,
    formatNumber,
    formatPercent,
    formatPercentagePoints,
    formatSignedCurrency,
    formatSignedNumber,
    formatWeight,
  } = getViewFormatters(locale);
  const increaseCount = item.managers.filter(isIncrease).length;
  const decreaseCount = item.managers.filter(isDecrease).length;
  const title = item.canonicalName || item.issuerName;

  return (
    <article
      data-consensus-company={item.companyId}
      className="overflow-hidden rounded-md border border-stone-200 bg-white"
    >
      <div className="grid gap-4 border-b border-stone-100 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={localizedPath(locale, stockPath(item.companyId))} className="break-words text-base font-semibold text-slate-950 hover:text-primary hover:underline">
              {title}
            </Link>
            {item.divergent && (
              <Badge variant="warning" className="rounded-sm">
                {translate(locale, 'live.divergent')}
              </Badge>
            )}
          </div>
          <div className="mt-1 font-mono text-xs text-muted-foreground">
            {item.canonicalTicker || item.rawCusips?.join(', ') || item.cusip}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{translate(locale, 'common.managerCount', { count: rows.length })}</span>
            {item.divergent && <span className="text-emerald-700">{translate(locale, 'live.increaseManagerCount', { count: increaseCount })}</span>}
            {item.divergent && <span className="text-red-700">{translate(locale, 'live.decreaseManagerCount', { count: decreaseCount })}</span>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-left lg:text-right">
          <div>
            <div className="text-[11px] text-muted-foreground">{translate(locale, 'common.shareChange')}</div>
            <div className={`mt-1 font-mono text-sm font-semibold ${directionTextClass(item.netShareChange)}`}>
              {formatSignedNumber(item.netShareChange)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground">{translate(locale, 'live.disclosedValueChange')}</div>
            <div className={`mt-1 font-mono text-sm font-semibold ${directionTextClass(item.netValueChange)}`}>
              {formatSignedCurrency(item.netValueChange)}
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-stone-100">
        {rows.map((manager, index) => {
          const model = buildHoldingChangeModel(manager);
          const startsDecreaseGroup = direction === 'divergent' && index > 0 && isDecrease(manager) && isIncrease(rows[index - 1]);
          return (
            <div key={`${item.companyId}-${manager.managerId}`}>
              {direction === 'divergent' && (index === 0 || startsDecreaseGroup) && (
                <div className={`px-4 py-2 text-xs font-semibold ${isIncrease(manager) ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                  {isIncrease(manager) ? translate(locale, 'home.sharedIncrease') : translate(locale, 'home.sharedDecrease')}
                </div>
              )}
              <div className="grid gap-3 px-4 py-3 sm:grid-cols-[minmax(140px,1fr)_auto_minmax(190px,1.15fr)_minmax(190px,1.15fr)] sm:items-center">
                <Link href={localizedPath(locale, `/live-13f/${manager.managerId}`)} className="min-w-0 break-words text-sm font-medium text-slate-900 hover:text-primary hover:underline">
                  {manager.managerName}
                </Link>
                <Badge variant={changeBadgeVariant(manager.changeType)} className="w-fit rounded-sm">
                  {changeName(manager.changeType)}
                </Badge>
                <div>
                  <div className="text-[11px] text-muted-foreground">{translate(locale, 'live.shareMove')}</div>
                  <div className="mt-1 font-mono text-xs text-slate-800">
                    {formatNumber(model.previousShares || 0)} <ArrowRight className="mx-1 inline h-3 w-3" aria-hidden="true" /> {formatNumber(model.currentShares || 0)}
                  </div>
                  <div className={`mt-1 font-mono text-xs font-semibold ${directionTextClass(model.shareDelta || 0)}`}>
                    {formatSignedNumber(model.shareDelta || 0)} · {formatPercent(model.shareDeltaPercent)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">{translate(locale, 'live.weightMove')}</div>
                  <div className="mt-1 font-mono text-xs text-slate-800">
                    {formatWeight(model.previousWeight)} <ArrowRight className="mx-1 inline h-3 w-3" aria-hidden="true" /> {formatWeight(model.currentWeight)}
                  </div>
                  <div className={`mt-1 font-mono text-xs font-semibold ${directionTextClass(model.weightDelta || 0)}`}>
                    {formatPercentagePoints(model.weightDelta)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-stone-100 bg-stone-50 px-4 py-2 text-[11px] leading-5 text-muted-foreground">
        {translate(locale, 'live.valueChangeDisclaimer')}
      </div>
    </article>
  );
}
