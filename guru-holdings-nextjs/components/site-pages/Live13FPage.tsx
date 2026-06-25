import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Database,
  ExternalLink,
  FileCheck2,
  Layers3,
} from 'lucide-react';
import snapshot from '@/data-generated/snapshots/latest.json';
import { ExplorerSearch } from '@/components/explorer/ExplorerSearch';
import { ManagerCompare } from '@/components/explorer/ManagerCompare';
import { FilingFreshnessStrip } from '@/components/signals/FilingFreshnessStrip';
import { SecSourceTrustBlock } from '@/components/signals/SecSourceTrustBlock';
import { SignalFeed } from '@/components/signals/SignalFeed';
import { SignalModeTabs } from '@/components/signals/SignalModeTabs';
import { SignalSearchBox } from '@/components/signals/SignalSearchBox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  changeBadgeVariant,
  directionTextClass,
  getViewFormatters,
} from '@/lib/sec13f-view';
import { getExplorerData, getManagerCompareData } from '@/lib/sec13f-lite';
import { localizedPath, translate, type Locale } from '@/lib/i18n/site';
import { getSignalCounts, getSignalItems, type SignalMode } from '@/lib/signals';
import { stockPath } from '@/lib/stock-routes';

type Snapshot = typeof snapshot;
type Manager = Snapshot['managers'][number];
type ConsensusItem =
  | Snapshot['consensus']['sharedIncrease'][number]
  | Snapshot['consensus']['sharedDecrease'][number];

const managerStatusVariant = (manager: Manager) =>
  manager.latestQuarter === snapshot.latestQuarter ? 'success' as const : 'warning' as const;

const directionalManagers = (item: ConsensusItem, direction: 'increase' | 'decrease') =>
  item.managers.filter((manager) =>
    direction === 'increase'
      ? manager.changeType === 'increase' || manager.changeType === 'new'
      : manager.changeType === 'decrease' || manager.changeType === 'exit'
  );

