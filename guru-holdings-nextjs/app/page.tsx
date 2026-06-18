import Link from 'next/link';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Database,
  ExternalLink,
  FileText,
} from 'lucide-react';
import snapshot from '@/data-generated/snapshots/latest.json';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Manager = typeof snapshot.managers[number];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string | null | undefined) => {
  if (!value) return 'n/a';
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(`${value}T00:00:00Z`));
};

const managerStatusVariant = (manager: Manager) =>
  manager.latestQuarter === snapshot.latestQuarter ? 'success' as const : 'warning' as const;

export default function HomePage() {
  const totalValue = snapshot.managers.reduce((sum, manager) => sum + manager.latestTotalValue, 0);
  const totalHoldings = snapshot.managers.reduce((sum, manager) => sum + manager.latestHoldingCount, 0);
  const topSharedIncrease = snapshot.consensus.sharedIncrease.slice(0, 4);
  const topSharedDecrease = snapshot.consensus.sharedDecrease.slice(0, 4);

  return (
    <div className="bg-slate-50">
      <div className="container py-8 lg:py-12">
        <section className="mb-8 border-b border-slate-200 pb-8">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <Badge variant="info" className="mb-4 rounded-md">
                SEC 13F 自动数据
              </Badge>
              <h1 className="max-w-4xl font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                投资机构持仓与共同变化追踪
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                当前首页由真实 SEC 13F 快照驱动，覆盖 Berkshire Hathaway、Himalaya Capital、Bridgewater、
                Pershing Square、Scion Asset Management 和 Tiger Global。
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/live-13f"
                  className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  查看完整持仓
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/data-automation-check"
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
                >
                  查看自动化闸门
                  <FileText className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-slate-500">最新披露季度</div>
                <div className="mt-2 text-xl font-semibold text-slate-950">{snapshot.latestQuarter}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-slate-500">校验状态</div>
                <div className="mt-2 flex items-center gap-2 text-xl font-semibold text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                  {snapshot.validation.status}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-slate-500">总市值</div>
                <div className="mt-2 text-xl font-semibold text-slate-950">{formatCurrency(totalValue)}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-slate-500">持仓行数</div>
                <div className="mt-2 text-xl font-semibold text-slate-950">{formatNumber(totalHoldings)}</div>
              </div>
            </div>
          </div>
        </section>

        {snapshot.validation.warnings.length > 0 && (
          <Alert variant="warning" className="mb-8 rounded-lg">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>当前数据 warning</AlertTitle>
            <AlertDescription className="break-words">
              {snapshot.validation.warnings.join('；')}。warning 会展示给用户，但不会阻断发布。
            </AlertDescription>
          </Alert>
        )}

        <section className="mb-10 grid gap-4 lg:grid-cols-3">
          <Card className="rounded-lg border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4 text-blue-700" />
                数据来源
              </CardTitle>
              <CardDescription>所有页面数据来自发布快照，不再使用手写静态持仓。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="font-medium text-slate-950">{snapshot.dataSource}</div>
              <div className="mt-2 text-sm text-slate-500">快照指纹：{snapshot.dataFingerprint.slice(0, 12)}</div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowUpRight className="h-4 w-4 text-emerald-700" />
                共同增持
              </CardTitle>
              <CardDescription>同季度至少两个机构增持或新增同一家公司。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-950">{snapshot.consensus.sharedIncrease.length}</div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowDownRight className="h-4 w-4 text-red-700" />
                共同减持
              </CardTitle>
              <CardDescription>同季度至少两个机构减持或清仓同一家公司。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-950">{snapshot.consensus.sharedDecrease.length}</div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold text-slate-950">机构概览</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {snapshot.managers.map((manager) => (
              <Card key={manager.id} className="rounded-lg border-slate-200 shadow-sm">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">{manager.displayName}</CardTitle>
                      <CardDescription className="mt-1">{manager.leadInvestor}</CardDescription>
                    </div>
                    <Badge variant={managerStatusVariant(manager)} className="rounded-md">
                      {manager.latestQuarter}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-5 pt-0">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-slate-100 p-3">
                      <div className="text-xs text-slate-500">持仓数量</div>
                      <div className="mt-1 font-semibold text-slate-950">{formatNumber(manager.latestHoldingCount)}</div>
                    </div>
                    <div className="rounded-lg bg-slate-100 p-3">
                      <div className="text-xs text-slate-500">总市值</div>
                      <div className="mt-1 font-semibold text-slate-950">{formatCurrency(manager.latestTotalValue)}</div>
                    </div>
                  </div>
                  <div className="text-sm leading-6 text-slate-600">
                    Filing：{formatDate(manager.latestFiling.filingDate)}
                    <br />
                    Accession：<span className="font-mono text-xs">{manager.latestFiling.accessionNumber}</span>
                  </div>
                  <a
                    href={manager.latestFiling.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900"
                  >
                    SEC 原始 XML
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card className="rounded-lg border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ArrowUpRight className="h-5 w-5 text-emerald-700" />
                共同增持预览
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topSharedIncrease.map((item) => (
                <div key={`home-inc-${item.companyId}`} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="font-semibold text-slate-950">{item.issuerName}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.increaseManagers.map((name) => (
                      <Badge key={name} variant="outline" className="rounded-md border-emerald-200 text-emerald-800">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ArrowDownRight className="h-5 w-5 text-red-700" />
                共同减持预览
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topSharedDecrease.map((item) => (
                <div key={`home-dec-${item.companyId}`} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="font-semibold text-slate-950">{item.issuerName}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.decreaseManagers.map((name) => (
                      <Badge key={name} variant="outline" className="rounded-md border-red-200 text-red-800">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
