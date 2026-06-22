import { translate, type Locale } from '@/lib/i18n/site';

export function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="border-t border-stone-200 bg-background">
      <div className="container py-8">
        <div className="max-w-3xl text-sm leading-6 text-muted-foreground">
          <p>{translate(locale, 'footer.source')}</p>
          <p className="mt-1">{translate(locale, 'footer.disclaimer')}</p>
        </div>
      </div>
    </footer>
  );
}
