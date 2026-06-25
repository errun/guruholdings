import Link from 'next/link';
import { cn } from '@/lib/utils';
import { localizedPath, translate, type Locale } from '@/lib/i18n/site';
import { signalModes, type SignalCounts, type SignalMode } from '@/lib/signals';

function modeLabel(locale: Locale, mode: SignalMode) {
  if (mode === 'all') return translate(locale, 'common.all');
  return translate(locale, `change.${mode}`);
}

export function SignalModeTabs({
  locale,
  activeMode,
  counts,
  basePath = '/live-13f',
}: {
  locale: Locale;
  activeMode: SignalMode;
  counts: SignalCounts;
  basePath?: string;
}) {
  return (
    <div className="max-w-full" role="tablist" aria-label={translate(locale, 'common.change')}>
      <div className="flex flex-wrap gap-1 rounded-md border border-stone-200 bg-white p-1">
        {signalModes.map((mode) => {
          const href = mode === 'all' ? `${basePath}#latest-signals` : `${basePath}?signal=${mode}#latest-signals`;
          const active = mode === activeMode;
          return (
            <Link
              key={mode}
              href={localizedPath(locale, href)}
              role="tab"
              aria-selected={active}
              className={cn(
                'inline-flex min-h-9 flex-1 basis-[calc(50%-0.25rem)] items-center justify-center gap-2 rounded-sm px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-stone-100 hover:text-slate-950 sm:flex-none sm:basis-auto',
                active && 'bg-slate-950 text-white hover:bg-slate-900 hover:text-white',
              )}
            >
              <span>{modeLabel(locale, mode)}</span>
              <span className={cn(
                'rounded-sm px-1.5 py-0.5 font-mono text-[11px]',
                active ? 'bg-white/15 text-white' : 'bg-stone-100 text-slate-700',
              )}>
                {counts[mode]}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
