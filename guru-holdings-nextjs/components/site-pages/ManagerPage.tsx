import Link from 'next/link';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileText,
  Table2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import snapshot from '@/data-generated/snapshots/latest.json';
import { ManagerCharts } from '@/components/explorer/ManagerCharts';
import { ManagerOperationsTable } from '@/components/explorer/ManagerOperationsTable';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  changeBadgeVariant,
  directionTextClass,
  getViewFormatters,
} from '@/lib/sec13f-view';
import { getManagerChartData, getManagerOperationData } from '@/lib/sec13f-lite';
import { localizedPath, translate, type Locale } from '@/lib/i18n/site';
import { stockPath } from '@/lib/stock-routes';

type Manager = typeof snapshot.managers[number];
type CompanyChange = Manager['latestCompanyChanges'][number];
type Holding = Manager['holdings'][number];

export function getManagerStaticParams() {
  return snapshot.managers.map((manager) => ({ managerId: manager.id }));
}

const managerStatusVariant = (manager: Manager) =>
  manager.latestQuarter === snapshot.latestQuarter ? 'success' as const : 'warning' as const;

const changesByType = (manager: Manager, changeTypes: string[]) =>
  manager.latestCompanyChanges
    .filter((change) => changeTypes.includes(change.changeType))
    .sort((a, b) => Math.abs(b.valueChange) - Math.abs(a.valueChange));

