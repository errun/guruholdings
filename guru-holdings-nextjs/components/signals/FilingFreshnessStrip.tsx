import { CalendarClock, FileCheck2 } from 'lucide-react';
import snapshot from '@/data-generated/snapshots/latest.json';
import { formatDateTime, formatQuarter } from '@/lib/sec13f-view';
import { getFreshnessDisplay } from '@/lib/update-cadence';
import { translate, type Locale } from '@/lib/i18n/site';

export function FilingFreshnessStrip({ locale }: { locale: Locale }) {
  const generatedAt = snapshot.generatedAt ? formatDateTime(snapshot.generatedAt, locale) : null;
  const freshness = getFreshnessDisplay(snapshot.latestQuarter, locale);

  return (
    <div className="grid gap-3 rounded-md border border-stone-200 bg-stone-50 p-3 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="flex min-w-0 items-start gap-2">
        <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0">
          <div className="font-medium text-slate-950">
            {translate(locale, 'signal.freshness.nextCheck', { date: freshness.nextCheckDate })}
          </div>
          {generatedAt && (
            <div className="mt-1 text-xs text-muted-foreground">
              {translate(locale, 'signal.freshness.generated', { date: generatedAt })}
            </div>
          )}
          <div className="mt-1 text-xs text-muted-foreground">
            {translate(locale, 'signal.freshness.disclosureWindow', {
              quarter: freshness.nextQuarter,
              date: freshness.filingWindowDate,
            })}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <FileCheck2 className="h-4 w-4 text-emerald-700" />
        <span>{translate(locale, 'home.latestQuarter')}: {formatQuarter(snapshot.latestQuarter, locale)}</span>
      </div>
    </div>
  );
}
