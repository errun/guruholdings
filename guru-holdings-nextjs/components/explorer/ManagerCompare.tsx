'use client';

import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight, GitCompareArrows } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getViewFormatters,
} from '@/lib/sec13f-view';
import { localizedPath, translate, type Locale } from '@/lib/i18n/site';

type AnyRecord = Record<string, any>;

export function ManagerCompare({ managers, locale }: { managers: AnyRecord[]; locale: Locale }) {
  const { concentrationName, formatCurrency, formatNumber, formatWeight } = getViewFormatters(locale);
  const [selectedIds, setSelectedIds] = useState<string[]>(managers.slice(0, 3).map((manager) => manager.id));

  const selectedManagers = useMemo(
    () => managers.filter((manager) => selectedIds.includes(manager.id)),
    [managers, selectedIds]
  );

  const comparison = useMemo(() => {
    if (selectedManagers.length < 2) return { commonHoldings: [], sharedIncrease: [], sharedDecrease: [] };

    const maps: Array<Map<string, AnyRecord>> = selectedManagers.map(
      (manager) => new Map((manager.companyHoldings || []).map((holding: AnyRecord) => [holding.companyId, holding]))
    );
    const commonIds = [...maps[0].keys()].filter((companyId) => maps.every((map) => map.has(companyId)));
    const commonHoldings = commonIds
      .map((companyId) => {
        const holdings = selectedManagers.map((manager, index) => ({
          managerId: manager.id,
          managerName: manager.displayName,
          holding: maps[index].get(companyId) as AnyRecord,
        }));
        const first = holdings[0].holding as AnyRecord;
        return {
          companyId,
          href: first.href,
          canonicalName: first.canonicalName || first.issuerName,
          rawCusips: first.rawCusips || [first.cusip],
          totalValue: holdings.reduce((sum, item) => sum + item.holding.value, 0),
          holdings,
        };
      })
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 8);

    const changeMaps: Array<Map<string, AnyRecord>> = selectedManagers.map(
      (manager) => new Map((manager.latestCompanyChanges || []).map((change: AnyRecord) => [change.companyId, change]))
    );
    const sharedChangeIds = [...changeMaps[0].keys()].filter((companyId) => changeMaps.every((map) => map.has(companyId)));
    const sharedChanges = sharedChangeIds.map((companyId) => {
      const changes = selectedManagers.map((manager, index) => ({
        managerId: manager.id,
        managerName: manager.displayName,
        change: changeMaps[index].get(companyId) as AnyRecord,
      }));
      const first = changes[0].change as AnyRecord;
      return {
        companyId,
        href: first.href,
        canonicalName: first.canonicalName || first.issuerName,
        changes,
      };
    });

    return {
      commonHoldings,
      sharedIncrease: sharedChanges
        .filter((item) => item.changes.every((row) => ['increase', 'new'].includes(row.change.changeType)))
        .sort((a, b) => Math.abs(sumShareChange(b.changes)) - Math.abs(sumShareChange(a.changes)))
        .slice(0, 6),
      sharedDecrease: sharedChanges
        .filter((item) => item.changes.every((row) => ['decrease', 'exit'].includes(row.change.changeType)))
        .sort((a, b) => Math.abs(sumShareChange(b.changes)) - Math.abs(sumShareChange(a.changes)))
        .slice(0, 6),
    };
  }, [selectedManagers]);

  const toggleManager = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return [current[1], current[2], id].filter(Boolean);
      return [...current, id];
    });
  };

  return (
    <Card className="border-stone-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <GitCompareArrows className="h-5 w-5 text-primary" />
          {translate(locale, 'compare.title')}
        </CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">{translate(locale, 'compare.subtitle')}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <>
        <div className="flex flex-wrap gap-2">
          {managers.map((manager) => {
            const active = selectedIds.includes(manager.id);
            return (
              <button
                key={manager.id}
                type="button"
                onClick={() => toggleManager(manager.id)}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  active ? 'border-primary bg-primary text-primary-foreground' : 'border-stone-300 bg-white text-slate-800 hover:border-primary/40'
                }`}
              >
                {manager.displayName}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {selectedManagers.map((manager) => (
            <Link key={manager.id} href={localizedPath(locale, `/live-13f/${manager.id}`)} className="rounded-lg border border-stone-200 bg-stone-50 p-4 hover:border-primary/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-950">{manager.displayName}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{manager.leadInvestor}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <Metric label={translate(locale, 'common.totalValue')} value={formatCurrency(manager.latestTotalValue)} />
                <Metric label={translate(locale, 'common.companyCount')} value={formatNumber(manager.companyHoldingCount ?? manager.companyHoldings.length)} />
                <Metric label={translate(locale, 'manager.top10Weight')} value={formatWeight(manager.metrics?.top10Weight || 0)} />
                <Metric label={translate(locale, 'search.concentration')} value={concentrationName(manager.metrics?.concentration || 'unknown')} />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-1 text-center text-xs">
                <CountBadge label={translate(locale, 'change.new')} value={manager.metrics?.changeCounts?.new || 0} tone="green" />
                <CountBadge label={translate(locale, 'change.exit')} value={manager.metrics?.changeCounts?.exit || 0} tone="red" />
                <CountBadge label={translate(locale, 'change.increase')} value={manager.metrics?.changeCounts?.increase || 0} tone="green" />
                <CountBadge label={translate(locale, 'change.decrease')} value={manager.metrics?.changeCounts?.decrease || 0} tone="red" />
              </div>
            </Link>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <SignalList title={translate(locale, 'compare.commonHoldings')} items={comparison.commonHoldings} kind="holding" locale={locale} />
          <SignalList title={translate(locale, 'compare.sharedIncrease')} items={comparison.sharedIncrease} kind="increase" locale={locale} />
          <SignalList title={translate(locale, 'compare.sharedDecrease')} items={comparison.sharedDecrease} kind="decrease" locale={locale} />
        </div>
        </>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground">{label}</div>
      <div className="mt-1 break-words font-mono font-semibold leading-tight text-slate-950">{value}</div>
    </div>
  );
}

function CountBadge({ label, value, tone }: { label: string; value: number; tone: 'green' | 'red' }) {
  const className = tone === 'green' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800';
  return (
    <div className={`rounded-md px-2 py-2 ${className}`}>
      <div>{label}</div>
      <div className="font-mono font-semibold">{value}</div>
    </div>
  );
}

function SignalList({ title, items, kind, locale }: { title: string; items: AnyRecord[]; kind: 'holding' | 'increase' | 'decrease'; locale: Locale }) {
  const Icon = kind === 'decrease' ? ArrowDownRight : ArrowUpRight;
  const { changeName, formatCurrency, formatSignedNumber } = getViewFormatters(locale);
  return (
    <section className="min-w-0 rounded-lg border border-stone-200 bg-stone-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
          {kind === 'holding' ? <GitCompareArrows className="h-4 w-4 text-primary" /> : <Icon className={`h-4 w-4 ${kind === 'increase' ? 'text-emerald-700' : 'text-red-700'}`} />}
          {title}
        </h3>
        <Badge variant="outline" className="rounded-md bg-white">{items.length}</Badge>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <Link key={`${kind}-${item.companyId}`} href={localizedPath(locale, item.href)} className="block rounded-md border border-stone-200 bg-white p-3 hover:border-primary/40">
            <div className="break-words font-semibold text-slate-950">{item.canonicalName}</div>
            {kind === 'holding' ? (
              <div className="mt-1 font-mono text-xs text-muted-foreground">{formatCurrency(item.totalValue)}</div>
            ) : (
              <div className="mt-2 flex flex-wrap gap-1">
                {item.changes.map((row: AnyRecord) => (
                  <Badge key={row.managerId} variant={kind === 'increase' ? 'success' : 'destructive'} className="rounded-md">
                    {row.managerName} {changeName(row.change.changeType)} {formatSignedNumber(row.change.shareChange)}
                  </Badge>
                ))}
              </div>
            )}
          </Link>
        ))}
        {items.length === 0 && <div className="rounded-md border border-dashed border-stone-300 bg-white p-4 text-sm text-muted-foreground">{translate(locale, 'compare.noMatch')}</div>}
      </div>
    </section>
  );
}

function sumShareChange(rows: AnyRecord[]) {
  return rows.reduce((sum, row) => sum + (row.change?.shareChange || 0), 0);
}
