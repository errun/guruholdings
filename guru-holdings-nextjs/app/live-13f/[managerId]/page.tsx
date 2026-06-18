import Link from 'next/link';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  changeBadgeVariant,
  changeName,
  directionTextClass,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  formatSignedCurrency,
  formatSignedNumber,
  themeName,
} from '@/lib/sec13f-view';

type Manager = typeof snapshot.managers[number];
type CompanyChange = Manager['latestCompanyChanges'][number];
type Holding = Manager['holdings'][number];

interface ManagerPageProps {
  params: Promise<{ managerId: string }>;
}

export function generateStaticParams() {
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
}: {
  title: string;
  description: string;
  changes: CompanyChange[];
  tone: 'increase' | 'decrease';
}) {
  const Icon = tone === 'increase' ? TrendingUp : TrendingDown;
  const iconClass = tone === 'increase' ? 'text-emerald-700' : 'text-red-700';

  return (
    <Card className="border-stone-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className={`h-5 w-5 ${iconClass}`} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {changes.slice(0, 10).map((change) => (
          <div key={`${title}-${change.companyId}`} className="rounded-lg border border-stone-200 bg-white p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="font-semibold text-slate-950">{change.canonicalName || change.issuerName}</div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">{change.rawCusips?.join(', ') || change.cusip}</div>
              </div>
              <Badge variant={changeBadgeVariant(change.changeType)} className="w-fit rounded-md">
                {changeName(change.changeType)}
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <div className="text-xs text-muted-foreground">股数变化</div>
                <div className={`mt-1 font-mono text-sm font-semibold ${directionTextClass(change.shareChange)}`}>
                  {formatSignedNumber(change.shareChange)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">市值变化</div>
                <div className={`mt-1 font-mono text-sm font-semibold ${directionTextClass(change.valueChange)}`}>
                  {formatSignedCurrency(change.valueChange)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">仓位变化</div>
                <div className={`mt-1 font-mono text-sm font-semibold ${directionTextClass(change.weightChange)}`}>
                  {formatPercent(change.weightChange)}
                </div>
              </div>
            </div>
          </div>
        ))}
        {changes.length === 0 && (
          <div className="rounded-lg border border-dashed border-stone-300 p-4 text-sm text-muted-foreground">
            本季度没有对应变化。
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HoldingsTable({ manager }: { manager: Manager }) {
  const changesBySecurity = new Map(manager.latestChanges.map((change) => [change.securityId, change]));

  return (
    <div className="max-w-full overflow-x-auto rounded-lg border border-stone-200 bg-white">
      <table className="w-full min-w-[1120px] text-left text-sm">
        <thead className="bg-stone-100 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">公司</th>
            <th className="px-4 py-3">CUSIP</th>
            <th className="px-4 py-3">归一化公司</th>
            <th className="px-4 py-3 text-right">市值</th>
            <th className="px-4 py-3 text-right">股数</th>
            <th className="px-4 py-3 text-right">权重</th>
            <th className="px-4 py-3">变化</th>
            <th className="px-4 py-3">主题</th>
            <th className="px-4 py-3">来源</th>
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
                  <div className="text-sm text-slate-800">{holding.canonicalName || holding.issuerName}</div>
                  <div className="font-mono text-xs text-muted-foreground">{holding.canonicalCompanyId}</div>
                </td>
                <td className="px-4 py-3 text-right font-mono font-medium text-slate-950">{formatCurrency(holding.value, false)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-slate-700">{formatNumber(holding.shares)}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-700">{holding.weight.toFixed(2)}%</td>
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

export default async function ManagerPage({ params }: ManagerPageProps) {
  const { managerId } = await params;
  const manager = snapshot.managers.find((item) => item.id === managerId);
  if (!manager) notFound();

  const increases = changesByType(manager, ['increase', 'new']);
  const decreases = changesByType(manager, ['decrease', 'exit']);
  const nextManager = snapshot.managers[(snapshot.managers.findIndex((item) => item.id === manager.id) + 1) % snapshot.managers.length];

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-stone-200 bg-white">
        <div className="container py-8 lg:py-10">
          <Link href="/live-13f" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            返回 13F 数据
          </Link>
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <Badge variant={managerStatusVariant(manager)} className="mb-4 rounded-md">
                {manager.latestQuarter}
              </Badge>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {manager.displayName}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                {manager.managerName}，CIK <span className="font-mono text-slate-800">{manager.cik}</span>。本页展示最新 13F 完整持仓、最近 4 个季度趋势和本季度新增、清仓、增持、减持。
              </p>
            </div>
            <a
              href={manager.latestFiling.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-stone-50"
            >
              SEC 原始 XML
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <div className="container py-8 lg:py-10">
        {manager.latestQuarter !== snapshot.latestQuarter && (
          <Alert variant="warning" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>该机构最新季度落后于全站最新季度</AlertTitle>
            <AlertDescription>
              全站最新披露季度是 {snapshot.latestQuarter}，但 {manager.displayName} 当前最新可用 13F 是 {manager.latestQuarter}。
            </AlertDescription>
          </Alert>
        )}

        <section className="mb-8 grid gap-4 lg:grid-cols-4">
          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-primary" />
                原始持仓行
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl font-semibold text-slate-950">{formatNumber(manager.latestHoldingCount)}</div>
              <p className="mt-2 text-sm text-muted-foreground">完整 SEC CUSIP 行。</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowUpDown className="h-4 w-4 text-primary" />
                归一化公司
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl font-semibold text-slate-950">{formatNumber(manager.companyHoldings.length)}</div>
              <p className="mt-2 text-sm text-muted-foreground">用于共同变化和主题分析。</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-emerald-700" />
                增持 / 新增
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl font-semibold text-slate-950">{formatNumber(increases.length)}</div>
              <p className="mt-2 text-sm text-muted-foreground">公司级变化。</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingDown className="h-4 w-4 text-red-700" />
                减持 / 清仓
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl font-semibold text-slate-950">{formatNumber(decreases.length)}</div>
              <p className="mt-2 text-sm text-muted-foreground">公司级变化。</p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">最近 4 个季度</h2>
          </div>
          <div className="max-w-full overflow-x-auto rounded-lg border border-stone-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-stone-100 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">季度</th>
                  <th className="px-4 py-3">Filing date</th>
                  <th className="px-4 py-3">Accession</th>
                  <th className="px-4 py-3 text-right">持仓行</th>
                  <th className="px-4 py-3 text-right">总市值</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {manager.quarterSummaries.map((quarter) => (
                  <tr key={quarter.quarter} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-semibold text-slate-950">{quarter.quarter}</td>
                    <td className="px-4 py-3">{formatDate(quarter.filingDate)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{quarter.accessionNumber}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatNumber(quarter.holdingCount)}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(quarter.totalValue, false)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10 grid gap-6 xl:grid-cols-2">
          <ChangeList
            title="本季度增持 / 新增"
            description="按归一化公司聚合后，股数增加或新出现的仓位。"
            changes={increases}
            tone="increase"
          />
          <ChangeList
            title="本季度减持 / 清仓"
            description="按归一化公司聚合后，股数减少或完全退出的仓位。"
            changes={decreases}
            tone="decrease"
          />
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Table2 className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">完整持仓表</h2>
          </div>
          <HoldingsTable manager={manager} />
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <Alert className="border-primary/20 bg-white text-slate-900 [&>svg]:text-primary">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>数据证据链</AlertTitle>
            <AlertDescription>
              当前 filing：{manager.latestFiling.accessionNumber}，提交日期 {formatDate(manager.latestFiling.filingDate)}。
              校验脚本会重新请求 SEC XML，并比对远端、本地 raw 与 snapshot hash。
            </AlertDescription>
          </Alert>
          <Link href={`/live-13f/${nextManager.id}`} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            下一家机构
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
