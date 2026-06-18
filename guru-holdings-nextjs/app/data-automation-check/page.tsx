import {
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileArchive,
  FileSearch,
  GitBranch,
  LockKeyhole,
  RefreshCw,
  ServerCog,
  ShieldCheck,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import snapshot from '@/data-generated/snapshots/latest.json';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/sec13f-view';

const workflowSteps = [
  {
    step: '01',
    title: '定时触发',
    actor: 'GitHub Actions',
    icon: RefreshCw,
    goal: '每月 16 日自动启动 13F 数据更新，也支持手动 workflow_dispatch。',
    verification: '检查 workflow run 的触发时间、分支、提交 SHA 和任务状态。',
    failure: '不进入数据发布步骤，线上继续使用上一版快照。',
  },
  {
    step: '02',
    title: '拉取仓库代码',
    actor: 'GitHub Actions',
    icon: GitBranch,
    goal: '取得数据规则、固定 CIK、主题映射、证券归一化配置、页面代码和依赖锁文件。',
    verification: 'checkout 成功，依赖安装成功，工作目录与 Vercel 项目目录一致。',
    failure: '停止更新，不提交任何数据。',
  },
  {
    step: '03',
    title: '抓取 SEC 原始数据',
    actor: '数据脚本',
    icon: Database,
    goal: '按固定 CIK 抓取 7 个机构最近 4 个 13F 披露季度。',
    verification: '每个 filing 都必须有 CIK、accession number、filing date、report period 和 SEC XML URL。',
    failure: '关键机构缺失、CIK 不匹配或 SEC 连续访问失败时阻断发布。',
  },
  {
    step: '04',
    title: '保存 raw 快照',
    actor: '数据脚本',
    icon: FileArchive,
    goal: '保存 SEC index、infotable XML 和 metadata，供校验和以后追溯。',
    verification: 'raw XML 的 sha256 必须与 snapshot 中的 source hash 一致。',
    failure: 'raw 缺失或 hash 不一致时阻断发布。',
  },
  {
    step: '05',
    title: '标准化与归一化',
    actor: '数据脚本',
    icon: ServerCog,
    goal: '保留原始 CUSIP 行，同时用 securities.json 生成公司级归一化视图，例如 Alphabet 合并 02079K107 和 02079K305。',
    verification: 'schema 完整，持仓非空，value/share 单位合理，公司级汇总可由原始持仓复算。',
    failure: '字段缺失、空持仓、单位异常或归一化无法复算时阻断发布。',
  },
  {
    step: '06',
    title: '计算季度变化',
    actor: '数据脚本',
    icon: ClipboardCheck,
    goal: '用最近 4 个季度自动计算新增、清仓、增持、减持和仓位占比变化。',
    verification: 'changeType 必须能由本季度 shares 与上一季度 shares 复算出来。',
    failure: '变化无法复算时阻断发布。',
  },
  {
    step: '07',
    title: '计算共同变化',
    actor: '数据脚本',
    icon: FileSearch,
    goal: '生成共同增持、共同减持和行业 / 主题变化，并列出股数、市值、仓位占比变化。',
    verification: '每条共同变化至少命中 2 个机构，并按归一化公司聚合。',
    failure: '共同变化规则异常时阻断发布；没有信号时可以展示为空状态。',
  },
  {
    step: '08',
    title: '发布到线上',
    actor: 'GitHub Actions bot / Vercel',
    icon: UploadCloud,
    goal: 'data:build、data:verify、build 全部通过后，bot 提交 master 并同步 main，触发 Vercel 部署。',
    verification: '只提交 latest snapshot、latest report 和配置文件，不提交 raw XML 与 normalized 明细。',
    failure: '任一 fatal 校验失败时不提交 master/main，Vercel 不会发布坏数据。',
  },
];

const validationGates = [
  ['固定 CIK', '7 个机构必须来自 data-source/managers.json，不按名称模糊匹配。'],
  ['SEC 来源', '最新 XML 必须 HTTP 200，且包含 infoTable。'],
  ['hash 一致', '远端 XML、本地 raw XML、snapshot 中的 sha256 必须一致。'],
  ['schema 完整', 'manager、filing、holding、change、consensus 的必填字段必须存在。'],
  ['单位合理', 'value/share 的中位数和异常比例必须落在合理范围。'],
  ['变化可复算', '新增、清仓、增持、减持必须由季度 shares 自动推导。'],
  ['Google 合并', '02079K107 与 02079K305 必须归一化为 Alphabet，同时完整表保留原始 CUSIP。'],
  ['共同变化', '共同增持 / 减持每条至少包含 2 个机构，并展示变化金额。'],
  ['构建通过', 'Next.js build 必须通过，避免数据更新破坏页面。'],
];

const proofArtifacts = [
  'data-generated/snapshots/latest.json：线上页面实际读取的发布快照。',
  'data-generated/reports/latest.md：人和机器都能读的更新报告。',
  'data-source/raw/sec-13f/：CI 中临时生成的 SEC 原始 XML，默认不提交 Git。',
  'data-generated/normalized/：CI 中临时生成的完整调试明细，默认不提交 Git。',
  'GitHub Actions run log：触发时间、脚本输出、校验失败原因和提交结果。',
  'Vercel deployment：master/main 更新后的线上构建和部署记录。',
];

export default function DataAutomationCheckPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-stone-200 bg-white">
        <div className="container py-8 lg:py-10">
          <Badge variant="info" className="mb-4 rounded-md">
            流程验证页
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            13F 数据自动化发布验证
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
            这里定义自动化流程的完成标准：谁执行、怎么验证、失败时是否阻断发布。目标是让数据更新能自动运行，但不能自动发布无法证明正确的数据。
          </p>
        </div>
      </section>

      <div className="container py-8 lg:py-10">
        <section className="mb-8 grid gap-4 lg:grid-cols-4">
          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">当前快照</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-950">{snapshot.latestQuarter}</div>
              <p className="mt-2 text-sm text-muted-foreground">{formatDateTime(snapshot.generatedAt)}</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">机构数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-950">{snapshot.managers.length}</div>
              <p className="mt-2 text-sm text-muted-foreground">固定 CIK 覆盖。</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">校验状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-2xl font-semibold text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                {snapshot.validation.status}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">失败则不发布。</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">归一化规则</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-950">{snapshot.securityNormalization.canonicalCompanies.length}</div>
              <p className="mt-2 text-sm text-muted-foreground">当前包含 Alphabet 双 CUSIP。</p>
            </CardContent>
          </Card>
        </section>

        <Alert className="mb-8 border-primary/20 bg-white text-slate-900 [&>svg]:text-primary">
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>发布闸门</AlertTitle>
          <AlertDescription>
            自动化可以直接提交 master/main，但只有在数据生成、SEC 校验和 Next.js 构建全部通过后才会提交。warning 可以展示，fatal 必须阻断。
          </AlertDescription>
        </Alert>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-slate-950">执行步骤</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {workflowSteps.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.step} className="border-stone-200">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Icon className="h-5 w-5 text-primary" />
                          {item.step}. {item.title}
                        </CardTitle>
                        <CardDescription className="mt-1">执行主体：{item.actor}</CardDescription>
                      </div>
                      <Badge variant="outline" className="rounded-md border-stone-300">
                        自动化
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                    <p><span className="font-medium text-slate-900">目标：</span>{item.goal}</p>
                    <p><span className="font-medium text-slate-900">验证：</span>{item.verification}</p>
                    <p><span className="font-medium text-slate-900">失败路径：</span>{item.failure}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mb-10 grid gap-6 lg:grid-cols-2">
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <LockKeyhole className="h-5 w-5 text-primary" />
                必须通过的校验
              </CardTitle>
              <CardDescription>这些条件不通过时，不能发布新数据。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {validationGates.map(([title, description]) => (
                <div key={title} className="flex gap-3 rounded-md border border-stone-200 bg-white p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                  <div>
                    <div className="font-medium text-slate-950">{title}</div>
                    <div className="mt-1 text-sm leading-6 text-muted-foreground">{description}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileArchive className="h-5 w-5 text-primary" />
                可复现证据
              </CardTitle>
              <CardDescription>以后调试数据时优先看这些产物。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {proofArtifacts.map((artifact) => (
                <div key={artifact} className="rounded-md border border-stone-200 bg-white p-3 text-sm leading-6 text-muted-foreground">
                  {artifact}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <Alert variant="success">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>通过时</AlertTitle>
            <AlertDescription>
              GitHub Actions bot 创建数据提交，推送 master 并同步 main；Vercel 自动构建后，线上页面展示最新 snapshot。
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>失败时</AlertTitle>
            <AlertDescription>
              不提交新 snapshot，不触发新数据发布。失败原因保留在 workflow log 和 failed report 中，方便改脚本或切换备用方式。
            </AlertDescription>
          </Alert>
        </section>
      </div>
    </div>
  );
}
