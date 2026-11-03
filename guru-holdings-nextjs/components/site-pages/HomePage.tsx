import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Building2,
  LogIn,
} from 'lucide-react';
import snapshot from '@/data-generated/snapshots/latest.json';
import { ExplorerSearch } from '@/components/explorer/ExplorerSearch';
import { Badge } from '@/components/ui/badge';
import { buildHoldingChangeModel } from '@/lib/holding-change.mjs';
import { getExplorerData } from '@/lib/sec13f-lite';
import {
  directionTextClass,
  getViewFormatters,
} from '@/lib/sec13f-view';
import { localizedPath, translate, type Locale } from '@/lib/i18n/site';
import { stockPath } from '@/lib/stock-routes';

type Manager = typeof snapshot.managers[number];
type ConsensusItem =
  | typeof snapshot.consensus.sharedIncrease[number]
  | typeof snapshot.consensus.sharedDecrease[number];

const managerStatusVariant = (manager: Manager) =>
  manager.latestQuarter === snapshot.latestQuarter ? 'success' as const : 'warning' as const;

const directionalManagers = (item: ConsensusItem, direction: 'increase' | 'decrease') =>
  item.managers.filter((manager) =>
    direction === 'increase'
      ? manager.changeType === 'increase' || manager.changeType === 'new'
      : manager.changeType === 'decrease' || manager.changeType === 'exit'
  );

function ConsensusCard({ item, direction, locale }: { item: ConsensusItem; direction: 'increase' | 'decrease'; locale: Locale }) {
  const rows = directionalManagers(item, direction);
  const { changeName, formatSignedCurrency, formatNumber, formatWeight } = getViewFormatters(locale);
  return (
    <Link href={localizedPath(locale, stockPath(item.companyId))}
      data-analytics-signal={`shared_${direction}`} data-analytics-entity={item.companyId}
      className="block rounded-lg border border-stone-200 bg-white p-4 transition-colors hover:border-primary/50 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-base font-semibold text-slate-950">{item.canonicalName || item.issuerName}</h3>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{item.canonicalTicker || item.rawCusips?.join(', ') || item.cusip}</p>
        </div>
        <Badge variant="outline" className="shrink-0 bg-stone-50 text-xs">{translate(locale, 'common.managerCount', { count: formatNumber(rows.length) })}</Badge>
      </div>
      <div className="mt-3 divide-y divide-stone-100 border-t border-stone-100">
        {rows.slice(0, 2).map(manager => {
          const change = buildHoldingChangeModel(manager);
          return <div key={manager.managerId} className="flex items-center justify-between gap-2 py-2 text-xs">
            <div className="min-w-0">
              <span className="block truncate font-medium text-slate-800">{manager.managerName}</span>
              <span className={direction === 'increase' ? 'text-emerald-700' : 'text-red-700'}>{changeName(change.action)}</span>
            </div>
            <span className="shrink-0 font-mono text-slate-700">
              {change.showWeightTransition ? <>{formatWeight(change.previousWeight)} <ArrowRight className="mx-0.5 inline h-3 w-3" /> {formatWeight(change.currentWeight)}</>
                : <>{translate(locale, 'common.positionWeight')} {formatWeight(change.specialWeight ?? change.currentWeight)}</>}
            </span>
          </div>;
        })}
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 border-t border-stone-100 pt-3 text-xs">
        <span className="text-muted-foreground">{translate(locale, 'common.valueChange')} <span className={'ml-1 font-mono ' + directionTextClass(item.netValueChange)}>{formatSignedCurrency(item.netValueChange)}</span></span>
        <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
      </div>
    </Link>
  );
}

