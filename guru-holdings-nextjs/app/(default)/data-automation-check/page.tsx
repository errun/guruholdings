import type { Metadata } from 'next';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileCheck2,
  Fingerprint,
  GitBranch,
  LockKeyhole,
  RefreshCw,
  ServerCog,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';
import snapshot from '@/data-generated/snapshots/latest.json';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatDateTime, formatNumber } from '@/lib/sec13f-view';

export const metadata: Metadata = {
  title: '13F 数据自动化验证',
  description: '内部数据抓取、校验与发布状态页面。',
  robots: { index: false, follow: false },
};

const workflowSteps = [
  ['01', 'GitHub Actions', '每月 16 日或手动触发更新', RefreshCw],
  ['02', 'GitHub Actions', '拉取代码并安装锁定依赖', GitBranch],
  ['03', '数据脚本', '按固定 CIK 抓取 SEC 13F 原始 XML', Database],
  ['04', '校验脚本', '复算持仓变化、哈希、记录和归一化结果', FileCheck2],
  ['05', 'GitHub Actions bot', '所有阻断检查通过后提交 master/main', UploadCloud],
  ['06', 'Vercel', '构建并发布通过校验的快照', ServerCog],
] as const;

const totalRawRecords = snapshot.managers.reduce((total, manager) => total + manager.latestHoldingCount, 0);
const totalCompanyRecords = snapshot.managers.reduce((total, manager) => total + manager.companyHoldings.length, 0);

export default function DataAutomationCheckPage() {
  const passed = snapshot.validation.status === 'passed';

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-stone-200 bg-white">
        <div className="container py-8 lg:py-10">
          <Badge variant="info" className="mb-4 rounded-md">内部运维页面</Badge>
          <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">13F 数据自动化发布验证</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
            本页集中展示快照版本、SEC XML 哈希、记录一致性和完整警告。它没有登录保护，仅通过 noindex、nofollow 阻止搜索引擎收录。
          </p>
        </div>
      </section>

      <div className="container py-8 lg:py-10">
        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatusCard icon={<CheckCircle2 className="h-4 w-4 text-emerald-700" />} label="校验状态" value={snapshot.validation.status} detail={passed ? '阻断检查全部通过' : '当前快照不可发布'} />
          <StatusCard icon={<RefreshCw className="h-4 w-4 text-primary" />} label="校验时间" value={formatDateTime(snapshot.generatedAt, 'zh')} detail={`最新披露季度 ${snapshot.latestQuarter}`} />
          <StatusCard icon={<Fingerprint className="h-4 w-4 text-slate-700" />} label="快照版本" value={snapshot.dataFingerprint.slice(0, 12)} detail={snapshot.dataFingerprint} mono />
          <StatusCard icon={<Database className="h-4 w-4 text-primary" />} label="记录一致性" value={`${formatNumber(totalRawRecords, 'zh')} → ${formatNumber(totalCompanyRecords, 'zh')}`} detail="原始持仓行 → 公司级归一化记录" />
        </section>

        <Alert variant={snapshot.validation.warnings.length > 0 ? 'warning' : 'success'} className="mb-8">
          {snapshot.validation.warnings.length > 0 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          <AlertTitle>{snapshot.validation.warnings.length > 0 ? '非阻断警告' : '没有警告'}</AlertTitle>
          <AlertDescription>
            {snapshot.validation.warnings.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 font-mono text-xs">
                {snapshot.validation.warnings.map((warning) => <li key={warning} className="break-all">{warning}</li>)}
              </ul>
            ) : '当前快照没有非阻断警告。'}
          </AlertDescription>
        </Alert>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold text-slate-950">SEC XML 哈希与记录检查</h2>
          </div>
          <div className="max-w-full overflow-x-auto rounded-md border border-stone-200 bg-white">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-stone-100 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">机构</th>
                  <th className="px-4 py-3">披露季度</th>
                  <th className="px-4 py-3">提交日期</th>
                  <th className="px-4 py-3 text-right">原始记录</th>
                  <th className="px-4 py-3 text-right">归一化记录</th>
                  <th className="px-4 py-3">infoTable SHA-256</th>
                  <th className="px-4 py-3">结果</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {snapshot.managers.map((manager) => (
                  <tr key={manager.id} className="align-top">
                    <td className="px-4 py-3 font-medium text-slate-950">{manager.displayName}</td>
                    <td className="px-4 py-3 font-mono">{manager.latestQuarter}</td>
                    <td className="px-4 py-3">{formatDate(manager.latestFiling.filingDate, 'zh')}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatNumber(manager.latestHoldingCount, 'zh')}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatNumber(manager.companyHoldings.length, 'zh')}</td>
                    <td className="max-w-[320px] break-all px-4 py-3 font-mono text-xs text-muted-foreground">{manager.latestFiling.infoTableSha256}</td>
                    <td className="px-4 py-3"><Badge variant={passed ? 'success' : 'destructive'} className="rounded-md">{passed ? '一致' : '未通过'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-slate-700" />
            <h2 className="text-2xl font-semibold text-slate-950">自动发布链路</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {workflowSteps.map(([step, actor, action, Icon]) => (
              <Card key={step} className="border-stone-200 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base"><Icon className="h-4 w-4 text-primary" />{step}. {action}</CardTitle>
                  <CardDescription>执行主体：{actor}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <Alert className="border-stone-300 bg-white text-slate-900 [&>svg]:text-slate-700">
          <LockKeyhole className="h-4 w-4" />
          <AlertTitle>访问边界</AlertTitle>
          <AlertDescription>此页不在主导航和 Sitemap 中，并设置 noindex、nofollow，但这不等于权限控制。不得在此展示密钥、令牌或未公开数据。</AlertDescription>
        </Alert>
      </div>
    </main>
  );
}

function StatusCard({ icon, label, value, detail, mono = false }: { icon: React.ReactNode; label: string; value: string; detail: string; mono?: boolean }) {
  return (
    <Card className="border-stone-200 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">{icon}{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`break-words text-xl font-semibold text-slate-950 ${mono ? 'font-mono' : ''}`}>{value}</div>
        <p className={`mt-2 break-all text-xs leading-5 text-muted-foreground ${mono ? 'font-mono' : ''}`}>{detail}</p>
      </CardContent>
    </Card>
  );
}
