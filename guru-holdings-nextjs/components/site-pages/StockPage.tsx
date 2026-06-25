import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Activity,
  ArrowLeft,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  FileText,
  Table2,
} from 'lucide-react';
import snapshot from '@/data-generated/snapshots/latest.json';
import { StockTrendChart } from '@/components/explorer/StockTrendChart';
import { SecSourceTrustBlock } from '@/components/signals/SecSourceTrustBlock';
import { StockSignalSummary } from '@/components/signals/StockSignalSummary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { buildHoldingChangeModel } from '@/lib/holding-change.mjs';
import { getCompanyMarketCap } from '@/lib/market-data';
import { getManagerColor } from '@/lib/manager-colors';
import { getTradePriceEstimateMap, type TradePriceEstimate } from '@/lib/price-estimates';
import {
  changeBadgeVariant,
  directionTextClass,
  getViewFormatters,
} from '@/lib/sec13f-view';
import { getStockChartData } from '@/lib/sec13f-lite';
import { localizedPath, translate, type Locale, type MessageKey } from '@/lib/i18n/site';
import { getSignalsByCompanyId } from '@/lib/signals';
import { getStockByCompanyId, getStockSlug, stockPath } from '@/lib/stock-routes';
import { getStockDescription } from '@/lib/stock-profiles';

type Stock = typeof snapshot.stocks[number];

const optionPattern = /:(CALL|PUT)$/;

function getOptionLabel(companyId: string) {
  return optionPattern.exec(companyId)?.[1] || null;
}

function getRelatedOptionStocks(stock: Stock) {
  if (getOptionLabel(stock.companyId)) return [];
  const rawCusips = new Set(stock.rawCusips || []);
  return snapshot.stocks.filter((candidate) =>
    candidate.companyId !== stock.companyId
    && Boolean(getOptionLabel(candidate.companyId))
    && (
      candidate.canonicalCompanyId === stock.canonicalCompanyId
      || (candidate.rawCusips || []).some((cusip) => rawCusips.has(cusip))
    )
  );
}

function getStockActions(companyId: string) {
  return snapshot.managers.flatMap((manager) => {
    const change = manager.latestCompanyChanges.find((item) => item.companyId === companyId);
    if (!change) return [];

    return [{
      ...change,
      managerId: manager.id,
      managerName: manager.displayName,
      leadInvestor: manager.leadInvestor,
      managerQuarter: manager.latestQuarter,
      filingDate: manager.latestFiling.filingDate,
      sourceUrl: change.sourceUrl || manager.latestFiling.sourceUrl,
    }];
  }).sort((a, b) => {
    const priority: Record<string, number> = { new: 0, exit: 0, increase: 1, decrease: 1, unchanged: 2 };
    return (priority[a.changeType] ?? 3) - (priority[b.changeType] ?? 3)
      || Math.abs(b.weightChange) - Math.abs(a.weightChange);
  });
}

type StockAction = ReturnType<typeof getStockActions>[number];

export function getStockStaticParams() {
  const priorityIds = new Set([
    'alphabet',
    'microsoft',
    'nvidia',
    ...snapshot.consensus.sharedIncrease.slice(0, 10).map((item) => item.companyId),
    ...snapshot.consensus.sharedDecrease.slice(0, 10).map((item) => item.companyId),
  ]);

  return snapshot.stocks
    .filter((stock) => priorityIds.has(stock.companyId))
    .map((stock) => ({ companyId: getStockSlug(stock.companyId) }));
}

