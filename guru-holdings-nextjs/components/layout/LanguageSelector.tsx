'use client';

import { Globe } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  languageNames,
  localizedPath,
  locales,
  translate,
  type Locale,
} from '@/lib/i18n/site';

export function LanguageSelector({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const changeLanguage = (nextLocale: Locale) => {
    const query = typeof window === 'undefined' ? '' : window.location.search;
    const hash = typeof window === 'undefined' ? '' : window.location.hash;
    const target = localizedPath(nextLocale, `${pathname}${query}${hash}`);
    router.push(target);
  };

  return (
    <div className="flex items-center gap-1.5">
      <Globe className="hidden h-4 w-4 text-muted-foreground sm:block" aria-hidden="true" />
      <Select value={locale} onValueChange={(value) => changeLanguage(value as Locale)}>
        <SelectTrigger className="h-9 w-[104px] text-sm" aria-label={translate(locale, 'language.label')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {locales.map((item) => (
            <SelectItem key={item} value={item}>{languageNames[item]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
