import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { localizedPath, translate, type Locale } from '@/lib/i18n/site';

export function NotFoundState({ locale }: { locale: Locale }) {
  return (
    <div className="container flex min-h-[55vh] items-center justify-center py-16">
      <div className="w-full max-w-lg rounded-lg border border-stone-200 bg-white p-8 text-center">
        <div className="font-mono text-sm font-semibold text-primary">404</div>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">{translate(locale, 'seo.notFound.title')}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{translate(locale, 'common.notFound')}</p>
        <Button asChild className="mt-6">
          <Link href={localizedPath(locale, '/')}>
            <ArrowLeft className="h-4 w-4" />
            {translate(locale, 'common.returnHome')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
