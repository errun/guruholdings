import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { localizedPath, translate, type Locale } from '@/lib/i18n/site';
import type { SignalMode } from '@/lib/signals';

export function SignalSearchBox({
  locale,
  initialQuery = '',
  activeMode = 'all',
}: {
  locale: Locale;
  initialQuery?: string;
  activeMode?: SignalMode;
}) {
  return (
    <form action={localizedPath(locale, '/live-13f')} method="get" className="flex w-full min-w-0 gap-2">
      {activeMode !== 'all' && <input type="hidden" name="signal" value={activeMode} />}
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          name="q"
          defaultValue={initialQuery}
          className="h-11 pl-9"
          placeholder={translate(locale, 'search.placeholder')}
        />
      </div>
      <Button type="submit" className="h-11 shrink-0">
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">{translate(locale, 'common.search')}</span>
      </Button>
    </form>
  );
}
