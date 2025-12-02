'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { translations } from './translations';
import { Language, LocalizedText } from '@/lib/types';

type TranslationValue = string | string[] | Record<string, unknown>;

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => TranslationValue;
  localizeText: (value: LocalizedText | string | undefined) => string;
  formatQuarterLabel: (quarter: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  changeLanguage: () => {},
  t: (key) => key,
  localizeText: (value) => (typeof value === 'string' ? value : value?.en ?? ''),
  formatQuarterLabel: (quarter) => quarter,
});

const getTranslationValue = (language: Language, key: string): TranslationValue | undefined => {
  const segments = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = translations[language];

  for (const segment of segments) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[segment];
  }

  return current;
};

const formatQuarter = (quarter: string, language: Language): string => {
  if (!quarter) return '';
  const match = /^(\d{4})Q([1-4])$/.exec(quarter);
  if (!match) return quarter;
  const [, year, quarterNumber] = match;
  return language === 'zh' ? `${year}年Q${quarterNumber}` : `Q${quarterNumber} ${year}`;
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('app-language');
      if (stored === 'zh') {
        setLanguage('zh');
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('app-language', language);
    } catch {
      // Ignore localStorage errors
    }
  }, [language, mounted]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const htmlLang = language === 'zh' ? 'zh-CN' : 'en';
      document.documentElement.setAttribute('lang', htmlLang);
    }
  }, [language]);

  const changeLanguage = useCallback((nextLanguage: Language) => {
    setLanguage(nextLanguage === 'zh' ? 'zh' : 'en');
  }, []);

  const localizeText = useCallback((value: LocalizedText | string | undefined): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value[language] ?? value.en ?? '';
  }, [language]);

  const t = useCallback((key: string, replacements: Record<string, string | number> = {}): TranslationValue => {
    const directValue = getTranslationValue(language, key);
    const fallbackValue = directValue === undefined && language !== 'en'
      ? getTranslationValue('en', key)
      : directValue;

    if (fallbackValue === undefined) {
      return key;
    }

    if (typeof fallbackValue === 'string') {
      return fallbackValue.replace(/{{(.*?)}}/g, (_, token) => {
        const trimmedToken = token.trim();
        return Object.prototype.hasOwnProperty.call(replacements, trimmedToken)
          ? String(replacements[trimmedToken])
          : `{{${trimmedToken}}}`;
      });
    }

    return fallbackValue;
  }, [language]);

  const formatQuarterLabel = useCallback((quarter: string) => formatQuarter(quarter, language), [language]);

  const value = useMemo(() => ({
    language,
    changeLanguage,
    t,
    localizeText,
    formatQuarterLabel,
  }), [language, changeLanguage, t, localizeText, formatQuarterLabel]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

