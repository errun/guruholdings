import {
  AlertTriangle,
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const workflowSteps = [
  {
    step: '01',
    title: '定时触发',
    actor: 'GitHub Actions',
    icon: RefreshCw,
    goal: '每月 16 日自动启动 13F 数据更新，也支持手动 workflow_dispatch。',
    verification: '检查 workflow run 的触发时间、分支、提交 SHA 和任务状态。',
    failure: '不进入数据发布步骤，线上继续使用旧 snapshot。',
  },
  {
    step: '02',
    title: '拉取仓库代码',
    actor: 'GitHub Actions',
    icon: GitBranch,
    goal: '拿到 master 上的数据规则、固定 CIK、主题映射、页面代码和依赖锁文件。',
    verification: 'checkout 成功，npm ci 成功，工作目录与 Vercel 项目目录一致。',
    failure: '停止更新，不提交任何数据。',
  },
  {
    step: '03',
    title: '抓取 SEC 原始数据',
    actor: '数据脚本',
    icon: Database,
    goal: '按固定 CIK 抓取 6 个机构最近 4 个 13F 披露季度。',
    verification: '每个 filing 都必须有 CIK、accession number、filing date、report period 和 SEC XML URL。',
    failure: '关键机构缺失、CIK 不匹配或 SEC 访问连续失败时阻断发布。',
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
    title: '标准化与合并',
    actor: '数据脚本',
    icon: ServerCog,
    goal: '统一 CUSIP、公司、股数、市值、权重和主题分类，生成页面可用的瘦身 snapshot。',
    verification: 'schema 完整，持仓非空，value/share 单位落在合理区间。',
    failure: '字段缺失、空持仓、单位异常时阻断发布。',
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
    goal: '生成共同增持、共同减持和行业/主题变化。',
    verification: '每条共同变化至少命中 2 个机构，并按 companyId/CUSIP 聚合。',
    failure: '共同变化规则异常时阻断发布；没有信号时可以展示为空状态。',
  },
  {
    step: '08',
    title: '发布到线上',
    actor: 'GitHub Actions bot / Vercel',
    icon: UploadCloud,
    goal: 'data:build、data:verify、build 全部通过后，bot 直接提交 master 触发 Vercel。',
    verification: '只提交 latest snapshot、latest report 和配置文件，不提交 raw XML 与 normalized 明细。',
    failure: '任一 fatal 校验失败时不提交 master，Vercel 不会发布坏数据。',
  },
];

const validationGates = [
  ['固定 CIK', '6 个机构必须来自 data-source/managers.json，不能按名称模糊匹配。'],
  ['SEC 来源', '最新 XML 必须 HTTP 200，且包含 infoTable。'],
  ['hash 一致', '远端 XML、本地 raw XML、snapshot 中的 sha256 必须一致。'],
  ['schema 完整', 'manager、filing、holding、change、consensus 的必填字段必须存在。'],
  ['单位合理', 'value/share 的中位数和异常比例必须落在合理范围。'],
  ['变化可复算', '新增、清仓、增持、减持必须由季度 shares 自动推导。'],
  ['共同变化', '共同增持/减持每条至少包含 2 个机构。'],
  ['构建通过', 'Next.js build 必须通过，避免数据更新破坏页面。'],
];

const proofArtifacts = [
  'data-generated/snapshots/latest.json：线上页面实际读取的发布快照。',
  'data-generated/reports/latest.md：人和机器都能读的更新报告。',
  'data-source/raw/sec-13f/：CI 中临时生成的 SEC 原始 XML，默认不提交 Git。',
  'data-generated/normalized/：CI 中临时生成的完整调试明细，默认不提交 Git。',
  'GitHub Actions run log：触发时间、脚本输出、校验失败原因和提交结果。',
  'Vercel deployment：master 更新后的线上构建和部署记录。',
];

export default function DataAutomationCheckPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container py-8 lg:py-10">
        <section className="mb-8 border-b border-slate-200 pb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <Badge variant="info" className="mb-4 rounded-md">
                流程验证页
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                13F 数据自动化发布验证
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                这个页面用于定义自动化流程的完成标准：谁执行、怎么验证、失败时是否阻断发布。它帮助确认机器能可靠地替代人工更新数据。
              </p>
            </div>

            <div className="grid min-w-[280px] grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-slate-500">发布方式</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">自动提交 master</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-slate-500">核心原则</div>
                <div className="mt-2 text-lg font-semibold text-emerald-700">校验先于发布</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 lg:grid-cols-3">
          <Alert variant="success" className="rounded-lg">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>工作目标</AlertTitle>
            <AlertDescription>
              定期自动生成最新 13F 持仓、机构自身变化、共同变化和主题变化，并在校验通过后发布到 Vercel。
            </AlertDescription>
          </Alert>

          <Alert variant="warning" className="rounded-lg">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>发布原则</AlertTitle>
            <AlertDescription>
              宁可不上新数据，也不发布无法追溯、无法校验或明显异常的数据。失败时保留旧 snapshot。
            </AlertDescription>
          </Alert>

          <Alert className="rounded-lg border-blue-200 bg-blue-50 text-blue-900 [&>svg]:text-blue-700">
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>验证方式</AlertTitle>
            <AlertDescription>
              发布前必须通过 data:build、data:verify 和 Next.js build；warning 可以展示，fatal 必须阻断。
            </AlertDescription>
          </Alert>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold text-slate-950">流程拆解</h2>
          </div>

          <div className="grid gap-4">
            {workflowSteps.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.step} className="rounded-lg border-slate-200 shadow-sm">
                  <CardContent className="p-5">
                    <div className="grid gap-5 lg:grid-cols-[130px_1.1fr_1fr_1fr] lg:items-start">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-500">STEP {item.step}</div>
                          <Badge variant="outline" className="mt-1 rounded-md border-slate-300">
                            {item.actor}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.goal}</p>
                      </div>

                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">验证方式</div>
                        <p className="mt-2 text-sm leading-6 text-slate-700">{item.verification}</p>
                      </div>

                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">异常路径</div>
                        <p className="mt-2 text-sm leading-6 text-red-700">{item.failure}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <LockKeyhole className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold text-slate-950">自动发布闸门</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {validationGates.map(([name, description]) => (
              <Card key={name} className="rounded-lg border-slate-200 shadow-sm">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{name}</CardTitle>
                    <Badge variant="destructive" className="shrink-0 rounded-md">
                      fatal
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <p className="text-sm leading-6 text-slate-700">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card className="rounded-lg border-slate-200 shadow-sm">
            <CardHeader>
              <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                <ClipboardCheck className="h-5 w-5 text-emerald-700" />
                验收标准
              </h2>
              <CardDescription>
                下面这些条件都满足，才算自动化流程可以替代人工更新。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  '同一输入重复运行，输出快照保持一致。',
                  '任一 fatal 校验失败时，不提交 master。',
                  '线上每条数据都能追溯到 SEC 来源和 hash。',
                  '新增、清仓、增持、减持全部由程序计算。',
                  '共同增持/共同减持至少命中 2 个机构。',
                  'Vercel 构建失败时，线上仍保留旧版本。',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-sm leading-6 text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 shadow-sm">
            <CardHeader>
              <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                <FileSearch className="h-5 w-5 text-blue-700" />
                可复现证据
              </h2>
              <CardDescription>数据被质疑时，应能从这些位置反查全过程。</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {proofArtifacts.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="mt-8">
          <Alert className="rounded-lg border-slate-300 bg-white">
            <XCircle className="h-4 w-4" />
            <AlertTitle>页面边界</AlertTitle>
            <AlertDescription>
              这个页面定义流程验收标准；真实抓取结果请看 /live-13f。自动任务失败时，页面不会替代报警或日志，需要看 GitHub Actions run log。
            </AlertDescription>
          </Alert>
        </section>
      </div>
    </div>
  );
}
