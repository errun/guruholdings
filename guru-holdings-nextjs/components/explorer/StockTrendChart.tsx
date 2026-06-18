'use client';

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/sec13f-view';

type AnyRecord = Record<string, any>;

export function StockTrendChart({ stock }: { stock: AnyRecord }) {
  const trend = stock.quarters || [];
  const managerChangeRows = trend.map((quarter: AnyRecord) => ({
    quarter: quarter.quarter,
    增持: quarter.holders?.filter((holder: AnyRecord) => ['increase', 'new'].includes(holder.changeType)).length || 0,
    减持: quarter.holders?.filter((holder: AnyRecord) => ['decrease', 'exit'].includes(holder.changeType)).length || 0,
    持平: quarter.holders?.filter((holder: AnyRecord) => holder.changeType === 'unchanged').length || 0,
  }));

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card className="border-stone-200 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">最近 4 个季度持有趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 18, bottom: 0, left: 4 }}>
                <CartesianGrid stroke="#e7e0d6" vertical={false} />
                <XAxis dataKey="quarter" tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} width={72} tickFormatter={(value) => formatCurrency(Number(value))} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} width={36} />
                <Tooltip formatter={(value, name) => [name === '合计市值' ? formatCurrency(Number(value), false) : formatNumber(Number(value)), name]} />
                <Line yAxisId="left" type="monotone" dataKey="totalValue" name="合计市值" stroke="#164e63" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="holderCount" name="持有机构数" stroke="#0f766e" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-stone-200 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">持有机构当季动作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={managerChangeRows} margin={{ top: 10, right: 18, bottom: 0, left: 4 }}>
                <CartesianGrid stroke="#e7e0d6" vertical={false} />
                <XAxis dataKey="quarter" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <Tooltip />
                <Bar dataKey="增持" stackId="a" fill="#047857" />
                <Bar dataKey="持平" stackId="a" fill="#94a3b8" />
                <Bar dataKey="减持" stackId="a" fill="#b91c1c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
