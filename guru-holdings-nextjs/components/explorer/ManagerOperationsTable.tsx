'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  changeBadgeVariant,
  changeName,
  directionTextClass,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatSignedCurrency,
  formatSignedNumber,
  formatWeight,
  themeName,
} from '@/lib/sec13f-view';

type AnyRecord = Record<string, any>;

export function ManagerOperationsTable({ manager }: { manager: AnyRecord }) {
  const quarters = Object.keys(manager.quarterlyCompanyChanges || {});
  const [quarter, setQuarter] = useState(quarters[0] || manager.latestQuarter);
  const [changeType, setChangeType] = useState('all');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toUpperCase();
    return (manager.quarterlyCompanyChanges?.[quarter] || [])
      .filter((change: AnyRecord) => changeType === 'all' || change.changeType === changeType)
      .filter((change: AnyRecord) => {
        if (!normalizedQuery) return true;
        return [
          change.canonicalName,
          change.issuerName,
          change.canonicalTicker,
          change.cusip,
          ...(change.rawCusips || []),
          ...(change.issuerNames || []),
        ].join(' ').toUpperCase().includes(normalizedQuery);
      })
      .slice(0, 300);
  }, [changeType, manager.quarterlyCompanyChanges, query, quarter]);

  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <div className="grid gap-3 border-b border-stone-200 p-4 lg:grid-cols-[auto_auto_minmax(0,1fr)]">
        <select
          value={quarter}
          onChange={(event) => setQuarter(event.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {quarters.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <select
          value={changeType}
          onChange={(event) => setChangeType(event.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">全部变化</option>
          <option value="new">筛选新增</option>
          <option value="increase">筛选增持</option>
          <option value="decrease">筛选减持</option>
          <option value="exit">筛选清仓</option>
          <option value="unchanged">筛选持平</option>
        </select>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="搜索股票、CUSIP、公司名" />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="bg-stone-100 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">公司</th>
              <th className="px-4 py-3">CUSIP</th>
              <th className="px-4 py-3">变化</th>
              <th className="px-4 py-3 text-right">当前股数</th>
              <th className="px-4 py-3 text-right">股数变化</th>
              <th className="px-4 py-3 text-right">股数变化%</th>
              <th className="px-4 py-3 text-right">当前市值</th>
              <th className="px-4 py-3 text-right">市值变化</th>
              <th className="px-4 py-3 text-right">仓位变化</th>
              <th className="px-4 py-3">主题</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((change: AnyRecord) => (
              <tr key={`${quarter}-${change.companyId}`} className="align-top hover:bg-stone-50">
                <td className="px-4 py-3">
                  <Link href={`/stocks/${encodeURIComponent(change.companyId)}`} className="font-semibold text-slate-950 hover:text-primary hover:underline">
                    {change.canonicalName || change.issuerName}
                  </Link>
                  <div className="mt-1 font-mono text-xs text-muted-foreground">{change.canonicalTicker || change.companyId}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-700">{change.rawCusips?.join(', ') || change.cusip}</td>
                <td className="px-4 py-3">
                  <Badge variant={changeBadgeVariant(change.changeType)} className="rounded-md">{changeName(change.changeType)}</Badge>
                </td>
                <td className="px-4 py-3 text-right font-mono">{formatNumber(change.currentShares)}</td>
                <td className={`px-4 py-3 text-right font-mono font-semibold ${directionTextClass(change.shareChange)}`}>{formatSignedNumber(change.shareChange)}</td>
                <td className={`px-4 py-3 text-right font-mono ${directionTextClass(change.shareChange || 0)}`}>{formatPercent(change.shareChangePercent)}</td>
                <td className="px-4 py-3 text-right font-mono">{formatCurrency(change.currentValue, false)}</td>
                <td className={`px-4 py-3 text-right font-mono font-semibold ${directionTextClass(change.valueChange)}`}>{formatSignedCurrency(change.valueChange, false)}</td>
                <td className={`px-4 py-3 text-right font-mono ${directionTextClass(change.weightChange)}`}>{formatPercent(change.weightChange)}</td>
                <td className="px-4 py-3">
                  <div className="flex max-w-[180px] flex-wrap gap-1">
                    {(change.themes || ['unclassified']).map((theme: string) => (
                      <Badge key={theme} variant="outline" className="rounded-md border-stone-300 bg-white text-slate-700">
                        {themeName(theme)}
                      </Badge>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                  当前筛选没有结果
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-stone-200 px-4 py-3 text-xs text-muted-foreground">
        已显示 {rows.length} 条，当前季度总变化 {manager.quarterlyCompanyChanges?.[quarter]?.length || 0} 条。仓位占比为该机构当季 13F 总市值中的比例。
      </div>
    </div>
  );
}
