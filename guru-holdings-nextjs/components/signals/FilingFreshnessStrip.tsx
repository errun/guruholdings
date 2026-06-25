import { CalendarClock, FileCheck2 } from 'lucide-react';
import snapshot from '@/data-generated/snapshots/latest.json';
import { getNextExpectedFiling } from '@/lib/filing-calendar';
import { formatDate, formatDateTime, formatQuarter } from '@/lib/sec13f-view';
import { translate, type Locale } from '@/lib/i18n/site';

export function FilingFreshnessStrip({ locale }: { locale: Locale }) {
  const next = getNextExpectedFiling(snapshot);
  const generatedAt = snapshot.generatedAt ? formatDateTime(snapshot.generatedAt, locale) : null;

  return (
    <div className="grid gap-3 rounded-md border border-stone-200 bg-stone-50 p-3 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="flex min-w-0 items-start gap-2">
        <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0">
          <div className="font-medium text-slate-950">
            {next
              ? next.isWindowOpen
                ? translate(locale, 'signal.freshness.nextOpen', {
                  manager: next.managerName,
                  quarter: formatQuarter(next.expectedQuarter, locale),
                })
                : translate(locale, 'signal.freshness.nextDays', {
                  manager: next.managerName,
                  quarter: formatQuarter(next.expectedQuarter, locale),
                  date: formatDate(next.expectedDate.toISOString(), locale),
                  days: next.daysUntil,
                })
              : translate(locale, 'signal.freshness.generated', { date: generatedAt || 'n/a' })}
          </div>
          {generatedAt && (
            <div className="mt-1 text-xs text-muted-foreground">
              {translate(locale, 'signal.freshness.generated', { date: generatedAt })}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <FileCheck2 className="h-4 w-4 text-emerald-700" />
        <span>{translate(locale, 'home.latestQuarter')}: {formatQuarter(snapshot.latestQuarter, locale)}</span>
      </div>
    </div>
  );
}