function PositionSignal({ item, kind, locale }: { item: ConsensusItem; kind: 'new' | 'exit'; locale: Locale }) {
  const names = kind === 'new' ? item.newManagers : item.exitManagers;
  return (
    <Link
      href={localizedPath(locale, stockPath(item.companyId))}
      data-analytics-signal={`shared_${kind}`}
      data-analytics-entity={item.companyId}
      className="flex min-w-0 max-w-full items-center justify-between gap-3 overflow-hidden rounded-md border border-stone-200 bg-white px-4 py-3 hover:border-primary/50"
    >
      <div className="min-w-0">
        <div className="truncate font-semibold text-slate-950">{item.canonicalName || item.issuerName}</div>
        <div className="mt-1 truncate text-xs text-muted-foreground">{names.join(' · ')}</div>
      </div>
      <Badge variant={kind === 'new' ? 'info' : 'warning'} className="shrink-0 rounded-sm">
        {translate(locale, kind === 'new' ? 'change.new' : 'change.exit')}
      </Badge>
    </Link>
  );
}

function EmptySignal({ text }: { text: string }) {
  return <div className="rounded-md border border-dashed border-stone-300 px-4 py-5 text-sm leading-6 text-muted-foreground">{text}</div>;
}

function ManagerEntry({ manager, locale }: { manager: Manager; locale: Locale }) {
  const { formatQuarter } = getViewFormatters(locale);
  return <Link href={localizedPath(locale, '/live-13f/' + manager.id)}
    className="group block rounded-lg border border-stone-200 bg-white p-4 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <h3 className="break-words text-sm font-semibold text-slate-950">{manager.displayName}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{manager.leadInvestor}</p>
      </div>
      <Badge variant={managerStatusVariant(manager)} className="shrink-0 rounded-sm text-[10px]">{formatQuarter(manager.latestQuarter)}</Badge>
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      <span className="text-emerald-700">{translate(locale, 'change.increase')} {manager.metrics.changeCounts.increase || 0}</span>
      <span className="text-red-700">{translate(locale, 'change.decrease')} {manager.metrics.changeCounts.decrease || 0}</span>
      <span className="text-slate-600">{translate(locale, 'change.new')} {manager.metrics.changeCounts.new || 0}</span>
      <ArrowRight className="ml-auto h-3.5 w-3.5 text-primary" />
    </div>
  </Link>;
}

