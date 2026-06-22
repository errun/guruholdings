'use client';

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getViewFormatters } from '@/lib/sec13f-view';
import { translate, type Locale } from '@/lib/i18n/site';

type AnyRecord = Record<string, any>;

export function StockTrendChart({ stock, locale }: { stock: AnyRecord; locale: Locale }) {
  const { formatCurrency, formatNumber } = getViewFormatters(locale);
  const trend = stock.quarters || [];
  const managerChangeRows = trend.map((quarter: AnyRecord) => ({
    quarter: quarter.quarter,
    increase: quarter.holders?.filter((holder: AnyRecord) => ['increase', 'new'].includes(holder.changeType)).length || 0,
    decrease: quarter.holders?.filter((holder: AnyRecord) => ['decrease', 'exit'].includes(holder.changeType)).length || 0,
    unchanged: quarter.holders?.filter((holder: AnyRecord) => holder.changeType === 'unchanged').length || 0,
  }));

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card className="border-stone-200 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{translate(locale, 'charts.stockTrend')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 18, bottom: 0, left: 4 }}>
                <CartesianGrid stroke="#e7e0d6" vertical={false} />
                <XAxis dataKey="quarter" tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} width={72} tickFormatter={(value) => formatCurrency(Number(value))} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} width={36} />
                <Tooltip formatter={(value, name) => [name === translate(locale, 'common.totalValue') ? formatCurrency(Number(value), false) : formatNumber(Number(value)), name]} />
                <Line yAxisId="left" type="monotone" dataKey="totalValue" name={translate(locale, 'common.totalValue')} stroke="#164e63" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="holderCount" name={translate(locale, 'charts.holderCount')} stroke="#0f766e" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-stone-200 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{translate(locale, 'charts.managerActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={managerChangeRows} margin={{ top: 10, right: 18, bottom: 0, left: 4 }}>
                <CartesianGrid stroke="#e7e0d6" vertical={false} />
                <XAxis dataKey="quarter" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <Tooltip />
                <Bar dataKey="increase" name={translate(locale, 'change.increase')} stackId="a" fill="#047857" />
                <Bar dataKey="unchanged" name={translate(locale, 'change.unchanged')} stackId="a" fill="#94a3b8" />
                <Bar dataKey="decrease" name={translate(locale, 'change.decrease')} stackId="a" fill="#b91c1c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