function ConsensusTable({
  title,
  description,
  items,
  direction,
  locale,
}: {
  title: string;
  description: string;
  items: ConsensusItem[];
  direction: 'increase' | 'decrease';
  locale: Locale;
}) {
  const Icon = direction === 'increase' ? ArrowUpRight : ArrowDownRight;
  const iconClass = direction === 'increase' ? 'text-emerald-700' : 'text-red-700';
  const { changeName, formatPercent, formatSignedCurrency } = getViewFormatters(locale);

  return (
    <Card className="border-stone-200 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Icon className={`h-5 w-5 ${iconClass}`} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-y border-stone-200 bg-stone-100 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{translate(locale, 'common.company')}</th>
                <th className="px-4 py-3">{translate(locale, 'common.involvedManagers')}</th>
                <th className="px-4 py-3 text-right">{translate(locale, 'common.valueChange')}</th>
                <th className="px-4 py-3 text-right">{translate(locale, 'common.weightChange')}</th>
                <th className="px-4 py-3">{translate(locale, 'common.details')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items.map((item) => {
                const rows = directionalManagers(item, direction);
                return (
                  <tr key={`${direction}-${item.companyId}`} className="align-top hover:bg-stone-50">
                    <td className="px-4 py-4">
                      <Link href={localizedPath(locale, stockPath(item.companyId))} className="font-semibold text-slate-950 hover:text-primary hover:underline">
                        {item.canonicalName || item.issuerName}
                      </Link>
                      <div className="mt-1 font-mono text-xs text-muted-foreground">{item.rawCusips?.join(', ') || item.cusip}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex max-w-[280px] flex-wrap gap-1.5">
                        {rows.map((manager) => (
                          <Badge key={`${item.companyId}-${manager.managerId}`} variant="outline" className="rounded-md border-stone-300 bg-white text-slate-700">
                            {manager.managerName}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className={`px-4 py-4 text-right font-mono font-semibold ${directionTextClass(item.netValueChange)}`}>
                      {formatSignedCurrency(item.netValueChange)}
                    </td>
                    <td className={`px-4 py-4 text-right font-mono font-semibold ${directionTextClass(item.netWeightChange)}`}>
                      {formatPercent(item.netWeightChange)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1.5">
                        {rows.map((manager) => (
                          <div key={`${item.companyId}-${manager.managerId}-detail`} className="grid grid-cols-[1fr_auto_auto] gap-2 text-xs">
                            <span className="break-words text-slate-700">{changeName(manager.changeType)}</span>
                            <span className="font-mono text-slate-700">{formatSignedCurrency(manager.valueChange)}</span>
                            <span className="font-mono text-muted-foreground">{formatPercent(manager.weightChange)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function Live13FPage({
  locale,
  signalMode = 'all',
  initialQuery = '',
}: {
  locale: Locale;
  signalMode?: SignalMode;
  initialQuery?: string;
}) {
  const explorerData = getExplorerData();
  const {
    concentrationName,
    formatDate,
    formatNumber,
    formatPercent,
    formatQuarter,
    formatSignedCurrency,
    formatWeight,
    themeName,
  } = getViewFormatters(locale);
  const managerCompareData = getManagerCompareData();
  const sharedIncrease = snapshot.consensus.sharedIncrease;
  const sharedDecrease = snapshot.consensus.sharedDecrease;
  const themeChanges = snapshot.consensus.themeChanges;
  const allSignals = getSignalItems('all');
  const filteredSignals = signalMode === 'all' ? allSignals : getSignalItems(signalMode);
  const signalCounts = getSignalCounts(allSignals);

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-stone-200 bg-white">
        <div className="container py-8 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="max-w-4xl">
              <Badge variant="info" className="mb-4 rounded-sm">
                {translate(locale, 'signal.hero.badge')}
              </Badge>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {translate(locale, 'live.title')}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                {translate(locale, 'signal.dashboard.description')}
              </p>
              <div className="mt-5 max-w-3xl">
                <SignalSearchBox locale={locale} activeMode={signalMode} initialQuery={initialQuery} />
              </div>
              <div className="mt-4">
                <SignalModeTabs locale={locale} activeMode={signalMode} counts={signalCounts} />
              </div>
            </div>

            <div className="min-w-[260px]">
              <div className="rounded-md border border-stone-200 bg-stone-50 p-4">
                <div className="text-xs font-medium uppercase text-muted-foreground">{translate(locale, 'live.latestQuarter')}</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">{formatQuarter(snapshot.latestQuarter)}</div>
                <div className="mt-4 text-xs font-medium uppercase text-muted-foreground">{translate(locale, 'signal.latest.title')}</div>
                <div className="mt-2 font-mono text-lg font-semibold text-slate-950">{formatNumber(filteredSignals.length)}</div>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <FilingFreshnessStrip locale={locale} />
          </div>
        </div>
      </section>

      <div className="container py-8 lg:py-10">
        <div className="mb-8">
          <SignalFeed signals={filteredSignals} locale={locale} limit={16} />
        </div>

        <SecSourceTrustBlock locale={locale} className="mb-8" />

        <section className="mb-8">
          <ExplorerSearch
            stocks={explorerData.stocks}
            managers={explorerData.managers}
            consensus={explorerData.consensus}
            themes={explorerData.themes}
            stockTotal={explorerData.stockTotal}
            managerTotal={explorerData.managerTotal}
            initialQuery={initialQuery}
            locale={locale}
          />
        </section>

        <section className="mb-8 grid gap-4 lg:grid-cols-4">
          <SummaryCard icon={<Database className="h-4 w-4 text-primary" />} title={translate(locale, 'live.dataSource')} value="SEC EDGAR" description={snapshot.dataSource} />
          <SummaryCard icon={<Building2 className="h-4 w-4 text-slate-700" />} title={translate(locale, 'live.coverage')} value={formatNumber(snapshot.managers.length)} description={translate(locale, 'live.fixedCik')} />
          <SummaryCard icon={<ArrowUpRight className="h-4 w-4 text-emerald-700" />} title={translate(locale, 'home.sharedIncrease')} value={formatNumber(sharedIncrease.length)} description={translate(locale, 'live.sharedIncrease.description')} />
          <SummaryCard icon={<ArrowDownRight className="h-4 w-4 text-red-700" />} title={translate(locale, 'home.sharedDecrease')} value={formatNumber(sharedDecrease.length)} description={translate(locale, 'live.sharedDecrease.description')} />
        </section>

        <section className="mb-10">
          <ManagerCompare managers={managerCompareData} locale={locale} />
        </section>

        <section className="mb-10 grid gap-6">
          <ConsensusTable
            title={translate(locale, 'home.sharedIncrease')}
            description={translate(locale, 'live.consensus.increaseDescription')}
            items={sharedIncrease}
            direction="increase"
            locale={locale}
          />
          <ConsensusTable
            title={translate(locale, 'home.sharedDecrease')}
            description={translate(locale, 'live.consensus.decreaseDescription')}
            items={sharedDecrease}
            direction="decrease"
            locale={locale}
          />
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <FileCheck2 className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold text-slate-950">{translate(locale, 'live.managerResults')}</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {snapshot.managers.map((manager) => (
              <Card key={manager.id} className="border-stone-200 bg-white">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="break-words text-lg leading-tight">{manager.displayName}</CardTitle>
                      <CardDescription className="mt-1">{manager.leadInvestor}</CardDescription>
                    </div>
                    <Badge variant={managerStatusVariant(manager)} className="rounded-md">
                      {formatQuarter(manager.latestQuarter)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-5 pt-0">
                  <div className="grid grid-cols-3 gap-3">
                    <SmallStat label={translate(locale, 'common.companyCount')} value={formatNumber(manager.companyHoldings.length)} />
                    <SmallStat label={translate(locale, 'home.top10')} value={formatWeight(manager.metrics.top10Weight)} />
                    <SmallStat label={translate(locale, 'search.concentration')} value={concentrationName(manager.metrics.concentration)} />
                  </div>

                  <div className="rounded-md border border-stone-200 p-3 text-sm leading-6 text-muted-foreground">
                    <div>CIK: <span className="font-mono text-slate-800">{manager.cik}</span></div>
                    <div>{translate(locale, 'common.filingDate')}: {formatDate(manager.latestFiling.filingDate)}</div>
                    <div>{translate(locale, 'common.accession')}: <span className="font-mono text-xs text-slate-800">{manager.latestFiling.accessionNumber}</span></div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href={localizedPath(locale, `/live-13f/${manager.id}`)} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                      {translate(locale, 'live.managerDetails')}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <a
                      href={manager.latestFiling.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      {translate(locale, 'common.secRawXml')}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Layers3 className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold text-slate-950">{translate(locale, 'live.themeChanges')}</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {themeChanges.map((theme) => (
              <Card key={theme.theme} className="border-stone-200 bg-white">
                <CardHeader className="p-5 pb-3">
                  <CardTitle className="text-base">{themeName(theme.theme)}</CardTitle>
                  <CardDescription>
                    {translate(locale, 'live.themeCounts', { managers: theme.managerCount, companies: theme.companyCount })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className={`font-mono text-lg font-semibold ${directionTextClass(theme.netValueChange)}`}>
                    {formatSignedCurrency(theme.netValueChange)}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {translate(locale, 'live.netWeightChange', { value: formatPercent(theme.netWeightChange) })}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-md bg-emerald-50 p-2 text-emerald-800">{translate(locale, 'live.increases', { count: theme.increaseCount })}</div>
                    <div className="rounded-md bg-red-50 p-2 text-red-800">{translate(locale, 'live.decreases', { count: theme.decreaseCount })}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

function SummaryCard({ icon, title, value, description }: { icon: ReactNode; title: string; value: string; description: string }) {
  return (
    <Card className="border-stone-200 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-slate-950">{value}</div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-stone-100 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 break-words font-mono font-semibold leading-tight text-slate-950">{value}</div>
    </div>
  );
}
