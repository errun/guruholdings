import { CalendarClock } from 'lucide-react';
import snapshot from '@/data-generated/snapshots/latest.json';
import { getNextExpectedFiling } from '@/lib/filing-calendar';
import { getViewFormatters } from '@/lib/sec13f-view';
import { translate, type Locale } from '@/lib/i18n/site';

export function FilingExpectation({ locale, className = '' }: { locale: Locale; className?: string }) {
  const expectation = getNextExpectedFiling(snapshot);
  const { formatDate, formatNumber, formatQuarter } = getViewFormatters(locale);

  if (!expectation) {
    return (
      <div className={`rounded-md border border-stone-200 bg-stone-50 p-4 ${className}`}>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
          <CalendarClock className="h-4 w-4 text-primary" />
          {translate(locale, 'filing.expected.title')}
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{translate(locale, 'filing.expected.unavailable')}</p>
      </div>
    );
  }

  return (
    <div className={`rounded-md border border-stone-200 bg-stone-50 p-4 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
        <CalendarClock className="h-4 w-4 text-primary" />
        {translate(locale, 'filing.expected.title')}
      </div>
      <div className="mt-2 font-mono text-lg font-semibold text-slate-950">
        {formatDate(expectation.expectedDate.toISOString())}
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {translate(locale, 'filing.expected.body', {
          manager: expectation.managerName,
          quarter: formatQuarter(expectation.expectedQuarter),
          days: formatNumber(Math.max(0, expectation.daysUntil)),
        })}
      </p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {translate(locale, 'filing.expected.basis')}
      </p>
    </div>
  );
}

