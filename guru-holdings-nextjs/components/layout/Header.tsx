import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, BarChart3 } from 'lucide-react';
import snapshot from '@/data-generated/snapshots/latest.json';
import { getViewFormatters } from '@/lib/sec13f-view';
import { getFreshnessDisplay } from '@/lib/update-cadence';
import { localizedPath, translate, type Locale } from '@/lib/i18n/site';
import { LanguageSelector } from './LanguageSelector';

export function Header({ locale }: { locale: Locale }) {
  const { formatDateTime, formatNumber, formatQuarter } = getViewFormatters(locale);
  const freshness = getFreshnessDisplay(snapshot.latestQuarter, locale);
  const sharedIncreaseCount = snapshot.consensus.sharedIncrease.length;
  const sharedDecreaseCount = snapshot.consensus.sharedDecrease.length;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-background/92 backdrop-blur supports-[backdrop-filter]:bg-background/78">
      <div className="container flex h-16 items-center justify-between gap-3">
        <Link href={localizedPath(locale, '/')} className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BarChart3 className="h-4 w-4" />
          </span>
          <span className="hidden truncate text-lg font-semibold text-slate-950 sm:inline">
            {translate(locale, 'brand.name')}
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-3 sm:gap-5" aria-label="Primary">
          <Link href={localizedPath(locale, '/')} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {translate(locale, 'nav.home')}
          </Link>
          <Link href={localizedPath(locale, '/live-13f')} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {translate(locale, 'nav.data')}
          </Link>
          <LanguageSelector locale={locale} />
        </nav>
      </div>
      <div className="border-t border-stone-200/80 bg-white/86">
        <div className="container flex min-h-10 flex-wrap items-center gap-x-3 gap-y-1 py-2 text-[11px] leading-5 text-muted-foreground sm:text-xs" data-testid="header-signal-summary">
          <HeaderSignalMetric
            direction="increase"
            label={translate(locale, 'home.sharedIncrease')}
            value={formatNumber(sharedIncreaseCount)}
            description={translate(locale, 'signal.hero.sharedMoveHint')}
          />
          <span className="hidden text-stone-300 sm:inline">/</span>
          <HeaderSignalMetric
            direction="decrease"
            label={translate(locale, 'home.sharedDecrease')}
            value={formatNumber(sharedDecreaseCount)}
            description={translate(locale, 'signal.hero.sharedMoveHint')}
          />
          <span className="hidden text-stone-300 sm:inline">/</span>
          <span className="whitespace-nowrap">
            <span className="font-medium text-slate-800">{translate(locale, 'home.latestQuarter')}</span>{' '}
            <span className="font-mono text-slate-950">{formatQuarter(snapshot.latestQuarter)}</span>
          </span>
          <span className="hidden text-stone-300 sm:inline">/</span>
          <span className="whitespace-nowrap">
            <span className="font-medium text-slate-800">{translate(locale, 'common.managers')}</span>{' '}
            <span className="font-mono text-slate-950">{formatNumber(snapshot.managers.length)}</span>
          </span>
          <span className="hidden text-stone-300 sm:inline">/</span>
          <span className="whitespace-nowrap">{translate(locale, 'signal.hero.generatedShort', { date: formatDateTime(snapshot.generatedAt) })}</span>
          <span className="hidden text-stone-300 sm:inline">/</span>
          <span className="whitespace-nowrap">{translate(locale, 'signal.hero.nextCheckShort', { date: freshness.nextCheckDate })}</span>
        </div>
      </div>
    </header>
  );
}

function HeaderSignalMetric({
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
  const Icon = isIncrease ? ArrowUpRight : ArrowDownRight;

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap" data-testid={`header-count-${direction}`}>
      <Icon className={`h-3.5 w-3.5 ${isIncrease ? 'text-emerald-700' : 'text-red-700'}`} />
      <span className="font-medium text-slate-800">{label}</span>
      <span className={`font-mono text-base font-semibold leading-none ${isIncrease ? 'text-emerald-700' : 'text-red-700'}`}>
        {value}
      </span>
      <span className="hidden text-muted-foreground lg:inline">{description}</span>
    </span>
  );
}
