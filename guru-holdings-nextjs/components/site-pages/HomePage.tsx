import Link from 'next/link';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Database,
  ExternalLink,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import snapshot from '@/data-generated/snapshots/latest.json';
import { ExplorerSearch } from '@/components/explorer/ExplorerSearch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  directionTextClass,
  getViewFormatters,
} from '@/lib/sec13f-view';
import { getExplorerData } from '@/lib/sec13f-lite';
import { localizedPath, translate, type Locale } from '@/lib/i18n/site';

type Manager = typeof snapshot.managers[number];
type ConsensusItem = typeof snapshot.consensus.sharedIncrease[number];

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
  const Icon = direction === 'increase' ? ArrowUpRight : ArrowDownRight;
  const title = item.canonicalName || item.issuerName;
  const { changeName, formatPercent, formatSignedCurrency, formatSignedNumber } = getViewFormatters(locale);

  return (
    <Link href={localizedPath(locale, `/stocks/${encodeURIComponent(item.companyId)}`)} className="block rounded-lg border border-stone-200 bg-white p-4 transition-colors hover:border-primary/40 hover:bg-stone-50">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${direction === 'increase' ? 'text-emerald-700' : 'text-red-700'}`} />
            <h3 className="break-words text-base font-semibold text-slate-950">{title}</h3>
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {item.rawCusips?.join(', ') || item.cusip}
          </p>
        </div>
        <Badge variant={direction === 'increase' ? 'success' : 'destructive'} className="w-fit rounded-md">
          {translate(locale, 'common.managerCount', { count: rows.length })}
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric label={translate(locale, 'common.shareChange')} value={formatSignedNumber(item.netShareChange)} tone={directionTextClass(item.netShareChange)} />
        <Metric label={translate(locale, 'common.valueChange')} value={formatSignedCurrency(item.netValueChange)} tone={directionTextClass(item.netValueChange)} />
        <Metric label={translate(locale, 'common.weightChange')} value={formatPercent(item.netWeightChange)} tone={directionTextClass(item.netWeightChange)} />
      </div>

      <div className="mt-4 space-y-2">
        {rows.slice(0, 4).map((manager) => (
          <div key={`${item.companyId}-${manager.managerId}`} className="grid gap-2 rounded-md bg-stone-50 p-3 text-sm sm:grid-cols-[1fr_auto_auto]">
            <span className="font-medium text-slate-900">{manager.managerName}</span>
            <span className="font-mono text-slate-700">{changeName(manager.changeType)}</span>
            <span className="font-mono text-muted-foreground">{formatSignedNumber(manager.shareChange)}</span>
          </div>
        ))}
      </div>
    </Link>
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

export function HomePage({ locale }: { locale: Locale }) {
  const explorerData = getExplorerData();
  const {
    concentrationName,
    formatCurrency,
    formatDate,
    formatDateTime,
    formatNumber,
    formatQuarter,
    formatWeight,
  } = getViewFormatters(locale);
  const totalValue = snapshot.managers.reduce((sum, manager) => sum + manager.latestTotalValue, 0);
  const totalCompanyHoldings = snapshot.managers.reduce((sum, manager) => sum + manager.companyHoldings.length, 0);
  const topSharedIncrease = snapshot.consensus.sharedIncrease.slice(0, 4);
  const topSharedDecrease = snapshot.consensus.sharedDecrease.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-stone-200 bg-[linear-gradient(180deg,#fbfaf7_0%,#f4f0e8_100%)]">
        <div className="container py-8 lg:py-12">
          <div className="space-y-7">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
              <div className="max-w-3xl">
                <Badge variant="info" className="mb-4 rounded-md">
                  SEC EDGAR 13F
                </Badge>
                <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
                  {translate(locale, 'home.hero.title')}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  {translate(locale, 'home.hero.subtitle')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                <Stat label={translate(locale, 'home.latestQuarter')} value={formatQuarter(snapshot.latestQuarter)} />
                <Stat label={translate(locale, 'common.managers')} value={formatNumber(snapshot.managers.length)} />
                <Stat label={translate(locale, 'home.stockIndex')} value={formatNumber(snapshot.stocks.length)} />
                <Stat label={translate(locale, 'home.combinedValue')} value={formatCurrency(totalValue)} />
              </div>
            </div>

            <ExplorerSearch
              stocks={explorerData.stocks}
              managers={explorerData.managers}
              consensus={explorerData.consensus}
              themes={explorerData.themes}
              stockTotal={explorerData.stockTotal}
              managerTotal={explorerData.managerTotal}
              locale={locale}
              compact
            />
          </div>
        </div>
      </section>

      <div className="container py-8 lg:py-10">
        {snapshot.validation.warnings.length > 0 && (
          <Alert variant="warning" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{translate(locale, 'home.warning.title')}</AlertTitle>
            <AlertDescription className="break-words">
              {translate(locale, 'home.warning.body', { warnings: snapshot.validation.warnings.join('; ') })}
            </AlertDescription>
          </Alert>
        )}

        <section className="mb-10 grid gap-5 lg:grid-cols-4">
          <Card className="border-stone-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                {translate(locale, 'home.validation.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-emerald-700">{snapshot.validation.status}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{translate(locale, 'home.validation.description')}</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowUpRight className="h-4 w-4 text-emerald-700" />
                {translate(locale, 'home.sharedIncrease')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-950">{snapshot.consensus.sharedIncrease.length}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{translate(locale, 'home.sharedIncrease.description')}</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowDownRight className="h-4 w-4 text-red-700" />
                {translate(locale, 'home.sharedDecrease')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-950">{snapshot.consensus.sharedDecrease.length}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{translate(locale, 'home.sharedDecrease.description')}</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4 text-primary" />
                {translate(locale, 'home.companyHoldings')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-950">{formatNumber(totalCompanyHoldings)}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{translate(locale, 'home.companyHoldings.description')}</p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">{translate(locale, 'home.consensus.title')}</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {translate(locale, 'home.consensus.note')}
              </p>
            </div>
            <Link href={localizedPath(locale, '/live-13f')} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              {translate(locale, 'home.consensus.viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card className="border-stone-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ArrowUpRight className="h-5 w-5 text-emerald-700" />
                  {translate(locale, 'home.sharedIncrease')}
                </CardTitle>
                <CardDescription>{translate(locale, 'home.consensus.increaseSignals', { count: snapshot.consensus.sharedIncrease.length })}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topSharedIncrease.map((item) => (
                  <ConsensusCard key={`inc-${item.companyId}`} item={item} direction="increase" locale={locale} />
                ))}
              </CardContent>
            </Card>

            <Card className="border-stone-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ArrowDownRight className="h-5 w-5 text-red-700" />
                  {translate(locale, 'home.sharedDecrease')}
                </CardTitle>
                <CardDescription>{translate(locale, 'home.consensus.decreaseSignals', { count: snapshot.consensus.sharedDecrease.length })}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topSharedDecrease.map((item) => (
                  <ConsensusCard key={`dec-${item.companyId}`} item={item} direction="decrease" locale={locale} />
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Database className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold text-slate-950">{translate(locale, 'home.popularManagers')}</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {snapshot.managers.map((manager) => (
              <Link key={manager.id} href={localizedPath(locale, `/live-13f/${manager.id}`)} className="group block">
                <Card className="h-full border-stone-200 bg-white transition-colors group-hover:border-primary/40">
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
                    <div className="text-sm leading-6 text-muted-foreground">
                      {translate(locale, 'home.filing')}: {formatDate(manager.latestFiling.filingDate)}
                      <br />
                      {translate(locale, 'common.marketValue')}: <span className="font-mono text-slate-900">{formatCurrency(manager.latestTotalValue)}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
                      {translate(locale, 'home.openManager')}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card className="border-stone-200 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-emerald-700" />
                {translate(locale, 'home.gate.title')}
              </CardTitle>
              <CardDescription>{translate(locale, 'home.gate.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>{translate(locale, 'home.generatedAt')}: {formatDateTime(snapshot.generatedAt)}</p>
              <p>{translate(locale, 'home.fingerprint')}: <span className="font-mono text-xs text-slate-800">{snapshot.dataFingerprint.slice(0, 16)}</span></p>
              <p>{translate(locale, 'home.searchMap', { count: snapshot.securityNormalization.canonicalCompanies.length })}</p>
            </CardContent>
          </Card>

          <Card className="border-stone-200 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ExternalLink className="h-5 w-5 text-primary" />
                {translate(locale, 'home.evidence.title')}
              </CardTitle>
              <CardDescription>{translate(locale, 'home.evidence.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {snapshot.managers.slice(0, 5).map((manager) => (
                <a
                  key={manager.id}
                  href={manager.latestFiling.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 rounded-md border border-stone-200 bg-white px-3 py-2 text-slate-700 hover:border-primary/40 hover:text-primary"
                >
                  <span className="break-words">{manager.displayName}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 break-words font-mono text-lg font-semibold leading-tight text-slate-950 sm:text-xl">{value}</div>
    </div>
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