function ChangeList({
  title,
  description,
  changes,
  tone,
  locale,
}: {
  title: string;
  description: string;
  changes: CompanyChange[];
  tone: 'increase' | 'decrease';
  locale: Locale;
}) {
  const Icon = tone === 'increase' ? TrendingUp : TrendingDown;
  const iconClass = tone === 'increase' ? 'text-emerald-700' : 'text-red-700';
  const { changeName, formatPercent, formatSignedCurrency, formatSignedNumber } = getViewFormatters(locale);

  return (
    <Card className="border-stone-200 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className={`h-5 w-5 ${iconClass}`} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {changes.slice(0, 8).map((change) => (
          <Link key={`${title}-${change.companyId}`} href={localizedPath(locale, stockPath(change.companyId))} className="block rounded-lg border border-stone-200 bg-white p-4 hover:border-primary/40 hover:bg-stone-50">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="break-words font-semibold text-slate-950">{change.canonicalName || change.issuerName}</div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">{change.rawCusips?.join(', ') || change.cusip}</div>
              </div>
              <Badge variant={changeBadgeVariant(change.changeType)} className="w-fit rounded-md">
                {changeName(change.changeType)}
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Metric label={translate(locale, 'common.shareChange')} value={formatSignedNumber(change.shareChange)} tone={directionTextClass(change.shareChange)} />
              <Metric label={translate(locale, 'common.valueChange')} value={formatSignedCurrency(change.valueChange)} tone={directionTextClass(change.valueChange)} />
              <Metric label={translate(locale, 'common.weightChange')} value={formatPercent(change.weightChange)} tone={directionTextClass(change.weightChange)} />
            </div>
          </Link>
        ))}
        {changes.length === 0 && (
          <div className="rounded-lg border border-dashed border-stone-300 p-4 text-sm text-muted-foreground">
            {translate(locale, 'manager.noChanges')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HoldingsTable({ manager, locale }: { manager: Manager; locale: Locale }) {
  const changesBySecurity = new Map(manager.latestChanges.map((change) => [change.securityId, change]));
  const { changeName, formatCurrency, formatDate, formatNumber, formatPercent, formatWeight, themeName } = getViewFormatters(locale);

  return (
    <div className="max-w-full overflow-x-auto rounded-lg border border-stone-200 bg-white">
      <table className="w-full min-w-[1180px] text-left text-sm">
        <thead className="bg-stone-100 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">{translate(locale, 'common.rank')}</th>
            <th className="px-4 py-3">{translate(locale, 'common.company')}</th>
            <th className="px-4 py-3">CUSIP</th>
            <th className="px-4 py-3">{translate(locale, 'manager.normalizedCompany')}</th>
            <th className="px-4 py-3 text-right">{translate(locale, 'common.marketValue')}</th>
            <th className="px-4 py-3 text-right">{translate(locale, 'common.shares')}</th>
            <th className="px-4 py-3 text-right">{translate(locale, 'common.weight')}</th>
            <th className="px-4 py-3">{translate(locale, 'common.change')}</th>
            <th className="px-4 py-3">{translate(locale, 'common.theme')}</th>
            <th className="px-4 py-3">{translate(locale, 'common.source')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {manager.holdings.map((holding: Holding) => {
            const change = changesBySecurity.get(holding.securityId);
            return (
              <tr key={`${manager.id}-${holding.securityId}`} className="align-top hover:bg-stone-50">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{holding.rank}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-950">{holding.issuerName}</div>
                  <div className="text-xs text-muted-foreground">{holding.titleOfClass || 'n/a'}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-700">{holding.cusip}</td>
                <td className="px-4 py-3">
                  <Link href={localizedPath(locale, stockPath(holding.companyId))} className="text-sm font-medium text-slate-800 hover:text-primary hover:underline">
                    {holding.canonicalName || holding.issuerName}
                  </Link>
                  <div className="font-mono text-xs text-muted-foreground">{holding.canonicalCompanyId}</div>
                </td>
                <td className="px-4 py-3 text-right font-mono font-medium text-slate-950">{formatCurrency(holding.value, false)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-slate-700">{formatNumber(holding.shares)}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-700">{formatWeight(holding.weight)}</td>
                <td className="px-4 py-3">
                  <Badge variant={changeBadgeVariant(change?.changeType)} className="rounded-md">
                    {change ? changeName(change.changeType) : 'n/a'}
                  </Badge>
                  {change && <div className="mt-1 font-mono text-xs text-muted-foreground">{formatPercent(change.shareChangePercent)}</div>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex max-w-[180px] flex-wrap gap-1">
                    {holding.themes.map((theme) => (
                      <Badge key={theme} variant="outline" className="rounded-md border-stone-300 bg-white text-slate-700">
                        {themeName(theme)}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  <div>{formatDate(holding.filingDate)}</div>
                  <div className="font-mono">{holding.accessionNumber}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export async function ManagerPage({ managerId, locale }: { managerId: string; locale: Locale }) {
  const manager = snapshot.managers.find((item) => item.id === managerId);
  if (!manager) notFound();

  const {
    concentrationName,
    formatCurrency,
    formatDate,
    formatNumber,
    formatQuarter,
    formatWeight,
  } = getViewFormatters(locale);

  const increases = changesByType(manager, ['increase', 'new']);
  const decreases = changesByType(manager, ['decrease', 'exit']);
  const nextManager = snapshot.managers[(snapshot.managers.findIndex((item) => item.id === manager.id) + 1) % snapshot.managers.length];
  const largestIncrease = manager.metrics.largestIncrease;
  const largestDecrease = manager.metrics.largestDecrease;

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
              <Badge variant={managerStatusVariant(manager)} className="mb-4 rounded-md">
                {formatQuarter(manager.latestQuarter)}
              </Badge>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {manager.displayName}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                {translate(locale, 'manager.intro', { managerName: manager.managerName, cik: manager.cik })}
              </p>
            </div>
            <a
              href={manager.latestFiling.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-stone-50"
            >
              {translate(locale, 'common.secRawXml')}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <div className="container py-8 lg:py-10">
        {manager.latestQuarter !== snapshot.latestQuarter && (
          <Alert variant="warning" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{translate(locale, 'manager.stale.title')}</AlertTitle>
            <AlertDescription>
              {translate(locale, 'manager.stale.body', {
                siteQuarter: formatQuarter(snapshot.latestQuarter),
                name: manager.displayName,
                managerQuarter: formatQuarter(manager.latestQuarter),
              })}
            </AlertDescription>
          </Alert>
        )}

        <section className="mb-8 grid gap-4 lg:grid-cols-4">
          <MetricCard icon={<Building2 className="h-4 w-4 text-primary" />} title={translate(locale, 'manager.companyHoldings')} value={formatNumber(manager.companyHoldings.length)} description={translate(locale, 'manager.companyHoldings.description')} />
          <MetricCard icon={<ArrowUpDown className="h-4 w-4 text-primary" />} title={translate(locale, 'manager.top10Weight')} value={formatWeight(manager.metrics.top10Weight)} description={concentrationName(manager.metrics.concentration)} />
          <MetricCard icon={<TrendingUp className="h-4 w-4 text-emerald-700" />} title={translate(locale, 'manager.increaseCount')} value={formatNumber(increases.length)} description={translate(locale, 'manager.increaseWeight', { value: formatWeight(manager.metrics.newValueWeight) })} />
          <MetricCard icon={<TrendingDown className="h-4 w-4 text-red-700" />} title={translate(locale, 'manager.decreaseCount')} value={formatNumber(decreases.length)} description={translate(locale, 'manager.turnover', { value: formatWeight(manager.metrics.turnoverRate) })} />
        </section>

        <section className="mb-10 grid gap-5 xl:grid-cols-2">
          <InsightCard title={translate(locale, 'manager.largestIncrease')} change={largestIncrease} tone="increase" locale={locale} />
          <InsightCard title={translate(locale, 'manager.largestDecrease')} change={largestDecrease} tone="decrease" locale={locale} />
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold text-slate-950">{translate(locale, 'manager.trends')}</h2>
          </div>
          <ManagerCharts manager={getManagerChartData(manager)} locale={locale} />
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold text-slate-950">{translate(locale, 'manager.quarterSummary')}</h2>
          </div>
          <div className="max-w-full overflow-x-auto rounded-lg border border-stone-200 bg-white">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-stone-100 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">{translate(locale, 'common.quarter')}</th>
                  <th className="px-4 py-3">{translate(locale, 'common.filingDate')}</th>
                  <th className="px-4 py-3">{translate(locale, 'common.accession')}</th>
                  <th className="px-4 py-3 text-right">{translate(locale, 'common.rawRows')}</th>
                  <th className="px-4 py-3 text-right">{translate(locale, 'common.companyCount')}</th>
                  <th className="px-4 py-3 text-right">{translate(locale, 'common.totalValue')}</th>
                  <th className="px-4 py-3 text-right">Top10</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {manager.quarterSummaries.map((quarter) => (
                  <tr key={quarter.quarter} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-semibold text-slate-950">{formatQuarter(quarter.quarter)}</td>
                    <td className="px-4 py-3">{formatDate(quarter.filingDate)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{quarter.accessionNumber}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatNumber(quarter.holdingCount)}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatNumber(quarter.companyHoldingCount)}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(quarter.totalValue, false)}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatWeight(quarter.top10Weight)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10 grid gap-6 xl:grid-cols-2">
          <ChangeList
            title={translate(locale, 'manager.increaseSection')}
            description={translate(locale, 'manager.increaseSection.description')}
            changes={increases}
            tone="increase"
            locale={locale}
          />
          <ChangeList
            title={translate(locale, 'manager.decreaseSection')}
            description={translate(locale, 'manager.decreaseSection.description')}
            changes={decreases}
            tone="decrease"
            locale={locale}
          />
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Table2 className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold text-slate-950">{translate(locale, 'manager.operations')}</h2>
          </div>
          <ManagerOperationsTable manager={getManagerOperationData(manager)} locale={locale} />
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Table2 className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold text-slate-950">{translate(locale, 'manager.completeHoldings')}</h2>
          </div>
          <HoldingsTable manager={manager} locale={locale} />
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <Alert className="border-primary/20 bg-white text-slate-900 [&>svg]:text-primary">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>{translate(locale, 'manager.evidence.title')}</AlertTitle>
            <AlertDescription>
              {translate(locale, 'manager.evidence.body', {
                accession: manager.latestFiling.accessionNumber,
                date: formatDate(manager.latestFiling.filingDate),
              })}
            </AlertDescription>
          </Alert>
          <Link href={localizedPath(locale, `/live-13f/${nextManager.id}`)} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            {translate(locale, 'manager.next')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
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

function MetricCard({ icon, title, value, description }: { icon: ReactNode; title: string; value: string; description: string }) {
  return (
    <Card className="border-stone-200 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-2xl font-semibold text-slate-950">{value}</div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function InsightCard({ title, change, tone, locale }: { title: string; change: CompanyChange | null; tone: 'increase' | 'decrease'; locale: Locale }) {
  const { changeName, formatPercent, formatSignedCurrency, formatSignedNumber } = getViewFormatters(locale);
  return (
    <Card className="border-stone-200 bg-white">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{translate(locale, 'manager.insight.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {change ? (
          <Link href={localizedPath(locale, stockPath(change.companyId))} className="block rounded-lg border border-stone-200 bg-stone-50 p-4 hover:border-primary/40">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="font-semibold text-slate-950">{change.canonicalName || change.issuerName}</div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">{change.rawCusips?.join(', ') || change.cusip}</div>
              </div>
              <Badge variant={tone === 'increase' ? 'success' : 'destructive'} className="w-fit rounded-md">{changeName(change.changeType)}</Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Metric label={translate(locale, 'common.shareChange')} value={formatSignedNumber(change.shareChange)} tone={directionTextClass(change.shareChange)} />
              <Metric label={translate(locale, 'common.valueChange')} value={formatSignedCurrency(change.valueChange)} tone={directionTextClass(change.valueChange)} />
              <Metric label={translate(locale, 'common.weightChange')} value={formatPercent(change.weightChange)} tone={directionTextClass(change.weightChange)} />
            </div>
          </Link>
        ) : (
          <div className="rounded-lg border border-dashed border-stone-300 p-4 text-sm text-muted-foreground">{translate(locale, 'common.noData')}</div>
        )}
      </CardContent>
    </Card>
  );
}
