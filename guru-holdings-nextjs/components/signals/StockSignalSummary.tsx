import { Badge } from '@/components/ui/badge';
import { getSignalCounts, type SignalItem } from '@/lib/signals';
import { translate, type Locale } from '@/lib/i18n/site';

const modes = ['new', 'increase', 'decrease', 'exit'] as const;

export function StockSignalSummary({
  signals,
  locale,
}: {
  signals: SignalItem[];
  locale: Locale;
}) {
  const counts = getSignalCounts(signals);

  return (
    <section className="rounded-md border border-stone-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{translate(locale, 'stock.signalSummary.title')}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {translate(locale, 'stock.signalSummary.description')}
          </p>
        </div>
        <Badge variant="outline" className="w-fit rounded-sm border-stone-300 bg-white font-mono">
          {counts.all}
        </Badge>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {modes.map((mode) => (
          <div key={mode} className="rounded-md bg-stone-50 p-3">
            <div className="text-xs text-muted-foreground">{translate(locale, `change.${mode}`)}</div>
            <div className="mt-1 font-mono text-xl font-semibold text-slate-950">{counts[mode]}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
