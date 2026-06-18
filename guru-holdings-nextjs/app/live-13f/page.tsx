import {
  AlertTriangle,
  ArrowDownRight,
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

type Snapshot = typeof snapshot;
type Manager = Snapshot['managers'][number];
type Change = Manager['latestChanges'][number];

const themeLabels: Record<string, string> = {
  technology: '科技',
  financials: '金融',
  consumer: '消费',
  'china-assets': '中国资产',
  energy: '能源',
  healthcare: '医疗健康',
  unclassified: '未分类',
};

const changeLabels: Record<string, string> = {
  new: '新增',
  exit: '清仓',
  increase: '增持',
  decrease: '减持',
  unchanged: '持平',
};

const formatCurrency = (value: number, compact = true) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value);

const formatPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'n/a';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return 'n/a';
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(`${value}T00:00:00Z`));
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const managerStatusVariant = (manager: Manager) =>
  manager.latestQuarter === snapshot.latestQuarter ? 'success' as const : 'warning' as const;

const changeVariant = (change?: Change) => {
  if (!change) return 'secondary' as const;
  if (change.changeType === 'new' || change.changeType === 'increase') return 'success' as const;
  if (change.changeType === 'exit' || change.changeType === 'decrease') return 'destructive' as const;
  return 'secondary' as const;
};

