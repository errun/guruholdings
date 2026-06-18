'use client';

import type { ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber, formatWeight, themeName } from '@/lib/sec13f-view';

type AnyRecord = Record<string, any>;

const palette = ['#164e63', '#0f766e', '#b45309', '#b91c1c', '#5b21b6', '#475569'];

export function ManagerCharts({ manager }: { manager: AnyRecord }) {
  const trend = [...(manager.quarterAnalytics || [])].reverse();
  const changeData: Array<{ quarter: string; 新增: number; 清仓: number; 增持: number; 减持: number }> = trend.map((quarter) => ({
    quarter: quarter.quarter,
    新增: quarter.changeCounts?.new || 0,
    清仓: quarter.changeCounts?.exit || 0,
    增持: quarter.changeCounts?.increase || 0,
    减持: quarter.changeCounts?.decrease || 0,
  }));
  const topHoldings: Array<{ name: string; weight: number; value: number }> = (manager.topHoldingWeights || []).map((holding: AnyRecord) => ({
    name: holding.canonicalName,
    weight: holding.weight,
    value: holding.value,
  }));
  const themeData: Array<{ name: string; value: number; weight: number }> = (manager.themeAllocation || []).slice(0, 6).map((theme: AnyRecord) => ({
    name: themeName(theme.theme),
    value: theme.value,
    weight: theme.weight,
  }));

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <ChartCard title="最近 4 个季度总市值">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend} margin={{ top: 10, right: 18, bottom: 0, left: 4 }}>
            <CartesianGrid stroke="#e7e0d6" vertical={false} />
            <XAxis dataKey="quarter" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(Number(value))} width={72} />
            <Tooltip formatter={(value) => formatCurrency(Number(value), false)} labelClassName="font-semibold" />
            <Line type="monotone" dataKey="totalValue" name="总市值" stroke="#164e63" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="持仓数量趋势">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend} margin={{ top: 10, right: 18, bottom: 0, left: 4 }}>
            <CartesianGrid stroke="#e7e0d6" vertical={false} />
            <XAxis dataKey="quarter" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={48} />
            <Tooltip formatter={(value) => formatNumber(Number(value))} labelClassName="font-semibold" />
            <Line type="monotone" dataKey="companyHoldingCount" name="公司数" stroke="#0f766e" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="holdingCount" name="原始 CUSIP 行" stroke="#b45309" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="季度操作数量">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={changeData} margin={{ top: 10, right: 18, bottom: 0, left: 4 }}>
            <CartesianGrid stroke="#e7e0d6" vertical={false} />
            <XAxis dataKey="quarter" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <Tooltip />
            <Bar dataKey="新增" stackId="a" fill="#047857" radius={[3, 3, 0, 0]} />
            <Bar dataKey="增持" stackId="a" fill="#34d399" />
            <Bar dataKey="减持" stackId="a" fill="#f87171" />
            <Bar dataKey="清仓" stackId="a" fill="#b91c1c" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Top holdings 权重">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topHoldings} layout="vertical" margin={{ top: 6, right: 18, bottom: 0, left: 82 }}>
            <CartesianGrid stroke="#e7e0d6" horizontal={false} />
            <XAxis type="number" tickFormatter={(value) => `${Number(value).toFixed(0)}%`} />
            <YAxis type="category" dataKey="name" width={82} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value, _name, item: any) => [formatWeight(Number(value)), item.payload.name]} />
            <Bar dataKey="weight" fill="#164e63" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="主题 / 行业分布">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={themeData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={86} paddingAngle={2}>
              {themeData.map((entry, index) => (
                <Cell key={entry.name} fill={palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name, item: any) => [formatCurrency(Number(value)), `${name} ${formatWeight(item.payload.weight)}`]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {themeData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between gap-3 text-xs">
              <span className="flex min-w-0 items-center gap-2 truncate text-slate-700">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
                {item.name}
              </span>
              <span className="font-mono text-slate-950">{formatWeight(item.weight)}</span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="border-stone-200 bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 min-w-0">{children}</div>
      </CardContent>
    </Card>
  );
}
