import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Building2,
  ChevronDown,
  Database,
  ExternalLink,
  FileCheck2,
  Layers3,
  ListFilter,
  Scale,
  Search,
} from 'lucide-react';
import snapshot from '@/data-generated/snapshots/latest.json';
import {
  ConsensusMoveSection,
  ConsensusViewNav,
  type ConsensusItem,
} from '@/components/consensus/ConsensusMoveSection';
import { ExplorerSearch } from '@/components/explorer/ExplorerSearch';
import { ManagerCompare } from '@/components/explorer/ManagerCompare';
import { FilingFreshnessStrip } from '@/components/signals/FilingFreshnessStrip';
import { SecSourceTrustBlock } from '@/components/signals/SecSourceTrustBlock';
import { SignalFeed } from '@/components/signals/SignalFeed';
import { SignalModeTabs } from '@/components/signals/SignalModeTabs';
import { SignalSearchBox } from '@/components/signals/SignalSearchBox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConsensusView } from '@/lib/consensus-view';
import { getExplorerData, getManagerCompareData } from '@/lib/sec13f-lite';
import { localizedPath, translate, type Locale } from '@/lib/i18n/site';
import {
  directionTextClass,
  getViewFormatters,
} from '@/lib/sec13f-view';
import { getSignalCounts, getSignalItems, type SignalMode } from '@/lib/signals';

type Snapshot = typeof snapshot;
type Manager = Snapshot['managers'][number];
type MoveDirection = 'increase' | 'decrease' | 'divergent';

const CONSENSUS_PAGE_SIZE = 12;
const OVERVIEW_PREVIEW_SIZE = 6;

const managerStatusVariant = (manager: Manager) =>
  manager.latestQuarter === snapshot.latestQuarter ? 'success' as const : 'warning' as const;

function focusedConsensusConfig(view: ConsensusView, locale: Locale) {
  if (view === 'shared-increase') {
    return {
      title: translate(locale, 'home.sharedIncrease'),
      description: translate(locale, 'live.consensus.increaseDescription'),
      items: snapshot.consensus.sharedIncrease as ConsensusItem[],
      direction: 'increase' as MoveDirection,
    };
  }
  if (view === 'shared-decrease') {
    return {
      title: translate(locale, 'home.sharedDecrease'),
      description: translate(locale, 'live.consensus.decreaseDescription'),
      items: snapshot.consensus.sharedDecrease as ConsensusItem[],
      direction: 'decrease' as MoveDirection,
    };
  }
  if (view === 'divergent') {
    return {
      title: translate(locale, 'live.divergent'),
      description: translate(locale, 'live.divergentDescription'),
      items: snapshot.consensus.divergent as ConsensusItem[],
      direction: 'divergent' as MoveDirection,
    };
  }
  return null;
}

