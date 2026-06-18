import Link from 'next/link';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Database,
  ExternalLink,
  FileCheck2,
  Layers3,
  Table2,
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
  formatDateTime,
  formatNumber,
  formatPercent,
  formatSignedCurrency,
  formatSignedNumber,
  themeName,
} from '@/lib/sec13f-view';

type Snapshot = typeof snapshot;
type Manager = Snapshot['managers'][number];
type ConsensusItem = Snapshot['consensus']['sharedIncrease'][number];
type Holding = Manager['holdings'][number];

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
}: {
  title: string;
  description: string;
  items: ConsensusItem[];
  direction: 'increase' | 'decrease';
}) {
  const Icon = direction === 'increase' ? ArrowUpRight : ArrowDownRight;
  const iconClass = direction === 'increase' ? 'text-emerald-700' : 'text-red-700';

  return (
    <Card className="border-stone-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Icon className={`h-5 w-5 ${iconClass}`} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[940px] text-left text-sm">
            <thead className="border-y border-stone-200 bg-stone-100 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">公司</th>
                <th className="px-4 py-3">涉及机构</th>
                <th className="px-4 py-3 text-right">股数变化</th>
                <th className="px-4 py-3 text-right">市值变化</th>
                <th className="px-4 py-3 text-right">仓位变化</th>
                <th className="px-4 py-3">明细</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items.map((item) => {
                const rows = directionalManagers(item, direction);
                return (
                  <tr key={`${direction}-${item.companyId}`} className="align-top hover:bg-stone-50">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-950">{item.canonicalName || item.issuerName}</div>
                      <div className="mt-1 font-mono text-xs text-muted-foreground">{item.rawCusips?.join(', ') || item.cusip}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex max-w-[260px] flex-wrap gap-1.5">
                        {rows.map((manager) => (
                          <Badge key={`${item.companyId}-${manager.managerId}`} variant="outline" className="rounded-md border-stone-300 bg-white text-slate-700">
                            {manager.managerName}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className={`px-4 py-4 text-right font-mono font-semibold ${directionTextClass(item.netShareChange)}`}>
                      {formatSignedNumber(item.netShareChange)}
                      <div className="text-xs font-normal text-muted-foreground">{formatPercent(item.netShareChangePercent)}</div>
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
                            <span className="truncate text-slate-700">{changeName(manager.changeType)}</span>
                            <span className="font-mono text-slate-700">{formatSignedNumber(manager.shareChange)}</span>
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

function HoldingsTable({ manager }: { manager: Manager }) {
  const changesBySecurity = new Map(manager.latestChanges.map((change) => [change.securityId, change]));

  return (
    <details className="min-w-0 rounded-lg border border-stone-200 bg-white shadow-sm" open={manager.id === 'berkshire'}>
      <summary className="flex cursor-pointer flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold text-slate-950">{manager.displayName}</div>
          <div className="text-sm text-muted-foreground">
            {manager.latestQuarter}，完整 {formatNumber(manager.holdings.length)} 条原始 CUSIP 持仓
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={managerStatusVariant(manager)} className="w-fit rounded-md">
            {manager.latestQuarter}
          </Badge>
          <Badge variant="outline" className="w-fit rounded-md border-stone-300">
            {formatCurrency(manager.latestTotalValue)}
          </Badge>
        </div>
      </summary>

      <div className="border-t border-stone-200">
        <div className="max-w-full overflow-x-auto">
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
      </div>
    </details>
  );
}

export default function Live13FPage() {
  const sharedIncrease = snapshot.consensus.sharedIncrease;
  const sharedDecrease = snapshot.consensus.sharedDecrease;
  const themeChanges = snapshot.consensus.themeChanges;

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-stone-200 bg-white">
        <div className="container py-8 lg:py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <Badge variant="info" className="mb-4 rounded-md">
                SEC EDGAR 自动抓取
              </Badge>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                真实 13F 持仓数据
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                本页读取发布快照 <span className="font-mono text-slate-900">data-generated/snapshots/latest.json</span>。共同变化按归一化公司聚合，完整表格保留 SEC 原始 CUSIP 行。
              </p>
            </div>

            <div className="grid min-w-[280px] grid-cols-2 gap-3">
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">最新披露季度</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">{snapshot.latestQuarter}</div>
              </div>
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">校验状态</div>
                <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                  {snapshot.validation.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8 lg:py-10">
        <section className="mb-8 grid gap-4 lg:grid-cols-4">
          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4 text-primary" />
                数据源
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-950">SEC EDGAR</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{snapshot.dataSource}</p>
            </CardContent>
          </Card>

          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-slate-700" />
                覆盖机构
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-950">{snapshot.managers.length}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">固定 CIK 抓取，不按名称模糊匹配。</p>
            </CardContent>
          </Card>

          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowUpRight className="h-4 w-4 text-emerald-700" />
                共同增持
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-950">{sharedIncrease.length}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">至少 2 家机构同季度增持或新增。</p>
            </CardContent>
          </Card>

          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowDownRight className="h-4 w-4 text-red-700" />
                共同减持
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-950">{sharedDecrease.length}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">至少 2 家机构同季度减持或清仓。</p>
            </CardContent>
          </Card>
        </section>

        {snapshot.validation.warnings.length > 0 && (
          <Alert variant="warning" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>自动校验 warning</AlertTitle>
            <AlertDescription className="break-words">
              {snapshot.validation.warnings.join('；')}。warning 不阻断发布，但页面会明确展示，避免误解数据覆盖范围。
            </AlertDescription>
          </Alert>
        )}

        <section className="mb-10 grid gap-6">
          <ConsensusTable
            title="本季度共同增持"
            description="同一归一化公司下，至少两个机构增持或新增；股数、市值和仓位变化均来自自动复算。"
            items={sharedIncrease}
            direction="increase"
          />
          <ConsensusTable
            title="本季度共同减持"
            description="同一归一化公司下，至少两个机构减持或清仓；清仓也会计入共同减持。"
            items={sharedDecrease}
            direction="decrease"
          />
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <FileCheck2 className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">机构抓取结果</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {snapshot.managers.map((manager) => (
              <Card key={manager.id} className="border-stone-200">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg leading-tight">{manager.displayName}</CardTitle>
                      <CardDescription className="mt-1">{manager.leadInvestor}</CardDescription>
                    </div>
                    <Badge variant={managerStatusVariant(manager)} className="rounded-md">
                      {manager.latestQuarter}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-5 pt-0">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md bg-stone-100 p-3">
                      <div className="text-xs text-muted-foreground">原始持仓行</div>
                      <div className="mt-1 font-mono font-semibold text-slate-950">{formatNumber(manager.latestHoldingCount)}</div>
                    </div>
                    <div className="rounded-md bg-stone-100 p-3">
                      <div className="text-xs text-muted-foreground">总市值</div>
                      <div className="mt-1 font-mono font-semibold text-slate-950">{formatCurrency(manager.latestTotalValue)}</div>
                    </div>
                  </div>

                  <div className="rounded-md border border-stone-200 p-3 text-sm leading-6 text-muted-foreground">
                    <div>CIK：<span className="font-mono text-slate-800">{manager.cik}</span></div>
                    <div>Filing：{formatDate(manager.latestFiling.filingDate)}</div>
                    <div>Accession：<span className="font-mono text-xs text-slate-800">{manager.latestFiling.accessionNumber}</span></div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/live-13f/${manager.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                      机构详情
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <a
                      href={manager.latestFiling.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      SEC 原始 XML
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
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">行业 / 主题变化</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {themeChanges.map((theme) => (
              <Card key={theme.theme} className="border-stone-200">
                <CardHeader className="p-5 pb-3">
                  <CardTitle className="text-base">{themeName(theme.theme)}</CardTitle>
                  <CardDescription>
                    {theme.managerCount} 个机构，{theme.companyCount} 家公司
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className={`font-mono text-lg font-semibold ${directionTextClass(theme.netValueChange)}`}>
                    {formatSignedCurrency(theme.netValueChange)}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    净仓位变化 {formatPercent(theme.netWeightChange)}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-md bg-emerald-50 p-2 text-emerald-800">增持 {theme.increaseCount}</div>
                    <div className="rounded-md bg-red-50 p-2 text-red-800">减持 {theme.decreaseCount}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Table2 className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">每个机构完整持仓表</h2>
          </div>

          <div className="space-y-5">
            {snapshot.managers.map((manager) => (
              <HoldingsTable key={manager.id} manager={manager} />
            ))}
          </div>
        </section>

        <section>
          <Alert className="rounded-lg border-primary/20 bg-white text-slate-900 [&>svg]:text-primary">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>有效性证明</AlertTitle>
            <AlertDescription className="break-words">
              本次发布快照生成于 {formatDateTime(snapshot.generatedAt)}。自动校验会重新请求 SEC XML，并比较远端 hash、本地 raw hash 和 snapshot hash。
              Alphabet / Google 的 02079K107、02079K305 已在共同变化中合并，原始 CUSIP 仍保留在完整持仓表。
            </AlertDescription>
          </Alert>
        </section>
      </div>
    </div>
  );
}
