'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Language } from '@/lib/types';

export function LanguageSelector() {
  const { language, changeLanguage, t } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={language} onValueChange={(value) => changeLanguage(value as Language)}>
        <SelectTrigger className="w-24 h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{String(t('common.languageNames.en'))}</SelectItem>
          <SelectItem value="zh">{String(t('common.languageNames.zh'))}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

