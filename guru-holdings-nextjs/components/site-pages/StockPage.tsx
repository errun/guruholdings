import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  FileText,
  Layers3,
  Table2,
} from 'lucide-react';
import snapshot from '@/data-generated/snapshots/latest.json';
import { StockTrendChart } from '@/components/explorer/StockTrendChart';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  changeBadgeVariant,
  directionTextClass,
  getViewFormatters,
} from '@/lib/sec13f-view';
import { getStockChartData } from '@/lib/sec13f-lite';
import { localizedPath, translate, type Locale } from '@/lib/i18n/site';

type Stock = typeof snapshot.stocks[number];

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
    .map((stock) => ({ companyId: stock.companyId }));
}

export async function StockPage({ companyId, locale }: { companyId: string; locale: Locale }) {
  const decodedCompanyId = decodeURIComponent(companyId);
  const stock = snapshot.stocks.find((item) => item.companyId === decodedCompanyId);
  if (!stock) notFound();

  const { formatCurrency, formatNumber, formatQuarter, themeName } = getViewFormatters(locale);

  const increaseSignals = stock.consensusSignals.filter((item) => item.direction === 'increase');
  const decreaseSignals = stock.consensusSignals.filter((item) => item.direction === 'decrease');

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-stone-200 bg-white">
        <div className="container py-8 lg:py-10">
          <Link href={localizedPath(locale, '/live-13f')} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            {translate(locale, 'common.back13f')}
          </Link>
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <Badge variant="info" className="mb-4 rounded-md">
                {formatQuarter(stock.latestQuarter)}
              </Badge>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {stock.canonicalName}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                {translate(locale, 'stock.intro', {
                  ticker: stock.canonicalTicker ? `${stock.canonicalTicker}, ` : '',
                  cusips: stock.rawCusips.join(', '),
                })}
              </p>
            </div>
            <div className="grid min-w-[280px] grid-cols-2 gap-3">
              <HeaderStat label={translate(locale, 'stock.currentManagers')} value={formatNumber(stock.latestHolderCount)} />
              <HeaderStat label={translate(locale, 'home.combinedValue')} value={formatCurrency(stock.latestTotalValue)} />
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8 lg:py-10">
        <section className="mb-8 grid gap-4 lg:grid-cols-4">
          <MetricCard title={translate(locale, 'stock.currentManagers')} value={formatNumber(stock.latestHolderCount)} description={translate(locale, 'stock.currentManagers.description')} />
          <MetricCard title={translate(locale, 'stock.totalShares')} value={formatNumber(stock.latestTotalShares)} description={translate(locale, 'stock.totalShares.description')} />
          <MetricCard title={translate(locale, 'home.combinedValue')} value={formatCurrency(stock.latestTotalValue)} description={translate(locale, 'stock.totalValue.description')} />
          <MetricCard title={translate(locale, 'stock.themes')} value={(stock.themes || []).map(themeName).join(' / ')} description={translate(locale, 'stock.themes.description')} />
        </section>

        {(increaseSignals.length > 0 || decreaseSignals.length > 0) && (
          <section className="mb-8 grid gap-4 lg:grid-cols-2">
            {increaseSignals.map((signal) => (
              <SignalCard key={`inc-${stock.companyId}`} signal={signal} direction="increase" locale={locale} />
            ))}
            {decreaseSignals.map((signal) => (
              <SignalCard key={`dec-${stock.companyId}`} signal={signal} direction="decrease" locale={locale} />
            ))}
          </section>
        )}

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Layers3 className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold text-slate-950">{translate(locale, 'stock.trends')}</h2>
          </div>
          <StockTrendChart stock={getStockChartData(stock)} locale={locale} />
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Table2 className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold text-slate-950">{translate(locale, 'stock.holders')}</h2>
          </div>
          <HoldersTable stock={stock} locale={locale} />
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold text-slate-950">{translate(locale, 'stock.rawCusip')}</h2>
          </div>
          <RawHoldingsTable stock={stock} locale={locale} />
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Table2 className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold text-slate-950">{translate(locale, 'stock.quarterDetails')}</h2>
          </div>
          <QuarterTable stock={stock} locale={locale} />
        </section>

        <Alert className="border-primary/20 bg-white text-slate-900 [&>svg]:text-primary">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>{translate(locale, 'stock.source.title')}</AlertTitle>
          <AlertDescription>
            {translate(locale, 'stock.source.body')}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

function HeaderStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 break-words font-mono text-lg font-semibold leading-tight text-slate-950">{value}</div>
    </div>
  );
}

function MetricCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <Card className="border-stone-200 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="break-words font-mono text-xl font-semibold leading-tight text-slate-950 sm:text-2xl">{value}</div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function SignalCard({ signal, direction, locale }: { signal: Record<string, any>; direction: 'increase' | 'decrease'; locale: Locale }) {
  const Icon = direction === 'increase' ? ArrowUpRight : ArrowDownRight;
  const title = translate(locale, direction === 'increase' ? 'home.sharedIncrease' : 'home.sharedDecrease');
  const { formatPercent, formatSignedCurrency, formatSignedNumber } = getViewFormatters(locale);
  return (
    <Card className="border-stone-200 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className={`h-5 w-5 ${direction === 'increase' ? 'text-emerald-700' : 'text-red-700'}`} />
          {title}
        </CardTitle>
        <CardDescription>{translate(locale, 'stock.sameDirection', { count: signal.managerCount })}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <Metric label={translate(locale, 'common.shareChange')} value={formatSignedNumber(signal.netShareChange)} tone={directionTextClass(signal.netShareChange)} />
        <Metric label={translate(locale, 'common.valueChange')} value={formatSignedCurrency(signal.netValueChange)} tone={directionTextClass(signal.netValueChange)} />
        <Metric label={translate(locale, 'common.weightChange')} value={formatPercent(signal.netWeightChange)} tone={directionTextClass(signal.netWeightChange)} />
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono text-sm font-semibold ${tone || 'text-slate-950'}`}>{value}</div>
    </div>
  );
}

function HoldersTable({ stock, locale }: { stock: Stock; locale: Locale }) {
  const { changeName, formatCurrency, formatDate, formatNumber, formatPercent, formatQuarter, formatSignedCurrency, formatSignedNumber, formatWeight } = getViewFormatters(locale);
  return (
    <div className="max-w-full overflow-x-auto rounded-lg border border-stone-200 bg-white">
      <table className="w-full min-w-[1040px] text-left text-sm">
        <thead className="bg-stone-100 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">{translate(locale, 'common.manager')}</th>
            <th className="px-4 py-3">{translate(locale, 'common.quarter')}</th>
            <th className="px-4 py-3 text-right">{translate(locale, 'common.marketValue')}</th>
            <th className="px-4 py-3 text-right">{translate(locale, 'common.shares')}</th>
            <th className="px-4 py-3 text-right">{translate(locale, 'common.positionWeight')}</th>
            <th className="px-4 py-3">{translate(locale, 'stock.currentChange')}</th>
            <th className="px-4 py-3 text-right">{translate(locale, 'common.shareChange')}</th>
            <th className="px-4 py-3 text-right">{translate(locale, 'common.valueChange')}</th>
            <th className="px-4 py-3">{translate(locale, 'stock.secSource')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {stock.holders.map((holder) => (
            <tr key={`${stock.companyId}-${holder.managerId}`} className="align-top hover:bg-stone-50">
              <td className="px-4 py-3">
                <Link href={localizedPath(locale, `/live-13f/${holder.managerId}`)} className="font-semibold text-slate-950 hover:text-primary hover:underline">
                  {holder.managerName}
                </Link>
                <div className="mt-1 text-xs text-muted-foreground">{holder.leadInvestor}</div>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{formatQuarter(holder.quarter)}</td>
              <td className="px-4 py-3 text-right font-mono font-medium">{formatCurrency(holder.value, false)}</td>
              <td className="px-4 py-3 text-right font-mono">{formatNumber(holder.shares)}</td>
              <td className="px-4 py-3 text-right font-mono">{formatWeight(holder.weight)}</td>
              <td className="px-4 py-3">
                <Badge variant={changeBadgeVariant(holder.changeType)} className="rounded-md">{changeName(holder.changeType)}</Badge>
                <div className="mt-1 font-mono text-xs text-muted-foreground">{formatPercent(holder.shareChangePercent)}</div>
              </td>
              <td className={`px-4 py-3 text-right font-mono font-semibold ${directionTextClass(holder.shareChange)}`}>{formatSignedNumber(holder.shareChange)}</td>
              <td className={`px-4 py-3 text-right font-mono font-semibold ${directionTextClass(holder.valueChange)}`}>{formatSignedCurrency(holder.valueChange, false)}</td>
              <td className="px-4 py-3">
                <a href={holder.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  XML
                  <ExternalLink className="h-3 w-3" />
                </a>
                <div className="mt-1 font-mono text-xs text-muted-foreground">{formatDate(holder.filingDate)}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RawHoldingsTable({ stock, locale }: { stock: Stock; locale: Locale }) {
  const { formatCurrency, formatNumber, formatWeight } = getViewFormatters(locale);
  return (
    <div className="max-w-full overflow-x-auto rounded-lg border border-stone-200 bg-white">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-stone-100 text-xs uppercase tracking-wider text-muted-foreground">
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
              <td className="px-4 py-3">
                <a href={holding.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  SEC XML
                  <ExternalLink className="h-3 w-3" />
                </a>
              </td>
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
    <div className="max-w-full overflow-x-auto rounded-lg border border-stone-200 bg-white">
      <table className="w-full min-w-[780px] text-left text-sm">
        <thead className="bg-stone-100 text-xs uppercase tracking-wider text-muted-foreground">
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
                      {holder.managerName} {changeName(holder.changeType)}
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
