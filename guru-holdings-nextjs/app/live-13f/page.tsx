import Link from 'next/link';
import type { ReactNode } from 'react';
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
} from 'lucide-react';
import snapshot from '@/data-generated/snapshots/latest.json';
import { ExplorerSearch } from '@/components/explorer/ExplorerSearch';
import { ManagerCompare } from '@/components/explorer/ManagerCompare';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  changeBadgeVariant,
  changeName,
  concentrationName,
  directionTextClass,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatSignedCurrency,
  formatSignedNumber,
  formatWeight,
  themeName,
} from '@/lib/sec13f-view';
import { getExplorerData, getManagerCompareData } from '@/lib/sec13f-lite';

type Snapshot = typeof snapshot;
type Manager = Snapshot['managers'][number];
type ConsensusItem = Snapshot['consensus']['sharedIncrease'][number];

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
          <table className="w-full min-w-[980px] text-left text-sm">
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
                      <Link href={`/stocks/${encodeURIComponent(item.companyId)}`} className="font-semibold text-slate-950 hover:text-primary hover:underline">
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

export default function Live13FPage() {
  const explorerData = getExplorerData();
  const managerCompareData = getManagerCompareData();
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
                真实 13F 数据探索
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                搜索股票和机构，筛选本季度变化，比较不同机构的集中度、共同持仓和同向操作。完整持仓事实保留 SEC 原始 CUSIP 行。
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

      <main className="container py-8 lg:py-10">
        <section className="mb-8">
          <ExplorerSearch
            stocks={explorerData.stocks}
            managers={explorerData.managers}
            consensus={explorerData.consensus}
            themes={explorerData.themes}
            stockTotal={explorerData.stockTotal}
            managerTotal={explorerData.managerTotal}
          />
        </section>

        <section className="mb-8 grid gap-4 lg:grid-cols-4">
          <SummaryCard icon={<Database className="h-4 w-4 text-primary" />} title="数据源" value="SEC EDGAR" description={snapshot.dataSource} />
          <SummaryCard icon={<Building2 className="h-4 w-4 text-slate-700" />} title="覆盖机构" value={formatNumber(snapshot.managers.length)} description="固定 CIK 抓取，不按名称模糊匹配。" />
          <SummaryCard icon={<ArrowUpRight className="h-4 w-4 text-emerald-700" />} title="共同增持" value={formatNumber(sharedIncrease.length)} description="至少 2 家机构同季度增持或新增。" />
          <SummaryCard icon={<ArrowDownRight className="h-4 w-4 text-red-700" />} title="共同减持" value={formatNumber(sharedDecrease.length)} description="至少 2 家机构同季度减持或清仓。" />
        </section>

        {snapshot.validation.warnings.length > 0 && (
          <Alert variant="warning" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>自动校验 warning</AlertTitle>
            <AlertDescription className="break-words">
              {snapshot.validation.warnings.join('；')}。warning 不阻断发布，但页面会展示，避免误解数据覆盖范围。
            </AlertDescription>
          </Alert>
        )}

        <section className="mb-10">
          <ManagerCompare managers={managerCompareData} />
        </section>

        <section className="mb-10 grid gap-6">
          <ConsensusTable
            title="本季度共同增持"
            description="同一归一化公司下，至少两家机构增持或新增；股数、市值和仓位变化均来自公司级 13F 聚合。"
            items={sharedIncrease}
            direction="increase"
          />
          <ConsensusTable
            title="本季度共同减持"
            description="同一归一化公司下，至少两家机构减持或清仓；清仓也会计入共同减持。"
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
              <Card key={manager.id} className="border-stone-200 bg-white">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-lg leading-tight">{manager.displayName}</CardTitle>
                      <CardDescription className="mt-1">{manager.leadInvestor}</CardDescription>
                    </div>
                    <Badge variant={managerStatusVariant(manager)} className="rounded-md">
                      {manager.latestQuarter}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-5 pt-0">
                  <div className="grid grid-cols-3 gap-3">
                    <SmallStat label="公司数" value={formatNumber(manager.companyHoldings.length)} />
                    <SmallStat label="Top10" value={formatWeight(manager.metrics.top10Weight)} />
                    <SmallStat label="集中度" value={concentrationName(manager.metrics.concentration)} />
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
              <Card key={theme.theme} className="border-stone-200 bg-white">
                <CardHeader className="p-5 pb-3">
                  <CardTitle className="text-base">{themeName(theme.theme)}</CardTitle>
                  <CardDescription>
                    {theme.managerCount} 家机构，{theme.companyCount} 家公司
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

        <section>
          <Alert className="rounded-lg border-primary/20 bg-white text-slate-900 [&>svg]:text-primary">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>有效性证明</AlertTitle>
            <AlertDescription className="break-words">
              本次发布快照生成于 {formatDateTime(snapshot.generatedAt)}。自动校验会重新请求 SEC XML，并比较远端 hash、本地 raw hash 和 snapshot hash。
              Alphabet / Google 的 02079K107、02079K305 会在共同变化中合并，原始 CUSIP 仍保留在股票详情和完整持仓表。
            </AlertDescription>
          </Alert>
        </section>
      </main>
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
      <div className="mt-1 truncate font-mono font-semibold text-slate-950">{value}</div>
    </div>
  );
}
