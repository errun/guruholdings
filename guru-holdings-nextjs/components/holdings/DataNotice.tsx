'use client';

import { Info } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function DataNotice() {
  const { t } = useLanguage();

  const items = t('holdingsPage.dataNotice.items') as string[];

  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>{String(t('holdingsPage.dataNotice.title'))}</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-1 text-sm">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