export async function StockPage({ companyId, locale }: { companyId: string; locale: Locale }) {
  const stock = getStockByCompanyId(companyId);
  if (!stock) notFound();

  const { formatCurrency, formatDateTime, formatNumber, formatPrice, formatQuarter, themeName } = getViewFormatters(locale);
  const actions = getStockActions(stock.companyId);
  const currentHolderCount = actions.filter((action) => action.currentShares > 0).length;
  const stockSignals = getSignalsByCompanyId(stock.companyId);
  const descriptions = (stock as Stock & { descriptions?: Partial<Record<Locale, string>> | null }).descriptions;
  const description = getStockDescription(stock.companyId, locale) || descriptions?.[locale] || null;
  const marketCap = await getCompanyMarketCap(stock.companyId);
  const recentPriceQuarters = stock.quarters.slice(-4).map((quarter) => quarter.quarter).reverse();
  const priceEstimateMap = await getTradePriceEstimateMap(actions.map((action) => ({
    companyId: stock.companyId,
    quarter: action.managerQuarter,
  })).concat(recentPriceQuarters.map((quarter) => ({
    companyId: stock.companyId,
    quarter,
  }))));
  const recentPriceEstimates = recentPriceQuarters
    .map((quarter) => priceEstimateMap.get(`${stock.companyId}:${quarter}`))
    .filter((estimate): estimate is TradePriceEstimate => Boolean(estimate));
  const relatedOptions = getRelatedOptionStocks(stock);
  const headerStats = [
    { label: translate(locale, 'stock.currentManagers'), value: formatNumber(currentHolderCount) },
    ...(marketCap.status === 'available' ? [{
      label: translate(locale, 'stock.companyMarketCap'),
      value: formatCurrency(marketCap.value),
      detail: translate(locale, 'stock.marketCap.source', { source: marketCap.sourceName, date: formatDateTime(marketCap.retrievedAt) }),
    }] : [{
      label: translate(locale, 'stock.companyMarketCap'),
      value: translate(locale, 'stock.marketCap.unavailable'),
      detail: translate(locale, 'stock.marketCap.missing'),
    }]),
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-stone-200 bg-white">
        <div className="container py-7 lg:py-9">
          <Link href={localizedPath(locale, '/live-13f')} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            {translate(locale, 'common.back13f')}
          </Link>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)_minmax(320px,392px)] lg:items-start">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {stock.canonicalTicker && <Badge variant="info" className="rounded-md">{stock.canonicalTicker}</Badge>}
                {(stock.themes || []).map((theme) => <Badge key={theme} variant="outline" className="rounded-md border-stone-300">{themeName(theme)}</Badge>)}
              </div>
              <h1 className="break-words text-3xl font-semibold text-slate-950 sm:text-4xl">
                {stock.canonicalName}
              </h1>
              {description && (
                <p className="mt-3 max-w-3xl text-base leading-7 text-slate-800">
                  {description}
                </p>
              )}
            </div>
            <div className="grid gap-3">
              {headerStats.map((stat) => (
                <HeaderStat key={stat.label} label={stat.label} value={stat.value} detail={stat.detail} />
              ))}
            </div>
            <QuarterPriceRangeCard
              estimates={recentPriceEstimates}
              locale={locale}
              formatDateTime={formatDateTime}
              formatNumber={formatNumber}
              formatPrice={formatPrice}
              formatQuarter={formatQuarter}
            />
          </div>
        </div>
      </section>

      <div className="container py-7 lg:py-9">
        <div className="mb-6">
          <StockSignalSummary signals={stockSignals} locale={locale} />
        </div>

        <section className="mb-10">
          <SectionHeading icon={<Activity className="h-5 w-5 text-primary" />} title={translate(locale, 'stock.actions.title')} description={translate(locale, 'stock.actions.description')} />
          <div className="divide-y divide-stone-200 border-y border-stone-200 bg-white">
            {actions.map((action) => (
              <ActionRow
                key={action.managerId}
                action={action}
                locale={locale}
                priceEstimate={priceEstimateMap.get(`${stock.companyId}:${action.managerQuarter}`)}
              />
            ))}
          </div>
        </section>

        <SecSourceTrustBlock locale={locale} sourceUrl={actions[0]?.sourceUrl} className="mb-10" />

        <section className="mb-10">
          <SectionHeading icon={<Activity className="h-5 w-5 text-slate-700" />} title={translate(locale, 'stock.trends')} description={translate(locale, 'stock.trend.description')} />
          <StockTrendChart stock={getStockChartData(stock)} locale={locale} />
        </section>

        {relatedOptions.length > 0 && (
          <Alert className="mb-10 border-stone-200 bg-white text-slate-900 [&>svg]:text-primary">
            <FileText className="h-4 w-4" />
            <AlertTitle>{translate(locale, 'stock.relatedOptions.title')}</AlertTitle>
            <AlertDescription>
              {translate(locale, 'stock.relatedOptions.body', {
                options: relatedOptions.map((option) => `${option.canonicalName} ${getOptionLabel(option.companyId)}`).join(', '),
              })}
              <div className="mt-2 flex flex-wrap gap-2">
                {relatedOptions.map((option) => (
                  <Link key={option.companyId} href={localizedPath(locale, stockPath(option.companyId))} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    {option.canonicalName} {getOptionLabel(option.companyId)}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <section className="mb-10 space-y-3">
          <SectionHeading icon={<Table2 className="h-5 w-5 text-slate-700" />} title={translate(locale, 'stock.details.title')} description={translate(locale, 'stock.details.description')} />
          <DetailDisclosure title={translate(locale, 'stock.quarterDetails')} icon={<Table2 className="h-4 w-4" />}>
            <QuarterTable stock={stock} locale={locale} />
          </DetailDisclosure>
          <DetailDisclosure title={translate(locale, 'stock.rawCusip')} icon={<FileText className="h-4 w-4" />}>
            <RawHoldingsTable stock={stock} locale={locale} />
          </DetailDisclosure>
        </section>

        <Alert className="border-primary/20 bg-white text-slate-900 [&>svg]:text-primary">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>{translate(locale, 'stock.source.title')}</AlertTitle>
          <AlertDescription>{translate(locale, 'stock.source.body')}</AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

function HeaderStat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-md border border-stone-200 bg-stone-50 p-4">
      <div className="text-xs font-medium uppercase text-muted-foreground">{label}</div>
      <div className="mt-2 break-words text-base font-semibold leading-tight text-slate-950 sm:text-lg">{value}</div>
      {detail && <div className="mt-2 text-[11px] leading-4 text-muted-foreground">{detail}</div>}
    </div>
  );
}

function QuarterPriceRangeCard({
  estimates,
  locale,
  formatDateTime,
  formatNumber,
  formatPrice,
  formatQuarter,
}: {
  estimates: TradePriceEstimate[];
  locale: Locale;
  formatDateTime: (value: string) => string;
  formatNumber: (value: number) => string;
  formatPrice: (value: number) => string;
  formatQuarter: (value: string) => string;
}) {
  const available = estimates.filter((estimate): estimate is Extract<TradePriceEstimate, { status: 'available' }> =>
    estimate.status === 'available',
  );
  const low = available.length ? Math.min(...available.map((estimate) => estimate.low)) : 0;
  const high = available.length ? Math.max(...available.map((estimate) => estimate.high)) : 0;
  const span = Math.max(high - low, 1);
  const source = available[0];

  return (
    <div className="rounded-md border border-stone-200 bg-stone-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase text-muted-foreground">
            {translate(locale, 'stock.estimatedPriceRange')}
          </div>
          <div className="mt-1 text-[11px] leading-4 text-muted-foreground">
            {translate(locale, 'stock.priceRange.latestFour')}
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 rounded-md">
          {formatNumber(available.length)}
        </Badge>
      </div>
      <div className="mt-4 space-y-3">
        {estimates.map((estimate) => (
          <QuarterPriceRangeRow
            key={estimate.quarter}
            estimate={estimate}
            low={low}
            span={span}
            locale={locale}
            formatPrice={formatPrice}
            formatQuarter={formatQuarter}
          />
        ))}
      </div>
      {source ? (
        <a href={source.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
          {translate(locale, 'stock.estimatedPriceSource', {
            source: source.sourceName,
            date: formatDateTime(source.retrievedAt),
          })}
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <div className="mt-4 text-[11px] leading-4 text-muted-foreground">
          {translate(locale, 'stock.estimatedPriceUnavailable')}
        </div>
      )}
    </div>
  );
}

function QuarterPriceRangeRow({
  estimate,
  low,
  span,
  locale,
  formatPrice,
  formatQuarter,
}: {
  estimate: TradePriceEstimate;
  low: number;
  span: number;
  locale: Locale;
  formatPrice: (value: number) => string;
  formatQuarter: (value: string) => string;
}) {
  if (estimate.status !== 'available') {
    return (
      <div className="grid gap-1">
        <div className="grid gap-1 text-xs sm:flex sm:items-center sm:justify-between sm:gap-3">
          <span className="font-mono font-semibold text-slate-800">{formatQuarter(estimate.quarter)}</span>
          <span className="text-muted-foreground sm:text-right">{translate(locale, 'stock.estimatedPriceUnavailable')}</span>
        </div>
        <div className="h-1.5 rounded-full bg-stone-200" />
      </div>
    );
  }

  const left = ((estimate.low - low) / span) * 100;
  const width = Math.max(((estimate.high - estimate.low) / span) * 100, 6);

  return (
    <div className="grid gap-1.5">
      <div className="grid gap-1 text-xs sm:flex sm:items-center sm:justify-between sm:gap-3">
        <span className="font-mono font-semibold text-slate-800">{formatQuarter(estimate.quarter)}</span>
        <span className="break-words font-mono text-slate-950 sm:text-right">{formatPrice(estimate.low)} - {formatPrice(estimate.high)}</span>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-stone-200">
        <span
          className="absolute inset-y-0 rounded-full bg-primary"
          style={{ left: `${Math.max(0, Math.min(left, 100))}%`, width: `${Math.min(width, 100)}%` }}
        />
      </div>
      <div className="text-[11px] leading-4 text-muted-foreground">
        {translate(locale, 'stock.estimatedPriceReference', {
          price: formatPrice(estimate.referencePrice),
          quarter: formatQuarter(estimate.quarter),
        })}
      </div>
    </div>
  );
}

function SectionHeading({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">{title}</h2>
      </div>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function ActionRow({ action, locale, priceEstimate }: { action: StockAction; locale: Locale; priceEstimate?: TradePriceEstimate }) {
  const {
    changeName,
    formatDate,
    formatDateTime,
    formatNumber,
    formatPercent,
    formatPrice,
    formatQuarter,
    formatSignedNumber,
    formatWeight,
  } = getViewFormatters(locale);
  const model = buildHoldingChangeModel(action);
  const weightDelta = model.weightDelta ?? 0;
  const summaryKey = (
    model.action === 'decrease' && weightDelta > 0 ? 'stock.actionSummary.decreaseWeightUp'
      : model.action === 'increase' && weightDelta < 0 ? 'stock.actionSummary.increaseWeightDown'
        : `stock.actionSummary.${model.action}`
  ) as MessageKey;
  const isStale = action.managerQuarter !== snapshot.latestQuarter;

  return (
    <article className="relative py-5 pl-4 pr-3 sm:px-5">
      <span className="absolute inset-y-5 left-0 w-1 rounded-full" style={{ backgroundColor: getManagerColor(action.managerId) }} />
      <div className="grid gap-4 lg:grid-cols-[minmax(180px,1.05fr)_90px_minmax(240px,1.3fr)_minmax(170px,1fr)_minmax(170px,1fr)_80px] lg:items-center">
        <div className="min-w-0">
          <Link href={localizedPath(locale, `/live-13f/${action.managerId}`)} className="break-words font-semibold text-slate-950 hover:text-primary hover:underline">
            {action.managerName}
          </Link>
          <div className="mt-1 text-xs text-muted-foreground">{action.leadInvestor}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{formatQuarter(action.managerQuarter)}</span>
            {isStale && <Badge variant="warning" className="rounded-md">{translate(locale, 'stock.latestAvailable')}</Badge>}
          </div>
        </div>

        <Badge variant={changeBadgeVariant(model.action)} className="w-fit rounded-md">{changeName(model.action)}</Badge>

        <div>
          {model.showWeightTransition ? (
            <div className="font-mono text-sm font-semibold text-slate-950">
              {formatWeight(model.previousWeight)} <span className="px-1 text-muted-foreground">-&gt;</span> {formatWeight(model.currentWeight)}
            </div>
          ) : (
            <div className="font-mono text-sm font-semibold text-slate-950">
              {model.isNew ? translate(locale, 'change.new') : translate(locale, 'change.exit')}: {formatWeight(model.specialWeight)}
            </div>
          )}
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {translate(locale, summaryKey, {
              manager: action.managerName,
              previous: formatWeight(model.previousWeight),
              current: formatWeight(model.currentWeight),
              shares: formatNumber(Math.abs(model.isExit ? model.previousShares || 0 : model.shareDelta || model.currentShares || 0)),
            })}
          </p>
        </div>

        <PriceEstimateBlock
          estimate={priceEstimate}
          locale={locale}
          formatDateTime={formatDateTime}
          formatPrice={formatPrice}
          formatQuarter={formatQuarter}
        />

        <div>
          <div className={`font-mono text-sm font-semibold ${directionTextClass(model.shareDelta || 0)}`}>
            {formatSignedNumber(model.shareDelta || 0)} {translate(locale, 'common.shares')}
          </div>
          {model.isExit && (
            <div className="mt-1 font-mono text-xs text-slate-700">
              {translate(locale, 'common.current')}: {formatNumber(model.currentShares || 0)} {translate(locale, 'common.shares')}
            </div>
          )}
          <div className="mt-1 font-mono text-xs text-muted-foreground">{formatPercent(model.shareDeltaPercent)}</div>
        </div>

        <a href={action.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          SEC
          <ExternalLink className="h-3 w-3" />
          <span className="sr-only">{formatDate(action.filingDate)}</span>
        </a>
      </div>
    </article>
  );
}

function PriceEstimateBlock({
  estimate,
  locale,
  formatDateTime,
  formatPrice,
  formatQuarter,
}: {
  estimate?: TradePriceEstimate;
  locale: Locale;
  formatDateTime: (value: string) => string;
  formatPrice: (value: number) => string;
  formatQuarter: (value: string) => string;
}) {
  if (!estimate || estimate.status !== 'available') {
    return (
      <div className="rounded-md border border-dashed border-stone-200 bg-stone-50 p-3">
        <div className="text-xs font-medium text-muted-foreground">{translate(locale, 'stock.estimatedPriceRange')}</div>
        <div className="mt-1 text-sm text-muted-foreground">{translate(locale, 'stock.estimatedPriceUnavailable')}</div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
      <div className="text-xs font-medium text-muted-foreground">{translate(locale, 'stock.estimatedPriceRange')}</div>
      <div className="mt-1 break-words font-mono text-sm font-semibold text-slate-950">
        {formatPrice(estimate.low)} - {formatPrice(estimate.high)}
      </div>
      <div className="mt-1 text-[11px] leading-4 text-muted-foreground">
        {translate(locale, 'stock.estimatedPriceReference', {
          price: formatPrice(estimate.referencePrice),
          quarter: formatQuarter(estimate.quarter),
        })}
      </div>
      <a href={estimate.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
        {translate(locale, 'stock.estimatedPriceSource', {
          source: estimate.sourceName,
          date: formatDateTime(estimate.retrievedAt),
        })}
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

function DetailDisclosure({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <details className="group rounded-md border border-stone-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-medium text-slate-900 marker:content-none">
        <span className="flex items-center gap-2">{icon}{title}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-stone-200">{children}</div>
    </details>
  );
}

function RawHoldingsTable({ stock, locale }: { stock: Stock; locale: Locale }) {
  const { formatCurrency, formatNumber, formatWeight } = getViewFormatters(locale);
  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-stone-100 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">{translate(locale, 'common.manager')}</th>
            <th className="px-4 py-3">{translate(locale, 'common.issuer')}</th>
            <th className="px-4 py-3">CUSIP</th>
            <th className="px-4 py-3">{translate(locale, 'common.class')}</th>
            <th className="px-4 py-3 text-right">{translate(locale, 'common.marketValue')}</th>
            <th className="px-4 py-3 text-right">{translate(locale, 'common.shares')}</th>
            <th className="px-4 py-3 text-right">{translate(locale, 'common.weight')}</th>
            <th className="px-4 py-3">{translate(locale, 'common.source')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {stock.rawHoldings.map((holding) => (
            <tr key={`${holding.managerId}-${holding.securityId}`} className="hover:bg-stone-50">
              <td className="px-4 py-3 font-medium text-slate-950">{holding.managerName}</td>
              <td className="px-4 py-3">{holding.issuerName}</td>
              <td className="px-4 py-3 font-mono text-xs">{holding.cusip}</td>
              <td className="px-4 py-3">{holding.titleOfClass || 'n/a'}</td>
              <td className="px-4 py-3 text-right font-mono">{formatCurrency(holding.value, false)}</td>
              <td className="px-4 py-3 text-right font-mono">{formatNumber(holding.shares)}</td>
              <td className="px-4 py-3 text-right font-mono">{formatWeight(holding.weight)}</td>
              <td className="px-4 py-3"><a href={holding.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">SEC XML<ExternalLink className="h-3 w-3" /></a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuarterTable({ stock, locale }: { stock: Stock; locale: Locale }) {
  const { changeName, formatCurrency, formatNumber, formatQuarter } = getViewFormatters(locale);
  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full min-w-[780px] text-left text-sm">
        <thead className="bg-stone-100 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">{translate(locale, 'common.quarter')}</th>
            <th className="px-4 py-3 text-right">{translate(locale, 'stock.currentManagers')}</th>
            <th className="px-4 py-3 text-right">{translate(locale, 'home.combinedValue')}</th>
            <th className="px-4 py-3 text-right">{translate(locale, 'stock.totalShares')}</th>
            <th className="px-4 py-3">{translate(locale, 'stock.holderDetails')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {stock.quarters.map((quarter) => (
            <tr key={quarter.quarter} className="align-top hover:bg-stone-50">
              <td className="px-4 py-3 font-semibold text-slate-950">{formatQuarter(quarter.quarter)}</td>
              <td className="px-4 py-3 text-right font-mono">{formatNumber(quarter.holderCount)}</td>
              <td className="px-4 py-3 text-right font-mono">{formatCurrency(quarter.totalValue, false)}</td>
              <td className="px-4 py-3 text-right font-mono">{formatNumber(quarter.totalShares)}</td>
              <td className="px-4 py-3">
                <div className="flex max-w-[420px] flex-wrap gap-1">
                  {quarter.holders.map((holder) => (
                    <Badge key={`${quarter.quarter}-${holder.managerId}`} variant={changeBadgeVariant(holder.changeType)} className="rounded-md">
                      {holder.managerName} {changeName(holder.changeType)} - {formatNumber(holder.shares)} {translate(locale, 'common.shares')}
                    </Badge>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
