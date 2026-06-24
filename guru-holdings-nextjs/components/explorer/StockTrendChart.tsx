'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getManagerColor, getShortManagerName } from '@/lib/manager-colors';
import { getViewFormatters } from '@/lib/sec13f-view';
import { translate, type Locale } from '@/lib/i18n/site';

type AnyRecord = Record<string, any>;

type ManagerSeries = {
  id: string;
  name: string;
  color: string;
  lastIndex: number;
  labelOffset: number;
};

function buildSeries(quarters: AnyRecord[]) {
  const managerNames = new Map<string, string>();
  const lastPoints = new Map<string, { index: number; weight: number }>();
  let maxWeight = 1;

  quarters.forEach((quarter, index) => {
    (quarter.holders || []).forEach((holder: AnyRecord) => {
      maxWeight = Math.max(maxWeight, Number(holder.weight || 0));
      managerNames.set(holder.managerId, holder.managerName);
      lastPoints.set(holder.managerId, { index, weight: Number(holder.weight || 0) });
    });
  });

  const ordered = Array.from(managerNames, ([id, name]) => ({
    id,
    name,
    color: getManagerColor(id),
    lastIndex: lastPoints.get(id)?.index ?? -1,
    finalWeight: lastPoints.get(id)?.weight ?? 0,
    labelOffset: 0,
  })).sort((a, b) => b.finalWeight - a.finalWeight);

  const estimatedPlotHeight = 220;
  const minimumLabelGap = 20;
  const rawLabelY = ordered.map((manager) => ((maxWeight - manager.finalWeight) / maxWeight) * estimatedPlotHeight);

  for (let groupStart = 0; groupStart < ordered.length;) {
    let groupEnd = groupStart;
    while (groupEnd + 1 < ordered.length && rawLabelY[groupEnd + 1] - rawLabelY[groupEnd] < minimumLabelGap) {
      groupEnd += 1;
    }

    if (groupEnd > groupStart) {
      const count = groupEnd - groupStart + 1;
      const center = rawLabelY.slice(groupStart, groupEnd + 1).reduce((sum, value) => sum + value, 0) / count;
      const targetStart = Math.max(0, Math.min(
        estimatedPlotHeight - (count - 1) * minimumLabelGap,
        center - ((count - 1) * minimumLabelGap) / 2,
      ));
      for (let index = groupStart; index <= groupEnd; index += 1) {
        const targetY = targetStart + (index - groupStart) * minimumLabelGap;
        ordered[index].labelOffset = targetY - rawLabelY[index];
      }
    }

    groupStart = groupEnd + 1;
  }

  return ordered;
}

function buildTrendRows(quarters: AnyRecord[], series: ManagerSeries[]) {
  return quarters.map((quarter) => {
    const row: AnyRecord = { quarter: quarter.quarter };
    const holders = new Map((quarter.holders || []).map((holder: AnyRecord) => [holder.managerId, holder]));

    series.forEach((manager) => {
      const holder = holders.get(manager.id) as AnyRecord | undefined;
      row[`${manager.id}Weight`] = holder?.weight ?? null;
      row[`${manager.id}Shares`] = holder?.shares ?? null;
      row[`${manager.id}Action`] = holder?.changeType ?? null;
    });

    return row;
  });
}

export function StockTrendChart({ stock, locale }: { stock: AnyRecord; locale: Locale }) {
  const quarters = stock.quarters || [];
  const series = buildSeries(quarters);
  const trend = buildTrendRows(quarters, series);
  const { changeName, formatNumber, formatQuarter, formatWeight } = getViewFormatters(locale);

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-3 sm:p-5">
      <div className="h-[320px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend} margin={{ top: 18, right: 132, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="#e7e0d6" vertical={false} />
            <XAxis dataKey="quarter" tickLine={false} axisLine={false} tickFormatter={formatQuarter} fontSize={12} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={54}
              tickFormatter={(value) => formatWeight(Number(value), 1)}
              fontSize={12}
            />
            <Tooltip
              cursor={{ stroke: '#94a3b8', strokeDasharray: '4 4' }}
              content={({ active, label, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="max-w-[260px] rounded-md border border-stone-200 bg-white p-3 text-xs shadow-lg">
                    <div className="mb-2 font-semibold text-slate-950">{formatQuarter(String(label))}</div>
                    <div className="space-y-2">
                      {payload.filter((item) => item.value !== null).map((item) => {
                        const manager = series.find((entry) => `${entry.id}Weight` === item.dataKey);
                        if (!manager) return null;
                        const row = item.payload as AnyRecord;
                        return (
                          <div key={manager.id} className="border-t border-stone-100 pt-2 first:border-0 first:pt-0">
                            <div className="flex items-center gap-2 font-medium text-slate-900">
                              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: manager.color }} />
                              {manager.name}
                            </div>
                            <div className="mt-1 text-muted-foreground">
                              {formatWeight(Number(item.value))} · {formatNumber(Number(row[`${manager.id}Shares`]))} {translate(locale, 'common.shares')}
                            </div>
                            <div className="mt-0.5 text-muted-foreground">{changeName(String(row[`${manager.id}Action`]))}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }}
            />
            {series.map((manager) => (
              <Line
                key={manager.id}
                type="monotone"
                dataKey={`${manager.id}Weight`}
                name={manager.name}
                stroke={manager.color}
                strokeWidth={2.5}
                dot={{ r: 3, fill: manager.color }}
                activeDot={{ r: 5 }}
                connectNulls={false}
                isAnimationActive={false}
                label={(props: AnyRecord) => {
                  if (props.index !== manager.lastIndex || props.value === null || props.value === undefined) return <g />;
                  return (
                    <text
                      x={Number(props.x) + 8}
                      y={Number(props.y) + manager.labelOffset}
                      dominantBaseline="middle"
                      fill={manager.color}
                      fontSize={11}
                      fontWeight={600}
                    >
                      {getShortManagerName(manager.name)}
                    </text>
                  );
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
