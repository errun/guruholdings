import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  LogIn,
  LogOut,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SourceLinkBadge } from '@/components/signals/SourceLinkBadge';
import { cn } from '@/lib/utils';
import {
  changeBadgeVariant,
  directionTextClass,
  getViewFormatters,
} from '@/lib/sec13f-view';
import { localizedPath, translate, type Locale } from '@/lib/i18n/site';
import type { SignalItem } from '@/lib/signals';

const iconByKind = {
  new: LogIn,
  increase: ArrowUpRight,
  decrease: ArrowDownRight,
  exit: LogOut,
};

function kindTextClass(kind: SignalItem['kind']) {
  if (kind === 'new' || kind === 'increase') return 'text-emerald-700';
  return 'text-red-700';
}

function weightText(signal: SignalItem, locale: Locale) {
  const { formatWeight } = getViewFormatters(locale);
  if (signal.kind === 'exit') return formatWeight(signal.previousWeight);
  if (signal.kind === 'new') return formatWeight(signal.currentWeight);
  if (signal.previousWeight !== null && signal.currentWeight !== null) {
    return `${formatWeight(signal.previousWeight)} -> ${formatWeight(signal.currentWeight)}`;
  }
  return formatWeight(signal.currentWeight);
}

export function SignalCard({
  signal,
  locale,
  compact = false,
}: {
  signal: SignalItem;
  locale: Locale;
  compact?: boolean;
}) {
  const Icon = iconByKind[signal.kind];
  const {
    changeName,
    formatDate,
    formatNumber,
    formatPercent,
    formatQuarter,
    formatSignedCurrency,
    formatSignedNumber,
  } = getViewFormatters(locale);

  return (
    <article className={cn(
      'rounded-md border border-stone-200 bg-white p-4 transition-colors hover:border-primary/40',
      compact && 'p-3',
    )}>
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant={changeBadgeVariant(signal.kind)} className="rounded-sm">
              <Icon className={cn('mr-1 h-3.5 w-3.5', kindTextClass(signal.kind))} />
              {changeName(signal.kind)}
            </Badge>
            <Badge variant="outline" className="rounded-sm border-stone-300 bg-white font-mono">
              {formatQuarter(signal.managerQuarter)}
            </Badge>
            {signal.isStale && (
              <Badge variant="warning" className="rounded-sm">
                {translate(locale, 'stock.latestAvailable')}
              </Badge>
            )}
          </div>
          <Link
            href={localizedPath(locale, signal.stockHref)}
            className="block break-words text-base font-semibold leading-snug text-slate-950 hover:text-primary hover:underline"
          >
            {signal.canonicalName || signal.issuerName}
          </Link>
          <div className="mt-1 break-all font-mono text-xs text-muted-foreground">
            {signal.ticker || signal.cusips.join(', ')}
          </div>
        </div>
        <SourceLinkBadge href={signal.sourceUrl} locale={locale} className="hidden shrink-0 sm:inline-flex" />
      </div>

      <div className="mt-4 min-w-0">
        <Link
          href={localizedPath(locale, signal.managerHref)}
          className="break-words text-sm font-medium text-slate-900 hover:text-primary hover:underline"
        >
          {signal.managerName}
        </Link>
        {signal.leadInvestor && (
          <div className="mt-1 break-words text-xs text-muted-foreground">{signal.leadInvestor}</div>
        )}
      </div>

      <div className={cn('mt-4 grid gap-3 text-sm', compact ? 'sm:grid-cols-2' : 'sm:grid-cols-3')}>
        <Metric
          label={translate(locale, 'common.shareChange')}
          value={`${formatSignedNumber(signal.shareChange)} ${translate(locale, 'common.shares')}`}
          detail={signal.kind === 'exit'
            ? `${translate(locale, 'common.current')}: ${formatNumber(signal.currentShares)} ${translate(locale, 'common.shares')}`
            : signal.shareChangePercent !== null ? formatPercent(signal.shareChangePercent) : undefined}
          tone={directionTextClass(signal.shareChange)}
        />
        <Metric
          label={translate(locale, 'common.valueChange')}
          value={formatSignedCurrency(signal.valueChange)}
          tone={directionTextClass(signal.valueChange)}
        />
        <Metric
          label={translate(locale, 'common.positionWeight')}
          value={weightText(signal, locale)}
          detail={signal.filingDate ? formatDate(signal.filingDate) : undefined}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 sm:hidden">
        <SourceLinkBadge href={signal.sourceUrl} locale={locale} />
        <ArrowRight className="h-4 w-4 text-primary" />
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: string;
}) {
  return (
    <div className="min-w-0 rounded-md bg-stone-50 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn('mt-1 break-words font-mono text-sm font-semibold text-slate-950', tone)}>{value}</div>
      {detail && <div className="mt-1 break-words text-xs text-muted-foreground">{detail}</div>}
    </div>
  );
}
