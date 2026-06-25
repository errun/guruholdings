import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import snapshot from '@/data-generated/snapshots/latest.json';
import { buildHoldingChangeModel } from '@/lib/holding-change.mjs';
import { getViewFormatters } from '@/lib/sec13f-view';
import { localizedPath, translate, type Locale } from '@/lib/i18n/site';
import { stockPath } from '@/lib/stock-routes';
import { getFreshnessDisplay } from '@/lib/update-cadence';

type ConsensusItem =
  | typeof snapshot.consensus.sharedIncrease[number]
  | typeof snapshot.consensus.sharedDecrease[number];

type StrongSignal = {
  item: ConsensusItem;
  direction: 'increase' | 'decrease';
  rows: ConsensusItem['managers'];
};

const directionalManagers = (item: ConsensusItem, direction: 'increase' | 'decrease') =>
  item.managers.filter((manager) =>
    direction === 'increase'
      ? manager.changeType === 'increase' || manager.changeType === 'new'
      : manager.changeType === 'decrease' || manager.changeType === 'exit'
  );

const buildStrongSignals = (): StrongSignal[] => {
  const increases = snapshot.consensus.sharedIncrease
    .map((item) => ({ item, direction: 'increase' as const, rows: directionalManagers(item, 'increase') }))
    .filter((signal) => signal.rows.length >= 2)
    .slice(0, 2);
  const decreases = snapshot.consensus.sharedDecrease
    .map((item) => ({ item, direction: 'decrease' as const, rows: directionalManagers(item, 'decrease') }))
    .filter((signal) => signal.rows.length >= 2)
    .slice(0, 2);

  return [...increases, ...decreases]
    .sort((a, b) =>
      b.rows.length - a.rows.length
      || Math.abs(b.item.netValueChange || 0) - Math.abs(a.item.netValueChange || 0)
    )
    .slice(0, 4);
};

const darkDirectionClass = (value: number) => {
  if (value > 0) return 'text-emerald-300';
  if (value < 0) return 'text-red-300';
  return 'text-slate-300';
};

