import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Building2,
  LogIn,
  Search,
} from 'lucide-react';
import snapshot from '@/data-generated/snapshots/latest.json';
import { ExplorerSearchDisclosure } from '@/components/explorer/ExplorerSearchDisclosure';
import { SignalHero } from '@/components/signals/SignalHero';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildHoldingChangeModel } from '@/lib/holding-change.mjs';
import { getCompanyMarketCaps, type CompanyMarketCap } from '@/lib/market-data';
import { getExplorerData } from '@/lib/sec13f-lite';
import {
  directionTextClass,
  getViewFormatters,
} from '@/lib/sec13f-view';
import { localizedPath, translate, type Locale } from '@/lib/i18n/site';
import { getManagerPortfolioChange, formatManagerPortfolioChange } from '@/lib/manager-portfolio';
import { getSignalItems } from '@/lib/signals';
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

function ConsensusCard({
  item,
  direction,
  locale,
  marketCap,
}: {
  item: ConsensusItem;
  direction: 'increase' | 'decrease';
  locale: Locale;
  marketCap?: CompanyMarketCap;
}) {
  const rows = directionalManagers(item, direction);
  const Icon = direction === 'increase' ? ArrowUpRight : ArrowDownRight;
  const title = item.canonicalName || item.issuerName;
  const {
    changeName,
    formatCurrency,
    formatDateTime,
    formatSignedCurrency,
    formatNumber,
    formatWeight,
  } = getViewFormatters(locale);

  return (
    <Link
      href={localizedPath(locale, stockPath(item.companyId))}
      className="block rounded-md border border-stone-200 bg-white p-4 transition-colors hover:border-primary/50 hover:bg-stone-50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon className={direction === 'increase' ? 'h-4 w-4 text-emerald-700' : 'h-4 w-4 text-red-700'} />
            <h3 className="break-words text-base font-semibold text-slate-950">{title}</h3>
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {item.canonicalTicker || item.rawCusips?.join(', ') || item.cusip}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {translate(locale, 'stock.companyMarketCap')}: {' '}
            <span className="font-mono font-semibold text-slate-900">
              {marketCap?.status === 'available' ? formatCurrency(marketCap.value) : translate(locale, 'stock.marketCap.unavailable')}
            </span>
            {marketCap?.status === 'available' && (
              <span className="ml-1">
                {translate(locale, 'stock.marketCap.shortSource', {
                  source: marketCap.sourceName,
                  date: formatDateTime(marketCap.retrievedAt),
                })}
              </span>
            )}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xs text-muted-foreground">{translate(locale, 'common.valueChange')}</div>
          <div className={'font-mono text-sm font-semibold ' + directionTextClass(item.netValueChange)}>
            {formatSignedCurrency(item.netValueChange)}
          </div>
        </div>
      </div>

      <div className="mt-4 divide-y divide-stone-100 border-t border-stone-100">
        {rows.map((manager) => {
          const change = buildHoldingChangeModel(manager);
          return (
            <div key={item.companyId + '-' + manager.managerId} className="grid gap-2 py-3 text-sm sm:grid-cols-[minmax(130px,1fr)_minmax(190px,1.2fr)_auto] sm:items-center">
              <div className="min-w-0">
                <div className="truncate font-medium text-slate-900">{manager.managerName}</div>
                <Badge variant={changeBadgeVariantForAction(change.action)} className="mt-1 rounded-sm px-1.5 py-0 text-[11px]">
                  {changeName(change.action)}
                </Badge>
              </div>
              <div className="font-mono text-xs text-slate-700">
                {change.showWeightTransition ? (
                  <span>
                    {formatWeight(change.previousWeight)} <ArrowRight className="mx-1 inline h-3 w-3" /> {formatWeight(change.currentWeight)}
                  </span>
                ) : (
                  <span className="font-semibold text-slate-900">
                    {translate(locale, 'common.positionWeight')}: {formatWeight(change.specialWeight ?? change.currentWeight)}
                  </span>
                )}
              </div>
              <div className={'font-mono text-xs font-semibold sm:text-right ' + directionTextClass(manager.valueChange || 0)}>
                {formatSignedCurrency(manager.valueChange || 0)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>{translate(locale, 'common.managerCount', { count: formatNumber(rows.length) })}</span>
        <ArrowRight className="h-4 w-4 text-primary" />
      </div>
    </Link>
  );
}

function changeBadgeVariantForAction(action: string) {
  if (action === 'new') return 'info' as const;
  if (action === 'exit') return 'warning' as const;
  if (action === 'increase') return 'success' as const;
  if (action === 'decrease') return 'destructive' as const;
  return 'secondary' as const;
}

function PositionSignal({ item, kind, locale }: { item: ConsensusItem; kind: 'new' | 'exit'; locale: Locale }) {
  const names = kind === 'new' ? item.newManagers : item.exitManagers;
  return (
    <Link
      href={localizedPath(locale, stockPath(item.companyId))}
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

function ManagerPortfolioMini({ manager, locale }: { manager: Manager; locale: Locale }) {
  const change = getManagerPortfolioChange(manager);
  const formatted = formatManagerPortfolioChange(change, locale);
  if (!formatted || change.status !== 'available') return null;

  return (
    <div className="mb-3 w-full rounded-md border border-stone-200 bg-stone-50 p-3">
      <div className="text-xs font-medium text-muted-foreground">{translate(locale, 'home.managerPortfolioChange')}</div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-mono text-base font-semibold text-slate-950">{formatted.currentValue}</span>
        <span className={`font-mono text-xs font-semibold ${change.toneClass}`}>
          {formatted.valueDelta} / {formatted.percentDelta}
        </span>
      </div>
      <div className="mt-1 text-[11px] leading-4 text-muted-foreground">
        {translate(locale, 'home.managerPortfolioChangeNote', {
          current: formatted.currentQuarter,
          previous: formatted.previousQuarter,
        })}
      </div>
    </div>
  );
}

export async function HomePage({ locale }: { locale: Locale }) {
  const explorerData = getExplorerData();
  const { formatNumber, formatQuarter } = getViewFormatters(locale);
  const allSignals = getSignalItems('all');
  const topSharedIncrease = snapshot.consensus.sharedIncrease.slice(0, 4);
  const topSharedDecrease = snapshot.consensus.sharedDecrease.slice(0, 4);
  const marketCaps = await getCompanyMarketCaps([
    ...topSharedIncrease.map((item) => item.companyId),
    ...topSharedDecrease.map((item) => item.companyId),
  ]);
  const sharedNew = snapshot.consensus.sharedIncrease.filter((item) => item.newManagers.length >= 2).slice(0, 4);
  const sharedExit = snapshot.consensus.sharedDecrease.filter((item) => item.exitManagers.length >= 2).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <SignalHero locale={locale} signals={allSignals} />

      <div className="container py-7 lg:py-9">
        <section className="mb-10">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">{translate(locale, 'home.consensus.title')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{formatQuarter(snapshot.latestQuarter)}</p>
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
                {topSharedIncrease.map((item) => <ConsensusCard key={'inc-' + item.companyId} item={item} direction="increase" locale={locale} marketCap={marketCaps.get(item.companyId)} />)}
              </div>
              <Link href={localizedPath(locale, '/live-13f?mode=increase')} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
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
                {topSharedDecrease.map((item) => <ConsensusCard key={'dec-' + item.companyId} item={item} direction="decrease" locale={locale} marketCap={marketCaps.get(item.companyId)} />)}
              </div>
              <Link href={localizedPath(locale, '/live-13f?mode=decrease')} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                {translate(locale, 'home.consensus.viewAllDecrease')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-10 border-y border-stone-200 py-6">
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

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold text-slate-950">{translate(locale, 'home.popularManagers')}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {snapshot.managers.map((manager) => (
              <Link key={manager.id} href={localizedPath(locale, '/live-13f/' + manager.id)} className="group block">
                <Card className="h-full border-stone-200 bg-white transition-colors group-hover:border-primary/40">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="break-words text-base leading-tight">{manager.displayName}</CardTitle>
                        <CardDescription className="mt-1">{manager.leadInvestor}</CardDescription>
                      </div>
                      <Badge variant={managerStatusVariant(manager)} className="rounded-sm">{formatQuarter(manager.latestQuarter)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2 p-5 pt-0 text-xs">
                    <ManagerPortfolioMini manager={manager} locale={locale} />
                    <Badge variant="success" className="rounded-sm">{translate(locale, 'change.increase')} {manager.metrics.changeCounts.increase || 0}</Badge>
                    <Badge variant="destructive" className="rounded-sm">{translate(locale, 'change.decrease')} {manager.metrics.changeCounts.decrease || 0}</Badge>
                    <Badge variant="info" className="rounded-sm">{translate(locale, 'change.new')} {manager.metrics.changeCounts.new || 0}</Badge>
                    <span className="ml-auto inline-flex items-center gap-1 font-medium text-primary group-hover:underline">
                      {translate(locale, 'home.openManager')} <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-stone-200 pt-7">
          <div className="mb-3 flex items-center gap-2">
            <Search className="h-5 w-5 text-slate-700" />
            <h2 className="text-xl font-semibold text-slate-950">{translate(locale, 'search.title')}</h2>
          </div>
          <ExplorerSearchDisclosure
            stocks={explorerData.stocks}
            managers={explorerData.managers}
            consensus={explorerData.consensus}
            themes={explorerData.themes}
            stockTotal={explorerData.stockTotal}
            managerTotal={explorerData.managerTotal}
            locale={locale}
          />
        </section>
      </div>
    </div>
  );
}
