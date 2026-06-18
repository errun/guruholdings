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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  changeName,
  directionTextClass,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatSignedCurrency,
  formatSignedNumber,
} from '@/lib/sec13f-view';

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

function ConsensusCard({
  item,
  direction,
}: {
  item: ConsensusItem;
  direction: 'increase' | 'decrease';
}) {
  const rows = directionalManagers(item, direction);
  const Icon = direction === 'increase' ? ArrowUpRight : ArrowDownRight;
  const tone = direction === 'increase' ? 'text-emerald-700' : 'text-red-700';
  const title = item.canonicalName || item.issuerName;

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${tone}`} />
            <h3 className="truncate text-base font-semibold text-slate-950">{title}</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            CUSIP {item.rawCusips?.join(', ') || item.cusip}
          </p>
        </div>
        <Badge variant={direction === 'increase' ? 'success' : 'destructive'} className="w-fit rounded-md">
          {rows.length} 个机构
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <div className="text-xs text-muted-foreground">合计股数变化</div>
          <div className={`mt-1 font-mono text-sm font-semibold ${directionTextClass(item.netShareChange)}`}>
            {formatSignedNumber(item.netShareChange)}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">市值变化</div>
          <div className={`mt-1 font-mono text-sm font-semibold ${directionTextClass(item.netValueChange)}`}>
            {formatSignedCurrency(item.netValueChange)}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">仓位占比变化</div>
          <div className={`mt-1 font-mono text-sm font-semibold ${directionTextClass(item.netWeightChange)}`}>
            {formatPercent(item.netWeightChange)}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {rows.slice(0, 4).map((manager) => (
          <div key={`${item.companyId}-${manager.managerId}`} className="grid gap-2 rounded-md bg-stone-50 p-3 text-sm sm:grid-cols-[1fr_auto_auto]">
            <span className="font-medium text-slate-900">{manager.managerName}</span>
            <span className="font-mono text-slate-700">{formatSignedNumber(manager.shareChange)}</span>
            <span className="font-mono text-muted-foreground">{formatPercent(manager.weightChange)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const totalValue = snapshot.managers.reduce((sum, manager) => sum + manager.latestTotalValue, 0);
  const totalHoldings = snapshot.managers.reduce((sum, manager) => sum + manager.latestHoldingCount, 0);
  const totalCompanyHoldings = snapshot.managers.reduce((sum, manager) => sum + manager.companyHoldings.length, 0);
  const topSharedIncrease = snapshot.consensus.sharedIncrease.slice(0, 3);
  const topSharedDecrease = snapshot.consensus.sharedDecrease.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-stone-200 bg-[linear-gradient(180deg,#fbfaf7_0%,#f4f0e8_100%)]">
        <div className="container py-8 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-end">
            <div>
              <Badge variant="info" className="mb-4 rounded-md">
                SEC EDGAR 13F 自动数据
              </Badge>
              <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                投资机构持仓与共同变化追踪
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                首页直接读取已校验的 13F 快照，优先展示本季度共同增持、共同减持和每家机构的最新披露状态。数据来自 SEC 原始 information table，存在披露延迟。
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/live-13f"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  查看完整 13F 数据
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/data-automation-check"
                  className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-stone-50"
                >
                  自动化验证
                  <FileText className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-stone-200 bg-white p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">最新披露季度</div>
                <div className="mt-2 text-xl font-semibold text-slate-950">{snapshot.latestQuarter}</div>
              </div>
              <div className="rounded-lg border border-stone-200 bg-white p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">校验状态</div>
                <div className="mt-2 flex items-center gap-2 text-xl font-semibold text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                  {snapshot.validation.status}
                </div>
              </div>
              <div className="rounded-lg border border-stone-200 bg-white p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">最新总市值</div>
                <div className="mt-2 text-xl font-semibold text-slate-950">{formatCurrency(totalValue)}</div>
              </div>
              <div className="rounded-lg border border-stone-200 bg-white p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">原始持仓行</div>
                <div className="mt-2 text-xl font-semibold text-slate-950">{formatNumber(totalHoldings)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8 lg:py-10">
        {snapshot.validation.warnings.length > 0 && (
          <Alert variant="warning" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>当前数据有 warning，但未阻断发布</AlertTitle>
            <AlertDescription className="break-words">
              {snapshot.validation.warnings.join('；')}。warning 会展示给用户，避免误以为所有机构都披露到同一季度。
            </AlertDescription>
          </Alert>
        )}

        <section className="mb-10">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">本季度共同变化</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                共同变化按归一化公司聚合，例如 Alphabet 的 02079K107 和 02079K305 会合并分析；完整持仓表仍保留原始 CUSIP。
              </p>
            </div>
            <Link href="/live-13f" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              查看全部共同变化
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card className="border-stone-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ArrowUpRight className="h-5 w-5 text-emerald-700" />
                  本季度共同增持
                </CardTitle>
                <CardDescription>{snapshot.consensus.sharedIncrease.length} 条信号，至少 2 家机构同季度增持或新增。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topSharedIncrease.map((item) => (
                  <ConsensusCard key={`inc-${item.companyId}`} item={item} direction="increase" />
                ))}
              </CardContent>
            </Card>

            <Card className="border-stone-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ArrowDownRight className="h-5 w-5 text-red-700" />
                  本季度共同减持
                </CardTitle>
                <CardDescription>{snapshot.consensus.sharedDecrease.length} 条信号，至少 2 家机构同季度减持或清仓。</CardDescription>
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
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">机构概览</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {snapshot.managers.map((manager) => (
              <Link key={manager.id} href={`/live-13f/${manager.id}`} className="group block">
                <Card className="h-full border-stone-200 transition-colors group-hover:border-primary/40 group-hover:bg-white">
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
                        <div className="text-xs text-muted-foreground">归一化公司</div>
                        <div className="mt-1 font-mono font-semibold text-slate-950">{formatNumber(manager.companyHoldings.length)}</div>
                      </div>
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
          <Card className="border-stone-200">
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
              <p>归一化配置：{snapshot.securityNormalization.canonicalCompanies.length} 条，目前包含 Alphabet / Google 双 CUSIP 合并规则。</p>
            </CardContent>
          </Card>

          <Card className="border-stone-200">
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
      </div>
    </div>
  );
}