export function SignalHero({
  locale,
}: {
  locale: Locale;
}) {
  const { formatDateTime, formatNumber, formatQuarter } = getViewFormatters(locale);
  const freshness = getFreshnessDisplay(snapshot.latestQuarter, locale);
  const strongSignals = buildStrongSignals();
  const sharedIncreaseCount = snapshot.consensus.sharedIncrease.length;
  const sharedDecreaseCount = snapshot.consensus.sharedDecrease.length;

  return (
    <section className="border-b border-stone-200 bg-white" data-testid="signal-hero">
      <div className="container py-5 sm:py-6 lg:py-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.78fr)] lg:items-stretch">
          <div className="min-w-0">
            <h1 className="max-w-4xl break-words text-3xl font-semibold leading-[1.08] text-slate-950 sm:text-4xl lg:text-[2.65rem]">
              {translate(locale, 'home.hero.title')}
            </h1>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <SignalCountBlock
                direction="increase"
                label={translate(locale, 'home.sharedIncrease')}
                value={formatNumber(sharedIncreaseCount)}
                description={translate(locale, 'signal.hero.sharedMoveHint')}
              />
              <SignalCountBlock
                direction="decrease"
                label={translate(locale, 'home.sharedDecrease')}
                value={formatNumber(sharedDecreaseCount)}
                description={translate(locale, 'signal.hero.sharedMoveHint')}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-stone-200 py-2 text-[11px] leading-5 text-muted-foreground sm:text-xs" data-testid="hero-status-line">
              <span>
                <span className="font-medium text-slate-800">{translate(locale, 'home.latestQuarter')}</span>{' '}
                <span className="font-mono text-slate-950">{formatQuarter(snapshot.latestQuarter)}</span>
              </span>
              <span className="hidden text-stone-300 sm:inline">/</span>
              <span>
                <span className="font-medium text-slate-800">{translate(locale, 'common.managers')}</span>{' '}
                <span className="font-mono text-slate-950">{formatNumber(snapshot.managers.length)}</span>
              </span>
              <span className="hidden text-stone-300 sm:inline">/</span>
              <span>{translate(locale, 'signal.hero.generatedShort', { date: formatDateTime(snapshot.generatedAt) })}</span>
              <span className="hidden text-stone-300 sm:inline">/</span>
              <span>{translate(locale, 'signal.hero.nextCheckShort', { date: freshness.nextCheckDate })}</span>
            </div>
          </div>

          <div className="min-w-0 rounded-md border border-slate-800 bg-slate-950 p-4 text-white shadow-sm sm:p-5" data-testid="hero-strong-signals">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-white">{translate(locale, 'signal.hero.strongSignals')}</h2>
                <p className="mt-1 text-xs leading-5 text-slate-300">
                  {translate(locale, 'signal.hero.strongSignalsDescription')}
                </p>
              </div>
              <Badge variant="outline" className="shrink-0 rounded-sm border-white/20 bg-white/5 font-mono text-white">
                {formatNumber(strongSignals.length)}
              </Badge>
            </div>
            <div className="grid min-w-0 gap-2.5">
              {strongSignals.map((signal) => (
                <StrongSignalRow
                  key={`${signal.direction}-${signal.item.companyId}`}
                  signal={signal}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SignalCountBlock({
  direction,
  label,
  value,
  description,
}: {
  direction: 'increase' | 'decrease';
  label: string;
  value: string;
  description: string;
}) {
  const isIncrease = direction === 'increase';

  return (
    <div className={`min-h-[92px] rounded-md border bg-stone-50 p-3 ${isIncrease ? 'border-emerald-200' : 'border-red-200'}`} data-testid={`hero-count-${direction}`}>
      <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
        {isIncrease ? (
          <ArrowUpRight className="h-4 w-4 text-emerald-700" />
        ) : (
          <ArrowDownRight className="h-4 w-4 text-red-700" />
        )}
        <span className="break-words">{label}</span>
      </div>
      <div className={`mt-2 font-mono text-3xl font-semibold leading-none ${isIncrease ? 'text-emerald-700' : 'text-red-700'}`}>
        {value}
      </div>
      <div className="mt-2 text-[11px] leading-4 text-muted-foreground">{description}</div>
    </div>
  );
}

function StrongSignalRow({ signal, locale }: { signal: StrongSignal; locale: Locale }) {
  const { changeName, formatNumber, formatSignedCurrency } = getViewFormatters(locale);
  const isIncrease = signal.direction === 'increase';
  const Icon = isIncrease ? ArrowUpRight : ArrowDownRight;
  const colorClass = isIncrease ? 'text-emerald-300' : 'text-red-300';
  const bgClass = isIncrease ? 'bg-emerald-400/10 ring-emerald-300/25' : 'bg-red-400/10 ring-red-300/25';
  const managerNames = signal.rows.slice(0, 3).map((manager) => manager.managerName).join(' / ');
  const extraCount = Math.max(0, signal.rows.length - 3);
  const leadManager = signal.rows[0];

  return (
    <Link
      href={localizedPath(locale, stockPath(signal.item.companyId))}
      className="group block min-w-0 max-w-full overflow-hidden rounded-md border border-white/10 bg-white/[0.045] px-3 py-2.5 transition-colors hover:border-white/25 hover:bg-white/[0.075]"
      data-testid="hero-strong-signal-row"
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <span className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md ring-1 ${bgClass}`}>
            <Icon className={`h-4 w-4 ${colorClass}`} />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">
              {signal.item.canonicalName || signal.item.issuerName}
            </div>
            <div className="mt-0.5 truncate font-mono text-[11px] text-slate-400">
              {signal.item.canonicalTicker || signal.item.rawCusips?.join(', ') || signal.item.cusip}
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <Badge variant="outline" className={`rounded-sm border-white/10 bg-white/5 px-1.5 py-0 text-[10px] ${colorClass}`}>
            {translate(locale, isIncrease ? 'home.sharedIncrease' : 'home.sharedDecrease')}
          </Badge>
          <div className={`mt-1 font-mono text-[11px] font-semibold ${darkDirectionClass(signal.item.netValueChange)}`}>
            {formatSignedCurrency(signal.item.netValueChange)}
          </div>
        </div>
      </div>

      <div className="mt-2 min-w-0 truncate text-[11px] leading-4 text-slate-300">
        {managerNames}
        {extraCount > 0 ? ` / +${formatNumber(extraCount)}` : ''}
      </div>
      {leadManager && (
        <StrongManagerMove
          manager={leadManager}
          locale={locale}
          actionName={changeName(leadManager.changeType)}
        />
      )}

      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-400">
        <span className="truncate">
          {translate(locale, 'common.managerCount', { count: formatNumber(signal.rows.length) })}
        </span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function StrongManagerMove({
  manager,
  locale,
  actionName,
}: {
  manager: ConsensusItem['managers'][number];
  locale: Locale;
  actionName: string;
}) {
  const { formatSignedNumber, formatWeight } = getViewFormatters(locale);
  const change = buildHoldingChangeModel(manager);
  const shareDelta = change.shareDelta ?? 0;
  const shareClass = shareDelta > 0 ? 'text-emerald-300' : shareDelta < 0 ? 'text-red-300' : 'text-slate-300';
  const weightText = change.showWeightTransition
    ? translate(locale, 'signal.hero.weightMove', {
      previous: formatWeight(change.previousWeight),
      current: formatWeight(change.currentWeight),
    })
    : translate(locale, 'signal.hero.specialWeight', {
      weight: formatWeight(change.specialWeight ?? change.currentWeight),
    });

  return (
    <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-4">
      <span className="shrink-0 rounded-sm bg-white/10 px-1 py-0.5 text-[10px] text-slate-300">{actionName}</span>
      <span className={`min-w-0 whitespace-nowrap font-mono font-semibold ${shareClass}`}>
        {formatSignedNumber(shareDelta)} {translate(locale, 'common.shares')}
      </span>
      <span className="min-w-0 truncate font-mono text-slate-400">{weightText}</span>
    </div>
  );
}
