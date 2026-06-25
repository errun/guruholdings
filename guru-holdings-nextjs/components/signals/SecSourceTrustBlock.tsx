import { CheckCircle2, Database } from 'lucide-react';
import snapshot from '@/data-generated/snapshots/latest.json';
import { SourceLinkBadge } from '@/components/signals/SourceLinkBadge';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/sec13f-view';
import { translate, type Locale } from '@/lib/i18n/site';

export function SecSourceTrustBlock({
  locale,
  sourceUrl,
  className,
}: {
  locale: Locale;
  sourceUrl?: string | null;
  className?: string;
}) {
  const filingCount = snapshot.managers.filter((manager) => manager.latestFiling?.sourceUrl).length;
  const primarySource = sourceUrl || snapshot.managers.find((manager) => manager.latestFiling?.sourceUrl)?.latestFiling.sourceUrl || null;

  return (
    <section className={cn('rounded-md border border-primary/20 bg-white p-4', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-700" />
            <h2 className="text-base font-semibold text-slate-950">{translate(locale, 'signal.trust.title')}</h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {translate(locale, 'signal.trust.body')}
          </p>
        </div>
        <SourceLinkBadge href={primarySource} locale={locale} className="shrink-0" />
      </div>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <TrustMetric label={translate(locale, 'live.dataSource')} value="SEC EDGAR" />
        <TrustMetric label={translate(locale, 'signal.trust.filingCount')} value={formatNumber(filingCount, locale)} />
        <TrustMetric label={translate(locale, 'live.latestQuarter')} value={snapshot.latestQuarter} />
      </div>
    </section>
  );
}

function TrustMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-stone-50 px-3 py-2">
      <Database className="h-4 w-4 text-slate-600" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-mono text-sm font-semibold text-slate-950">{value}</div>
      </div>
    </div>
  );
}
