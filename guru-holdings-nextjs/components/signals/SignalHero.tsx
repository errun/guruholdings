import { Badge } from '@/components/ui/badge';
import { FilingFreshnessStrip } from '@/components/signals/FilingFreshnessStrip';
import { SignalCard } from '@/components/signals/SignalCard';
import snapshot from '@/data-generated/snapshots/latest.json';
import { getViewFormatters } from '@/lib/sec13f-view';
import { translate, type Locale } from '@/lib/i18n/site';
import type { SignalItem } from '@/lib/signals';

export function SignalHero({
  locale,
  signals,
}: {
  locale: Locale;
  signals: SignalItem[];
}) {
  const { formatNumber, formatQuarter } = getViewFormatters(locale);
  const topSignals = signals.slice(0, 3);

  return (
    <section className="border-b border-stone-200 bg-white">
      <div className="container py-7 lg:py-9">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(320px,430px)] lg:items-start">
          <div className="min-w-0">
            <Badge variant="info" className="mb-3 rounded-sm">
              {translate(locale, 'signal.hero.badge')}
            </Badge>
            <h1 className="max-w-4xl break-words text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              {translate(locale, 'home.hero.title')}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
              {translate(locale, 'signal.hero.subtitle')}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <HeroStat label={translate(locale, 'home.latestQuarter')} value={formatQuarter(snapshot.latestQuarter)} />
              <HeroStat label={translate(locale, 'common.managers')} value={formatNumber(snapshot.managers.length)} />
            </div>
            <div className="mt-4">
              <FilingFreshnessStrip locale={locale} />
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-950">{translate(locale, 'signal.latest.title')}</h2>
              <Badge variant="outline" className="rounded-sm border-stone-300 bg-white font-mono">
                {formatNumber(topSignals.length)}
              </Badge>
            </div>
            <div className="grid gap-3">
              {topSignals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} locale={locale} compact />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-[72px] rounded-md border border-stone-200 bg-stone-50 p-3">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-2 font-mono text-lg font-semibold text-slate-950">{value}</div>
    </div>
  );
}
