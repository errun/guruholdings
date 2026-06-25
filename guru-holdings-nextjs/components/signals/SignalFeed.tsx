import { SignalCard } from '@/components/signals/SignalCard';
import { translate, type Locale } from '@/lib/i18n/site';
import type { SignalItem } from '@/lib/signals';

export function SignalFeed({
  signals,
  locale,
  limit,
  showHeading = true,
}: {
  signals: SignalItem[];
  locale: Locale;
  limit?: number;
  showHeading?: boolean;
}) {
  const visibleSignals = typeof limit === 'number' ? signals.slice(0, limit) : signals;

  return (
    <section id="latest-signals" className="min-w-0">
      {showHeading && (
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-slate-950">{translate(locale, 'signal.latest.title')}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {translate(locale, 'signal.dashboard.description')}
          </p>
        </div>
      )}
      <div className="grid gap-3 lg:grid-cols-2">
        {visibleSignals.map((signal) => (
          <SignalCard key={signal.id} signal={signal} locale={locale} />
        ))}
      </div>
      {visibleSignals.length === 0 && (
        <div className="rounded-md border border-dashed border-stone-300 bg-white p-5 text-sm text-muted-foreground">
          {translate(locale, 'signal.feed.empty')}
        </div>
      )}
    </section>
  );
}
