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
} from '@/lib/sec13f-view';
import { getExplorerData } from '@/lib/sec13f-lite';

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

function ConsensusCard({ item, direction }: { item: ConsensusItem; direction: 'increase' | 'decrease' }) {
  const rows = directionalManagers(item, direction);
  const Icon = direction === 'increase' ? ArrowUpRight : ArrowDownRight;
  const title = item.canonicalName || item.issuerName;

  return (
    <Link href={`/stocks/${encodeURIComponent(item.companyId)}`} className="block rounded-lg border border-stone-200 bg-white p-4 transition-colors hover:border-primary/40 hover:bg-stone-50">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${direction === 'increase' ? 'text-emerald-700' : 'text-red-700'}`} />
            <h3 className="truncate text-base font-semibold text-slate-950">{title}</h3>
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {item.rawCusips?.join(', ') || item.cusip}
          </p>
        </div>
        <Badge variant={direction === 'increase' ? 'success' : 'destructive'} className="w-fit rounded-md">
          {rows.length} 家机构
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric label="股数变化" value={formatSignedNumber(item.netShareChange)} tone={directionTextClass(item.netShareChange)} />
        <Metric label="市值变化" value={formatSignedCurrency(item.netValueChange)} tone={directionTextClass(item.netValueChange)} />
        <Metric label="仓位变化" value={formatPercent(item.netWeightChange)} tone={directionTextClass(item.netWeightChange)} />
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

export default function HomePage() {
  const explorerData = getExplorerData();
  const totalValue = snapshot.managers.reduce((sum, manager) => sum + manager.latestTotalValue, 0);
  const totalCompanyHoldings = snapshot.managers.reduce((sum, manager) => sum + manager.companyHoldings.length, 0);
  const topSharedIncrease = snapshot.consensus.sharedIncrease.slice(0, 4);
  const topSharedDecrease = snapshot.consensus.sharedDecrease.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-stone-200 bg-[linear-gradient(180deg,#fbfaf7_0%,#f4f0e8_100%)]">
        <div className="container py-8 lg:py-12">
          <div className="grid gap-8 xl:grid-cols-[0.82fr_1.18fr] xl:items-start">
            <div>
              <Badge variant="info" className="mb-4 rounded-md">
                SEC EDGAR 13F
              </Badge>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                投资机构持仓与共同变化
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                搜索股票、机构或投资人，直接看到持有机构、季度变化、共同增持和共同减持。持仓事实只来自 SEC 13F，披露存在时间延迟。
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="最新季度" value={snapshot.latestQuarter} />
                <Stat label="机构" value={formatNumber(snapshot.managers.length)} />
                <Stat label="股票索引" value={formatNumber(snapshot.stocks.length)} />
                <Stat label="合计市值" value={formatCurrency(totalValue)} />
              </div>
            </div>

            <ExplorerSearch
              stocks={explorerData.stocks}
              managers={explorerData.managers}
              consensus={explorerData.consensus}
              themes={explorerData.themes}
              stockTotal={explorerData.stockTotal}
              managerTotal={explorerData.managerTotal}
              compact
            />
          </div>
        </div>
      </section>

      <main className="container py-8 lg:py-10">
        {snapshot.validation.warnings.length > 0 && (
          <Alert variant="warning" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>当前数据有 warning，但未阻止发布</AlertTitle>
            <AlertDescription className="break-words">
              {snapshot.validation.warnings.join('；')}。页面会明确展示这些 warning，避免误以为所有机构都披露到同一季度。
            </AlertDescription>
          </Alert>
        )}

        <section className="mb-10 grid gap-5 lg:grid-cols-4">
          <Card className="border-stone-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                校验状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-emerald-700">{snapshot.validation.status}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">生成后重新校验 SEC XML hash、normalized 和快照一致性。</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowUpRight className="h-4 w-4 text-emerald-700" />
                共同增持
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-950">{snapshot.consensus.sharedIncrease.length}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">至少 2 家机构同季度新增或增持同一公司。</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowDownRight className="h-4 w-4 text-red-700" />
                共同减持
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-950">{snapshot.consensus.sharedDecrease.length}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">至少 2 家机构同季度减持或清仓同一公司。</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4 text-primary" />
                公司级持仓
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-950">{formatNumber(totalCompanyHoldings)}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">原始 CUSIP 行保留，公司级视图用于搜索和分析。</p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">本季度共同变化</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Alphabet / Google 的双 CUSIP 会合并分析，原始 CUSIP 仍保留在股票详情和持仓表中。
              </p>
            </div>
            <Link href="/live-13f" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              查看完整 13F 数据
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card className="border-stone-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ArrowUpRight className="h-5 w-5 text-emerald-700" />
                  本季度共同增持
                </CardTitle>
                <CardDescription>{snapshot.consensus.sharedIncrease.length} 条信号，按参与机构数和净市值变化排序。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topSharedIncrease.map((item) => (
                  <ConsensusCard key={`inc-${item.companyId}`} item={item} direction="increase" />
                ))}
              </CardContent>
            </Card>

            <Card className="border-stone-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ArrowDownRight className="h-5 w-5 text-red-700" />
                  本季度共同减持
                </CardTitle>
                <CardDescription>{snapshot.consensus.sharedDecrease.length} 条信号，清仓也计入共同减持。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topSharedDecrease.map((item) => (
                  <ConsensusCard key={`dec-${item.companyId}`} item={item} direction="decrease" />
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Database className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">热门机构入口</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {snapshot.managers.map((manager) => (
              <Link key={manager.id} href={`/live-13f/${manager.id}`} className="group block">
                <Card className="h-full border-stone-200 bg-white transition-colors group-hover:border-primary/40">
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
                    <div className="text-sm leading-6 text-muted-foreground">
                      Filing：{formatDate(manager.latestFiling.filingDate)}
                      <br />
                      市值：<span className="font-mono text-slate-900">{formatCurrency(manager.latestTotalValue)}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
                      打开机构详情
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
                数据发布闸门
              </CardTitle>
              <CardDescription>校验通过后才会提交到 GitHub，并由 Vercel 自动部署。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>生成时间：{formatDateTime(snapshot.generatedAt)}</p>
              <p>快照指纹：<span className="font-mono text-xs text-slate-800">{snapshot.dataFingerprint.slice(0, 16)}</span></p>
              <p>搜索映射：{snapshot.securityNormalization.canonicalCompanies.length} 条，ticker 和别名只用于搜索与归一化展示。</p>
            </CardContent>
          </Card>

          <Card className="border-stone-200 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ExternalLink className="h-5 w-5 text-primary" />
                原始证据
              </CardTitle>
              <CardDescription>每家机构详情页都能打开 SEC 原始 XML。</CardDescription>
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
                  <span className="truncate">{manager.displayName}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 truncate font-mono text-xl font-semibold text-slate-950">{value}</div>
    </div>
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