export default function Live13FPage() {
  const sharedIncrease = snapshot.consensus.sharedIncrease;
  const sharedDecrease = snapshot.consensus.sharedDecrease;
  const themeChanges = snapshot.consensus.themeChanges;

  return (
    <div className="bg-slate-50">
      <div className="container py-8 lg:py-10">
        <section className="mb-8 border-b border-slate-200 pb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <Badge variant="info" className="mb-4 rounded-md">
                SEC EDGAR 自动抓取
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                真实 13F 持仓数据
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                本页读取发布快照 <span className="font-mono text-slate-900">data-generated/snapshots/latest.json</span>。
                数据来自 SEC EDGAR 13F information table；变化由最近披露季度和上一披露季度的 shares 自动计算。
              </p>
            </div>

            <div className="grid min-w-[280px] grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-slate-500">最新披露季度</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">{snapshot.latestQuarter}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-slate-500">校验状态</div>
                <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                  {snapshot.validation.status}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 lg:grid-cols-4">
          <Card className="rounded-lg border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4 text-blue-700" />
                数据源
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-950">SEC EDGAR</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{snapshot.dataSource}</p>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-slate-700" />
                覆盖机构
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-950">{snapshot.managers.length}</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">固定 CIK 抓取，不按名称模糊匹配。</p>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowUpRight className="h-4 w-4 text-emerald-700" />
                共同增持
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-950">{sharedIncrease.length}</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">至少 2 个机构同季度增持或新增。</p>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowDownRight className="h-4 w-4 text-red-700" />
                共同减持
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-950">{sharedDecrease.length}</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">至少 2 个机构同季度减持或清仓。</p>
            </CardContent>
          </Card>
        </section>

        {snapshot.validation.warnings.length > 0 && (
          <Alert variant="warning" className="mb-8 rounded-lg">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>自动校验 warning</AlertTitle>
            <AlertDescription className="break-words">
              {snapshot.validation.warnings.join('；')}。warning 不阻断发布，但页面会明确展示，避免误认为所有机构都披露到同一季度。
            </AlertDescription>
          </Alert>
        )}

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <FileCheck2 className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold text-slate-950">机构抓取结果</h2>
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

                  <div className="rounded-lg border border-slate-200 p-3 text-sm leading-6 text-slate-700">
                    <div>CIK：{manager.cik}</div>
                    <div>Filing：{formatDate(manager.latestFiling.filingDate)}</div>
                    <div>Accession：{manager.latestFiling.accessionNumber}</div>
                    <a
                      href={manager.latestFiling.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 font-medium text-blue-700 hover:text-blue-900"
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

        <section className="mb-10 grid gap-6 xl:grid-cols-2">
          <Card className="rounded-lg border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ArrowUpRight className="h-5 w-5 text-emerald-700" />
                本季度共同增持
              </CardTitle>
              <CardDescription>同一 CUSIP/companyId 下，至少两个机构增持或新增。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sharedIncrease.map((item) => (
                <div key={`inc-${item.companyId}`} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="font-semibold text-slate-950">{item.issuerName}</div>
                      <div className="text-sm text-slate-500">CUSIP {item.cusip}</div>
                    </div>
                    <Badge variant="success" className="w-fit rounded-md">
                      {item.increaseManagers.length} 个机构
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
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
                本季度共同减持
              </CardTitle>
              <CardDescription>同一 CUSIP/companyId 下，至少两个机构减持或清仓。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sharedDecrease.map((item) => (
                <div key={`dec-${item.companyId}`} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="font-semibold text-slate-950">{item.issuerName}</div>
                      <div className="text-sm text-slate-500">CUSIP {item.cusip}</div>
                    </div>
                    <Badge variant="destructive" className="w-fit rounded-md">
                      {item.decreaseManagers.length} 个机构
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
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

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Layers3 className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold text-slate-950">行业/主题变化</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {themeChanges.map((theme) => (
              <Card key={theme.theme} className="rounded-lg border-slate-200 shadow-sm">
                <CardHeader className="p-5 pb-3">
                  <CardTitle className="text-base">{themeLabels[theme.theme] || theme.theme}</CardTitle>
                  <CardDescription>
                    {theme.managerCount} 个机构涉及，{theme.companyCount} 家公司
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className="text-lg font-semibold text-slate-950">{formatCurrency(theme.netValueChange)}</div>
                  <div className="mt-1 text-sm text-slate-600">
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
            <h2 className="text-2xl font-semibold text-slate-950">每个机构完整持仓表</h2>
          </div>

          <div className="space-y-5">
            {snapshot.managers.map((manager, index) => {
              const changesBySecurity = new Map(manager.latestChanges.map((change) => [change.securityId, change]));

              return (
                <details
                  key={`table-${manager.id}`}
                  open={index === 0}
                  className="rounded-lg border border-slate-200 bg-white shadow-sm"
                >
                  <summary className="flex cursor-pointer flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-lg font-semibold text-slate-950">{manager.displayName}</div>
                      <div className="text-sm text-slate-500">
                        {manager.latestQuarter}，完整 {formatNumber(manager.holdings.length)} 条持仓
                      </div>
                    </div>
                    <Badge variant={managerStatusVariant(manager)} className="w-fit rounded-md">
                      {formatCurrency(manager.latestTotalValue)}
                    </Badge>
                  </summary>

                  <div className="border-t border-slate-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-[1060px] w-full text-left text-sm">
                        <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Rank</th>
                            <th className="px-4 py-3">公司</th>
                            <th className="px-4 py-3">CUSIP</th>
                            <th className="px-4 py-3 text-right">市值</th>
                            <th className="px-4 py-3 text-right">股数</th>
                            <th className="px-4 py-3 text-right">权重</th>
                            <th className="px-4 py-3">变化</th>
                            <th className="px-4 py-3">主题</th>
                            <th className="px-4 py-3">来源</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {manager.holdings.map((holding) => {
                            const change = changesBySecurity.get(holding.securityId);

                            return (
                              <tr key={`${manager.id}-${holding.securityId}`} className="align-top hover:bg-slate-50">
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">{holding.rank}</td>
                                <td className="px-4 py-3">
                                  <div className="font-medium text-slate-950">{holding.issuerName}</div>
                                  <div className="text-xs text-slate-500">{holding.titleOfClass || 'n/a'}</div>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-slate-600">{holding.cusip}</td>
                                <td className="px-4 py-3 text-right font-medium text-slate-950">
                                  {formatCurrency(holding.value, false)}
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-xs text-slate-700">
                                  {formatNumber(holding.shares)}
                                </td>
                                <td className="px-4 py-3 text-right text-slate-700">{holding.weight.toFixed(2)}%</td>
                                <td className="px-4 py-3">
                                  <Badge variant={changeVariant(change)} className="rounded-md">
                                    {change ? changeLabels[change.changeType] || change.changeType : 'n/a'}
                                  </Badge>
                                  {change && (
                                    <div className="mt-1 text-xs text-slate-500">
                                      {formatPercent(change.shareChangePercent)}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-wrap gap-1">
                                    {holding.themes.map((theme) => (
                                      <Badge key={theme} variant="outline" className="rounded-md border-slate-300 text-slate-700">
                                        {themeLabels[theme] || theme}
                                      </Badge>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-500">
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
            })}
          </div>
        </section>

        <section>
          <Alert className="rounded-lg border-blue-200 bg-blue-50 text-blue-950 [&>svg]:text-blue-700">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>有效性证明</AlertTitle>
            <AlertDescription className="break-words">
              本次发布快照生成于 {formatDateTime(snapshot.generatedAt)}。每个机构卡片里的 SEC 原始 XML 链接可直接打开对应 filing 的
              information table；自动校验会重新请求 SEC XML 并比较远端 hash、本地 raw hash 和 snapshot hash。
            </AlertDescription>
          </Alert>
        </section>
      </div>
    </div>
  );
}
