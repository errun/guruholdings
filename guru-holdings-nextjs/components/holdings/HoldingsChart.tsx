'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLanguage } from '@/lib/i18n';
import { formatNumber } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TransformedHolding, TransformedValueHistoryEntry } from '@/lib/types';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#00C49F',
];

interface HoldingsChartProps {
  holdings: TransformedHolding[];
  valueHistory: TransformedValueHistoryEntry[];
}

export function HoldingsChart({ holdings, valueHistory }: HoldingsChartProps) {
  const { t } = useLanguage();

  const pieData = useMemo(() => {
    const sorted = [...holdings].sort((a, b) => b.currentWeight - a.currentWeight);
    const top5 = sorted.slice(0, 5);
    const othersWeight = sorted.slice(5).reduce((sum, h) => sum + h.currentWeight, 0);

    const data = top5.map((h) => ({
      name: h.symbol,
      value: h.currentWeight,
      displayValue: `${h.currentWeight.toFixed(1)}%`,
    }));

    if (othersWeight > 0) {
      data.push({
        name: String(t('common.others')),
        value: othersWeight,
        displayValue: `${othersWeight.toFixed(1)}%`,
      });
    }

    return data;
  }, [holdings, t]);

  const lineData = useMemo(() => {
    return valueHistory.map((entry) => ({
      name: entry.label,
      value: entry.value / 1e9,
    }));
  }, [valueHistory]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{String(t('holdingsPage.charts.currentAllocation'))}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, displayValue }) => `${name}: ${displayValue}`}
                  labelLine={false}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}%`, String(t('charts.pie.tooltipWeight'))]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{String(t('holdingsPage.charts.totalValueTrend'))}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${formatNumber(value * 1e9)}`}
                />
                <Tooltip
                  formatter={(value: number) => [`$${formatNumber(value * 1e9)}`, String(t('charts.line.tooltipValue'))]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

