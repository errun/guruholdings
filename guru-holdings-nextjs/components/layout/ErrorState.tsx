'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { translate, type Locale } from '@/lib/i18n/site';

export function ErrorState({ locale, error, reset }: {
  locale: Locale;
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container flex min-h-[55vh] items-center justify-center py-16">
      <div className="w-full max-w-lg rounded-lg border border-stone-200 bg-white p-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-red-700" />
        <h1 className="mt-4 text-2xl font-semibold text-slate-950">{translate(locale, 'common.noData')}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{translate(locale, 'common.notFound')}</p>
        <Button type="button" className="mt-6" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          {translate(locale, 'common.tryAgain')}
        </Button>
      </div>
    </div>
  );
}