export function Live13FPage({
  locale,
  consensusView = 'overview',
  consensusPage = 1,
  signalMode = 'all',
  initialQuery = '',
}: {
  locale: Locale;
  consensusView?: ConsensusView;
  consensusPage?: number;
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
  const sharedIncrease = snapshot.consensus.sharedIncrease as ConsensusItem[];
  const sharedDecrease = snapshot.consensus.sharedDecrease as ConsensusItem[];
  const divergent = snapshot.consensus.divergent as ConsensusItem[];
  const themeChanges = snapshot.consensus.themeChanges;
  const allSignals = getSignalItems('all');
  const filteredSignals = signalMode === 'all' ? allSignals : getSignalItems(signalMode);
  const signalCounts = getSignalCounts(allSignals);
  const focus = focusedConsensusConfig(consensusView, locale);

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-stone-200 bg-white">
        <div className="container py-6 lg:py-7">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-end">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info" className="rounded-sm">{formatQuarter(snapshot.latestQuarter)}</Badge>
                <span className="text-xs text-muted-foreground">SEC EDGAR 13F</span>
              </div>
              <h1 className="mt-3 text-2xl font-semibold text-slate-950 sm:text-3xl">
                {translate(locale, 'live.consensusTitle')}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {translate(locale, 'live.consensusSubtitle')}
              </p>
            </div>
            <ConsensusViewNav locale={locale} activeView={consensusView} />
          </div>
          <div className="mt-4">
            <FilingFreshnessStrip locale={locale} />
          </div>
        </div>
      </section>

      <div className="container py-7 lg:py-9">
        <div id="consensus-results" className="scroll-mt-32">
          {focus ? (
            <ConsensusMoveSection
              title={focus.title}
              description={focus.description}
              items={focus.items}
              direction={focus.direction}
              locale={locale}
              page={consensusPage}
              pageSize={CONSENSUS_PAGE_SIZE}
            />
          ) : (
            <div className="space-y-10">
              <ConsensusMoveSection
                title={translate(locale, 'home.sharedIncrease')}
                description={translate(locale, 'live.consensus.increaseDescription')}
                items={sharedIncrease}
                direction="increase"
                locale={locale}
                pageSize={OVERVIEW_PREVIEW_SIZE}
                showViewAll
              />
              <ConsensusMoveSection
                title={translate(locale, 'home.sharedDecrease')}
                description={translate(locale, 'live.consensus.decreaseDescription')}
                items={sharedDecrease}
                direction="decrease"
                locale={locale}
                pageSize={OVERVIEW_PREVIEW_SIZE}
                showViewAll
              />
              <ConsensusMoveSection
                title={translate(locale, 'live.divergent')}
                description={translate(locale, 'live.divergentDescription')}
                items={divergent}
                direction="divergent"
                locale={locale}
                pageSize={OVERVIEW_PREVIEW_SIZE}
                showViewAll
              />
            </div>
          )}
        </div>

        <SecSourceTrustBlock locale={locale} className="my-9" />

        <section className="mb-9" aria-labelledby="explorer-search-title">
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-slate-700" aria-hidden="true" />
            <h2 id="explorer-search-title" className="text-xl font-semibold text-slate-950">{translate(locale, 'search.title')}</h2>
          </div>
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

        <details
          id="single-signals"
          open={signalMode !== 'all' || Boolean(initialQuery)}
          className="group mb-10 rounded-md border border-stone-200 bg-white"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 marker:content-none sm:px-5">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                <ListFilter className="h-5 w-5 text-slate-700" aria-hidden="true" />
                {translate(locale, 'live.singleSignalsTitle')}
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{translate(locale, 'live.singleSignalsDescription')}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="secondary" className="rounded-sm">{formatNumber(filteredSignals.length)}</Badge>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
            </div>
          </summary>
          <div className="border-t border-stone-200 p-4 sm:p-5">
            <div className="max-w-3xl">
              <SignalSearchBox locale={locale} activeMode={signalMode} initialQuery={initialQuery} />
            </div>
            <div className="mt-4">
              <SignalModeTabs locale={locale} activeMode={signalMode} counts={signalCounts} />
            </div>
            <div className="mt-6">
              <SignalFeed signals={filteredSignals} locale={locale} limit={16} showHeading={false} />
            </div>
          </div>
        </details>

        <section className="mb-10" aria-labelledby="supporting-analysis-title">
          <div className="mb-4 flex items-center gap-2">
            <Scale className="h-5 w-5 text-slate-700" aria-hidden="true" />
            <h2 id="supporting-analysis-title" className="text-xl font-semibold text-slate-950">{translate(locale, 'live.supportingAnalysis')}</h2>
          </div>
          <ManagerCompare managers={managerCompareData} locale={locale} />
        </section>

        <section className="mb-8 grid gap-4 lg:grid-cols-4">
          <SummaryCard icon={<Database className="h-4 w-4 text-primary" />} title={translate(locale, 'live.dataSource')} value="SEC EDGAR" description={snapshot.dataSource} />
          <SummaryCard icon={<Building2 className="h-4 w-4 text-slate-700" />} title={translate(locale, 'live.coverage')} value={formatNumber(snapshot.managers.length)} description={translate(locale, 'live.fixedCik')} />
          <SummaryCard icon={<ArrowUpRight className="h-4 w-4 text-emerald-700" />} title={translate(locale, 'home.sharedIncrease')} value={formatNumber(sharedIncrease.length)} description={translate(locale, 'live.sharedIncrease.description')} />
          <SummaryCard icon={<ArrowDownRight className="h-4 w-4 text-red-700" />} title={translate(locale, 'home.sharedDecrease')} value={formatNumber(sharedDecrease.length)} description={translate(locale, 'live.sharedDecrease.description')} />
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <FileCheck2 className="h-5 w-5 text-slate-700" aria-hidden="true" />
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
                    <Badge variant={managerStatusVariant(manager)} className="rounded-md">{formatQuarter(manager.latestQuarter)}</Badge>
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
                      {translate(locale, 'live.managerDetails')}<ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <a href={manager.latestFiling.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                      {translate(locale, 'common.secRawXml')}<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Layers3 className="h-5 w-5 text-slate-700" aria-hidden="true" />
            <h2 className="text-2xl font-semibold text-slate-950">{translate(locale, 'live.themeChanges')}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {themeChanges.map((theme) => (
              <Card key={theme.theme} className="border-stone-200 bg-white">
                <CardHeader className="p-5 pb-3">
                  <CardTitle className="text-base">{themeName(theme.theme)}</CardTitle>
                  <CardDescription>{translate(locale, 'live.themeCounts', { managers: theme.managerCount, companies: theme.companyCount })}</CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className={`font-mono text-lg font-semibold ${directionTextClass(theme.netValueChange)}`}>{formatSignedCurrency(theme.netValueChange)}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{translate(locale, 'live.netWeightChange', { value: formatPercent(theme.netWeightChange) })}</div>
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
      <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base">{icon}{title}</CardTitle></CardHeader>
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
