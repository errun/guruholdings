'use client';

import { useLanguage } from '@/lib/i18n';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-background">
      <div className="container py-8">
        <div className="text-center text-sm text-muted-foreground">
          <p className="mb-2">{String(t('common.footer.dataSource'))}</p>
          <p>{String(t('common.footer.disclaimer'))}</p>
        </div>
      </div>
    </footer>
  );
}

