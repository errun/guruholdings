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
  changeName,
  directionTextClass,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  formatSignedCurrency,
  formatSignedNumber,
  formatWeight,
  themeName,
} from '@/lib/sec13f-view';
import { getStockChartData } from '@/lib/sec13f-lite';

type Stock = typeof snapshot.stocks[number];

interface StockPageProps {
  params: Promise<{ companyId: string }>;
}

export function generateStaticParams() {
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

export default async function StockPage({ params }: StockPageProps) {
  const { companyId } = await params;
  const decodedCompanyId = decodeURIComponent(companyId);
  const stock = snapshot.stocks.find((item) => item.companyId === decodedCompanyId);
  if (!stock) notFound();

  const increaseSignals = stock.consensusSignals.filter((item) => item.direction === 'increase');
  const decreaseSignals = stock.consensusSignals.filter((item) => item.direction === 'decrease');

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
              <Badge variant="info" className="mb-4 rounded-md">
                {stock.latestQuarter}
              </Badge>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {stock.canonicalName}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                {stock.canonicalTicker ? `${stock.canonicalTicker}，` : ''}原始 CUSIP：<span className="font-mono text-slate-800">{stock.rawCusips.join(', ')}</span>。本页展示当前持有机构、季度变化和 SEC 原始来源。
              </p>
            </div>
            <div className="grid min-w-[280px] grid-cols-2 gap-3">
              <HeaderStat label="持有机构" value={formatNumber(stock.latestHolderCount)} />
              <HeaderStat label="合计市值" value={formatCurrency(stock.latestTotalValue)} />
            </div>
          </div>
        </div>
      </section>

      <main className="container py-8 lg:py-10">
        <section className="mb-8 grid gap-4 lg:grid-cols-4">
          <MetricCard title="当前持有机构" value={formatNumber(stock.latestHolderCount)} description="按各机构最新可用 13F 计算。" />
          <MetricCard title="合计股数" value={formatNumber(stock.latestTotalShares)} description="公司级聚合，保留原始 CUSIP 明细。" />
          <MetricCard title="合计市值" value={formatCurrency(stock.latestTotalValue)} description="不同机构同一季度市值相加。" />
          <MetricCard title="主题" value={(stock.themes || []).map(themeName).join(' / ')} description="本地映射只用于搜索和分类。" />
        </section>

        {(increaseSignals.length > 0 || decreaseSignals.length > 0) && (
          <section className="mb-8 grid gap-4 lg:grid-cols-2">
            {increaseSignals.map((signal) => (
              <SignalCard key={`inc-${stock.companyId}`} signal={signal} direction="increase" />
            ))}
            {decreaseSignals.map((signal) => (
              <SignalCard key={`dec-${stock.companyId}`} signal={signal} direction="decrease" />
            ))}
          </section>
        )}

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Layers3 className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">最近 4 个季度趋势</h2>
          </div>
          <StockTrendChart stock={getStockChartData(stock)} />
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Table2 className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">当前哪些机构持有</h2>
          </div>
          <HoldersTable stock={stock} />
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">原始 CUSIP 明细</h2>
          </div>
          <RawHoldingsTable stock={stock} />
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Table2 className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">季度持有明细</h2>
          </div>
          <QuarterTable stock={stock} />
        </section>

        <Alert className="border-primary/20 bg-white text-slate-900 [&>svg]:text-primary">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>数据来源</AlertTitle>
          <AlertDescription>
            持仓事实来自 SEC 13F information table。ticker、公司别名和主题只用于搜索与归一化展示，不作为持仓来源。
          </AlertDescription>
        </Alert>
      </main>
    </div>
  );
}

function HeaderStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 truncate font-mono text-lg font-semibold text-slate-950">{value}</div>
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
        <div className="truncate font-mono text-2xl font-semibold text-slate-950">{value}</div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function SignalCard({ signal, direction }: { signal: Record<string, any>; direction: 'increase' | 'decrease' }) {
  const Icon = direction === 'increase' ? ArrowUpRight : ArrowDownRight;
  const title = direction === 'increase' ? '本季度共同增持' : '本季度共同减持';
  return (
    <Card className="border-stone-200 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className={`h-5 w-5 ${direction === 'increase' ? 'text-emerald-700' : 'text-red-700'}`} />
          {title}
        </CardTitle>
        <CardDescription>{signal.managerCount} 家机构同向变化。</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <Metric label="股数变化" value={formatSignedNumber(signal.netShareChange)} tone={directionTextClass(signal.netShareChange)} />
        <Metric label="市值变化" value={formatSignedCurrency(signal.netValueChange)} tone={directionTextClass(signal.netValueChange)} />
        <Metric label="仓位变化" value={formatPercent(signal.netWeightChange)} tone={directionTextClass(signal.netWeightChange)} />
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

function HoldersTable({ stock }: { stock: Stock }) {
  return (
    <div className="max-w-full overflow-x-auto rounded-lg border border-stone-200 bg-white">
      <table className="w-full min-w-[1040px] text-left text-sm">
        <thead className="bg-stone-100 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">机构</th>
            <th className="px-4 py-3">季度</th>
            <th className="px-4 py-3 text-right">市值</th>
            <th className="px-4 py-3 text-right">股数</th>
            <th className="px-4 py-3 text-right">仓位占比</th>
            <th className="px-4 py-3">本季度变化</th>
            <th className="px-4 py-3 text-right">股数变化</th>
            <th className="px-4 py-3 text-right">市值变化</th>
            <th className="px-4 py-3">SEC 来源</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {stock.holders.map((holder) => (
            <tr key={`${stock.companyId}-${holder.managerId}`} className="align-top hover:bg-stone-50">
              <td className="px-4 py-3">
                <Link href={`/live-13f/${holder.managerId}`} className="font-semibold text-slate-950 hover:text-primary hover:underline">
                  {holder.managerName}
                </Link>
                <div className="mt-1 text-xs text-muted-foreground">{holder.leadInvestor}</div>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{holder.quarter}</td>
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

function RawHoldingsTable({ stock }: { stock: Stock }) {
  return (
    <div className="max-w-full overflow-x-auto rounded-lg border border-stone-200 bg-white">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-stone-100 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">机构</th>
            <th className="px-4 py-3">Issuer</th>
            <th className="px-4 py-3">CUSIP</th>
            <th className="px-4 py-3">Class</th>
            <th className="px-4 py-3 text-right">市值</th>
            <th className="px-4 py-3 text-right">股数</th>
            <th className="px-4 py-3 text-right">权重</th>
            <th className="px-4 py-3">来源</th>
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

function QuarterTable({ stock }: { stock: Stock }) {
  return (
    <div className="max-w-full overflow-x-auto rounded-lg border border-stone-200 bg-white">
      <table className="w-full min-w-[780px] text-left text-sm">
        <thead className="bg-stone-100 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">季度</th>
            <th className="px-4 py-3 text-right">持有机构</th>
            <th className="px-4 py-3 text-right">合计市值</th>
            <th className="px-4 py-3 text-right">合计股数</th>
            <th className="px-4 py-3">机构明细</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {stock.quarters.map((quarter) => (
            <tr key={quarter.quarter} className="align-top hover:bg-stone-50">
              <td className="px-4 py-3 font-semibold text-slate-950">{quarter.quarter}</td>
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
