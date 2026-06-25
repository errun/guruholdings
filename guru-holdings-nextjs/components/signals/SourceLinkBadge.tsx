import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { translate, type Locale } from '@/lib/i18n/site';

export function SourceLinkBadge({
  href,
  locale,
  className,
}: {
  href: string | null | undefined;
  locale: Locale;
  className?: string;
}) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-2 py-1 text-xs font-medium text-primary hover:bg-stone-50',
        className,
      )}
    >
      {translate(locale, 'common.secRawXml')}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