export function HomePage({ locale }: { locale: Locale }) {
  const explorerData = getExplorerData();
  const { formatNumber, formatQuarter } = getViewFormatters(locale);
  const topSharedIncrease = snapshot.consensus.sharedIncrease.slice(0, 2);
  const topSharedDecrease = snapshot.consensus.sharedDecrease.slice(0, 2);
  const sharedNew = snapshot.consensus.sharedIncrease.filter((item) => item.newManagers.length >= 2).slice(0, 4);
  const sharedExit = snapshot.consensus.sharedDecrease.filter((item) => item.exitManagers.length >= 2).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-7 lg:py-9">
        <section className="mb-8" aria-label={translate(locale, 'home.search.title')}>
          <ExplorerSearch
            stocks={explorerData.stocks}
            managers={explorerData.managers}
            consensus={explorerData.consensus}
            themes={explorerData.themes}
            stockTotal={explorerData.stockTotal}
            managerTotal={explorerData.managerTotal}
            locale={locale}
            compact
            home
          />
        </section>
        <section data-testid="home-focus" className="mb-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">{translate(locale, 'home.consensus.title')}</h2>
              <p className="mt-2 font-mono text-xs tracking-wide text-muted-foreground">{formatQuarter(snapshot.latestQuarter)}</p>
            </div>
            <Link href={localizedPath(locale, '/live-13f')} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              {translate(locale, 'home.consensus.viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-7 xl:grid-cols-2">
            <div className="min-w-0">
              <div className="mb-3 flex items-center justify-between border-b border-emerald-200 pb-3">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                  <ArrowUpRight className="h-5 w-5 text-emerald-700" />
                  {translate(locale, 'home.sharedIncrease')}
                </h3>
                <Badge variant="success" className="rounded-sm">
                  {translate(locale, 'home.sharedStockCount', { count: formatNumber(snapshot.consensus.sharedIncrease.length) })}
                </Badge>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">{translate(locale, 'home.consensus.showingTop', { shown: formatNumber(topSharedIncrease.length), total: formatNumber(snapshot.consensus.sharedIncrease.length) })}</p>
              <div className="space-y-3">
                {topSharedIncrease.map((item) => <ConsensusCard key={'inc-' + item.companyId} item={item} direction="increase" locale={locale} />)}
              </div>
              <Link href={localizedPath(locale, '/live-13f?view=shared-increase#consensus-results')} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                {translate(locale, 'home.consensus.viewAllIncrease')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="min-w-0">
              <div className="mb-3 flex items-center justify-between border-b border-red-200 pb-3">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                  <ArrowDownRight className="h-5 w-5 text-red-700" />
                  {translate(locale, 'home.sharedDecrease')}
                </h3>
                <Badge variant="destructive" className="rounded-sm">
                  {translate(locale, 'home.sharedStockCount', { count: formatNumber(snapshot.consensus.sharedDecrease.length) })}
                </Badge>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">{translate(locale, 'home.consensus.showingTop', { shown: formatNumber(topSharedDecrease.length), total: formatNumber(snapshot.consensus.sharedDecrease.length) })}</p>
              <div className="space-y-3">
                {topSharedDecrease.map((item) => <ConsensusCard key={'dec-' + item.companyId} item={item} direction="decrease" locale={locale} />)}
              </div>
              <Link href={localizedPath(locale, '/live-13f?view=shared-decrease#consensus-results')} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                {translate(locale, 'home.consensus.viewAllDecrease')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <details data-testid="home-more-signals" className="mb-8 rounded-lg border border-stone-200 bg-white px-5">
          <summary className="cursor-pointer py-4 text-sm font-medium text-slate-600 marker:text-primary">{translate(locale, 'home.moreSignals')}</summary>
        <section className="pb-5 pt-4">
          <h2 className="mb-4 text-xl font-semibold text-slate-950">{translate(locale, 'home.positionSignals')}</h2>
          <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            <div className="min-w-0">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <LogIn className="h-4 w-4 text-cyan-700" />
                {translate(locale, 'home.sharedNew')}
              </h3>
              <div className="min-w-0 space-y-2">
                {sharedNew.map((item) => <PositionSignal key={'new-' + item.companyId} item={item} kind="new" locale={locale} />)}
                {sharedNew.length === 0 && <EmptySignal text={translate(locale, 'home.noSharedNew')} />}
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <ArrowDownRight className="h-4 w-4 text-amber-700" />
                {translate(locale, 'home.sharedExit')}
              </h3>
              <div className="min-w-0 space-y-2">
                {sharedExit.map((item) => <PositionSignal key={'exit-' + item.companyId} item={item} kind="exit" locale={locale} />)}
                {sharedExit.length === 0 && <EmptySignal text={translate(locale, 'home.noSharedExit')} />}
              </div>
            </div>
          </div>
        </section>

        </details>

        <section id="tracked-managers" className="mb-10 scroll-mt-64 sm:scroll-mt-40">
          <div className="mb-4 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold text-slate-950">{translate(locale, 'home.popularManagers')}</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {snapshot.managers.slice(0, 6).map(manager => <ManagerEntry key={manager.id} manager={manager} locale={locale} />)}
          </div>
          <details data-testid="home-more-managers" className="mt-4">
            <summary className="w-fit cursor-pointer py-2 text-sm font-medium text-primary">{translate(locale, 'home.managers.more', { count: snapshot.managers.length - 6 })}</summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {snapshot.managers.slice(6).map(manager => <ManagerEntry key={manager.id} manager={manager} locale={locale} />)}
            </div>
          </details>
        </section>

      </div>
    </div>
  );
}
