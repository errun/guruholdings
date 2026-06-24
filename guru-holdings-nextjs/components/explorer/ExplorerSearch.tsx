'use client';

import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Building2, Filter, LoaderCircle, Search, SlidersHorizontal, X } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  changeBadgeVariant,
  getViewFormatters,
} from '@/lib/sec13f-view';
import { localizedPath, translate, type Locale } from '@/lib/i18n/site';

type AnyRecord = Record<string, any>;

type ExplorerSearchProps = {
  stocks: AnyRecord[];
  managers: AnyRecord[];
  consensus: AnyRecord;
  themes?: string[];
  stockTotal?: number;
  managerTotal?: number;
  searchIndex?: AnyRecord;
  initialQuery?: string;
  compact?: boolean;
  locale: Locale;
};

const normalize = (value: string) => value.trim().toUpperCase();

const matchesQuery = (searchText: string | undefined, query: string) => {
  if (!query) return true;
  return (searchText || '').includes(query);
};

const resultLimit = (compact?: boolean) => (compact ? 4 : 8);

export function ExplorerSearch({
  searchIndex = {},
  stocks,
  managers,
  consensus,
  themes: providedThemes,
  stockTotal,
  managerTotal,
  initialQuery = '',
  compact = false,
  locale,
}: ExplorerSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [managerId, setManagerId] = useState('all');
  const [changeType, setChangeType] = useState('all');
  const [theme, setTheme] = useState('all');
  const [concentration, setConcentration] = useState('all');
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = normalize(deferredQuery);
  const isFiltering = query !== deferredQuery;
  const {
    changeName,
    concentrationName,
    formatCurrency,
    formatNumber,
    formatQuarter,
    formatSignedCurrency,
    formatWeight,
    themeName,
  } = getViewFormatters(locale);

  const themes = useMemo(
    () => providedThemes || Array.from(new Set(stocks.flatMap((stock) => stock.themes || []))).sort(),
    [providedThemes, stocks]
  );

  const results = useMemo(() => {
    const stockResults = stocks
      .filter((stock) => matchesQuery(stock.searchText, normalizedQuery))
      .filter((stock) => managerId === 'all' || stock.holders?.some((holder: AnyRecord) => holder.managerId === managerId))
      .filter((stock) => changeType === 'all' || stock.holders?.some((holder: AnyRecord) => holder.changeType === changeType))
      .filter((stock) => theme === 'all' || stock.themes?.includes(theme))
      .slice(0, resultLimit(compact));

    const managerResults = managers
      .filter((manager) => matchesQuery(manager.searchText || searchIndex.managers?.find((item: AnyRecord) => item.id === manager.id)?.searchText, normalizedQuery))
      .filter((manager) => managerId === 'all' || manager.id === managerId)
      .filter((manager) => changeType === 'all' || (manager.metrics?.changeCounts?.[changeType] || 0) > 0)
      .filter((manager) => theme === 'all' || manager.themeAllocation?.some((item: AnyRecord) => item.theme === theme))
      .filter((manager) => concentration === 'all' || manager.metrics?.concentration === concentration)
      .slice(0, resultLimit(compact));

    const consensusItems = [
      ...(consensus.sharedIncrease || []).map((item: AnyRecord) => ({ ...item, direction: 'increase' })),
      ...(consensus.sharedDecrease || []).map((item: AnyRecord) => ({ ...item, direction: 'decrease' })),
    ];
    const consensusResults = consensusItems
      .filter((item) => {
        const text = [item.canonicalName, item.issuerName, item.canonicalTicker, ...(item.rawCusips || [])].join(' ').toUpperCase();
        return matchesQuery(text, normalizedQuery);
      })
      .filter((item) => changeType === 'all' || (changeType === 'increase' && item.direction === 'increase') || (changeType === 'decrease' && item.direction === 'decrease'))
      .filter((item) => theme === 'all' || item.themes?.includes(theme))
      .slice(0, compact ? 3 : 6);

    return { stockResults, managerResults, consensusResults };
  }, [compact, consensus, managers, managerId, normalizedQuery, searchIndex.managers, stocks, changeType, theme, concentration]);

  const hasFilters = query || managerId !== 'all' || changeType !== 'all' || theme !== 'all' || concentration !== 'all';

  return (
    <Card className="overflow-hidden border-stone-200 bg-white shadow-sm">
      <CardHeader className={compact ? 'gap-4 p-4 sm:p-5' : 'gap-3'}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Search className="h-5 w-5 text-primary" />
              {translate(locale, 'search.title')}
            </CardTitle>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {translate(locale, 'search.subtitle', {
                stocks: formatNumber(stockTotal ?? stocks.length),
                managers: formatNumber(managerTotal ?? managers.length),
              })}
            </p>
          </div>
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery('');
                setManagerId('all');
                setChangeType('all');
                setTheme('all');
                setConcentration('all');
              }}
            >
              <X className="h-4 w-4" />
              {translate(locale, 'search.clear')}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className={compact ? 'space-y-5 p-4 pt-0 sm:p-5 sm:pt-0' : 'space-y-5'}>
        <div className="grid gap-3">
          <div className="relative">
            {isFiltering ? (
              <LoaderCircle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" aria-hidden="true" />
            ) : (
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            )}
            <Input
              data-testid="explorer-search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 pl-9"
              placeholder={translate(locale, 'search.placeholder')}
              aria-busy={isFiltering}
            />
            <span className="sr-only" aria-live="polite">
              {isFiltering ? translate(locale, 'search.loading') : ''}
            </span>
          </div>
          <div className="grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <label className="sr-only" htmlFor="explorer-manager">{translate(locale, 'search.manager')}</label>
            <select
              id="explorer-manager"
              value={managerId}
              onChange={(event) => setManagerId(event.target.value)}
              className="h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">{translate(locale, 'search.allManagers')}</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>{manager.displayName}</option>
              ))}
            </select>

            <label className="sr-only" htmlFor="explorer-change">{translate(locale, 'search.changeType')}</label>
            <select
              id="explorer-change"
              value={changeType}
              onChange={(event) => setChangeType(event.target.value)}
              className="h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">{translate(locale, 'search.allChanges')}</option>
              <option value="new">{translate(locale, 'search.filterNew')}</option>
              <option value="increase">{translate(locale, 'search.filterIncrease')}</option>
              <option value="decrease">{translate(locale, 'search.filterDecrease')}</option>
              <option value="exit">{translate(locale, 'search.filterExit')}</option>
              <option value="unchanged">{translate(locale, 'search.filterUnchanged')}</option>
            </select>

            <label className="sr-only" htmlFor="explorer-theme">{translate(locale, 'search.theme')}</label>
            <select
              id="explorer-theme"
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
              className="h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">{translate(locale, 'search.allThemes')}</option>
              {themes.map((item) => (
                <option key={item} value={item}>{themeName(item)}</option>
              ))}
            </select>

            <label className="sr-only" htmlFor="explorer-concentration">{translate(locale, 'search.concentration')}</label>
            <select
              id="explorer-concentration"
              value={concentration}
              onChange={(event) => setConcentration(event.target.value)}
              className="h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">{translate(locale, 'search.allConcentrations')}</option>
              <option value="focused">{translate(locale, 'search.focused')}</option>
              <option value="balanced">{translate(locale, 'search.balanced')}</option>
              <option value="diversified">{translate(locale, 'search.diversified')}</option>
            </select>
          </div>
        </div>

        <div className={compact ? 'grid gap-4 lg:grid-cols-2' : 'grid gap-4 xl:grid-cols-3'}>
          <section data-testid="stock-results" className="min-w-0 rounded-lg border border-stone-200 bg-stone-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                {translate(locale, 'search.stockResults')}
              </h3>
              <Badge variant="outline" className="rounded-md bg-white">{results.stockResults.length}</Badge>
            </div>
            <div className="space-y-2">
              {results.stockResults.map((stock) => (
                <Link
                  key={stock.companyId}
                  href={localizedPath(locale, stock.href)}
                  data-testid="stock-result"
                  className="block rounded-md border border-stone-200 bg-white p-3 transition-colors hover:border-primary/40 hover:bg-stone-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="break-words font-semibold text-slate-950">{stock.canonicalName}</div>
                      <div className="mt-1 break-all font-mono text-xs text-muted-foreground">
                        {stock.canonicalTicker || stock.rawCusips?.join(', ')}
                      </div>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">{translate(locale, 'common.managers')}</span>
                      <div className="font-mono font-semibold">{stock.latestHolderCount}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{translate(locale, 'home.combinedValue')}</span>
                      <div className="font-mono font-semibold">{formatCurrency(stock.latestTotalValue)}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(stock.holders || []).slice(0, 3).map((holder: AnyRecord) => (
                      <Badge key={`${stock.companyId}-${holder.managerId}`} variant={changeBadgeVariant(holder.changeType)} className="rounded-md">
                        {holder.managerName} {changeName(holder.changeType)}
                      </Badge>
                    ))}
                  </div>
                </Link>
              ))}
              {results.stockResults.length === 0 && <EmptyResult label={translate(locale, 'search.noStocks')} />}
            </div>
          </section>

          <section data-testid="manager-results" className="min-w-0 rounded-lg border border-stone-200 bg-stone-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <Building2 className="h-4 w-4 text-primary" />
                {translate(locale, 'search.managerResults')}
              </h3>
              <Badge variant="outline" className="rounded-md bg-white">{results.managerResults.length}</Badge>
            </div>
            <div className="space-y-2">
              {results.managerResults.map((manager) => (
                <Link
                  key={manager.id}
                  href={localizedPath(locale, `/live-13f/${manager.id}`)}
                  data-testid="manager-result"
                  className="block rounded-md border border-stone-200 bg-white p-3 transition-colors hover:border-primary/40 hover:bg-stone-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="break-words font-semibold text-slate-950">{manager.displayName}</div>
                      <div className="mt-1 break-words text-xs text-muted-foreground">{manager.leadInvestor}</div>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">{translate(locale, 'common.totalValue')}</span>
                      <div className="font-mono font-semibold">{formatCurrency(manager.latestTotalValue)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{translate(locale, 'home.top10')}</span>
                      <div className="font-mono font-semibold">{formatWeight(manager.metrics?.top10Weight || 0)}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    <Badge variant="outline" className="rounded-md bg-white">{concentrationName(manager.metrics?.concentration || 'unknown')}</Badge>
                    <Badge variant="secondary" className="rounded-md">{formatQuarter(manager.latestQuarter)}</Badge>
                  </div>
                </Link>
              ))}
              {results.managerResults.length === 0 && <EmptyResult label={translate(locale, 'search.noManagers')} />}
            </div>
          </section>

          <section data-testid="consensus-results" className={`min-w-0 rounded-lg border border-stone-200 bg-stone-50 p-4 ${compact ? 'lg:col-span-2' : ''}`}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <Filter className="h-4 w-4 text-primary" />
                {translate(locale, 'search.consensusResults')}
              </h3>
              <Badge variant="outline" className="rounded-md bg-white">{results.consensusResults.length}</Badge>
            </div>
            <div className="space-y-2">
              {results.consensusResults.map((item) => {
                const isIncrease = item.direction === 'increase';
                const Icon = isIncrease ? ArrowUpRight : ArrowDownRight;
                const managersCount = isIncrease ? item.increaseManagers?.length : item.decreaseManagers?.length;
                return (
                  <Link
                    key={`${item.direction}-${item.companyId}`}
                    href={localizedPath(locale, item.href)}
                    data-testid="consensus-result"
                    className="block rounded-md border border-stone-200 bg-white p-3 transition-colors hover:border-primary/40 hover:bg-stone-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${isIncrease ? 'text-emerald-700' : 'text-red-700'}`} />
                          <div className="break-words font-semibold text-slate-950">{item.canonicalName || item.issuerName}</div>
                        </div>
                        <div className="mt-1 break-all font-mono text-xs text-muted-foreground">{item.rawCusips?.join(', ') || item.cusip}</div>
                      </div>
                      <Badge variant={isIncrease ? 'success' : 'destructive'} className="rounded-md">
                        {translate(locale, isIncrease ? 'home.sharedIncrease' : 'home.sharedDecrease')}
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">{translate(locale, 'common.managers')}</span>
                        <div className="font-mono font-semibold">{managersCount}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{translate(locale, 'common.marketValue')}</span>
                        <div className="font-mono font-semibold">{formatSignedCurrency(item.netValueChange)}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {results.consensusResults.length === 0 && <EmptyResult label={translate(locale, 'search.noConsensus')} />}
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyResult({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed border-stone-300 bg-white p-4 text-sm text-muted-foreground">
      {label}
    </div>
  );
}
