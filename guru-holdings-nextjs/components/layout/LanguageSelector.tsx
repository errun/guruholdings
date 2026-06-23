'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
      <DropdownMenuPrimitive.Root modal={false}>
        <DropdownMenuPrimitive.Trigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-[104px] justify-between px-3 font-normal"
            aria-label={translate(locale, 'language.label')}
          >
            <span className="min-w-0 overflow-hidden text-ellipsis">{languageNames[locale]}</span>
            <ChevronDown className="h-4 w-4 opacity-50" aria-hidden="true" />
          </Button>
        </DropdownMenuPrimitive.Trigger>
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            align="end"
            sideOffset={4}
            className="z-[60] min-w-[128px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          >
            <DropdownMenuPrimitive.RadioGroup
              value={locale}
              onValueChange={(value) => changeLanguage(value as Locale)}
            >
              {locales.map((item) => (
                <DropdownMenuPrimitive.RadioItem
                  key={item}
                  value={item}
                  className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                >
                  <DropdownMenuPrimitive.ItemIndicator className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Check className="h-4 w-4" />
                  </DropdownMenuPrimitive.ItemIndicator>
                  {languageNames[item]}
                </DropdownMenuPrimitive.RadioItem>
              ))}
            </DropdownMenuPrimitive.RadioGroup>
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    </div>
  );
}
