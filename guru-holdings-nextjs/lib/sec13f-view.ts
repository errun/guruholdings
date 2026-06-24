import { intlLocales, translate, type Locale, type MessageKey } from '@/lib/i18n/site';

const themeMessageKeys: Record<string, MessageKey> = {
  technology: 'theme.technology',
  financials: 'theme.financials',
  consumer: 'theme.consumer',
  'china-assets': 'theme.china-assets',
  energy: 'theme.energy',
  healthcare: 'theme.healthcare',
  unclassified: 'theme.unclassified',
};

export const formatCurrency = (value: number, compact = true, locale: Locale = 'en') =>
  new Intl.NumberFormat(intlLocales[locale], {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    minimumFractionDigits: compact ? 1 : 0,
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value || 0);

export const formatSignedCurrency = (value: number, compact = true, locale: Locale = 'en') => {
  const formatted = formatCurrency(Math.abs(value || 0), compact, locale);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
};

export const formatNumber = (value: number, locale: Locale = 'en') =>
  new Intl.NumberFormat(intlLocales[locale], {
    maximumFractionDigits: 0,
  }).format(value || 0);

export const formatSignedNumber = (value: number, locale: Locale = 'en') => {
  const formatted = formatNumber(Math.abs(value || 0), locale);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
};

export const formatPercent = (
  value: number | null | undefined,
  digits = 2,
  locale: Locale = 'en',
) => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'n/a';
  const formatted = new Intl.NumberFormat(intlLocales[locale], {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Math.abs(value));
  return `${value >= 0 ? '+' : '-'}${formatted}%`;
};

export const formatWeight = (
  value: number | null | undefined,
  digits = 2,
  locale: Locale = 'en',
) => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'n/a';
  return `${new Intl.NumberFormat(intlLocales[locale], {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)}%`;
};

export const formatPercentagePoints = (
  value: number | null | undefined,
  digits = 2,
  locale: Locale = 'en',
) => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'n/a';
  const formatted = new Intl.NumberFormat(intlLocales[locale], {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: 'always',
  }).format(value);
  const suffix = locale === 'zh' ? ' 个百分点' : locale === 'ja' ? 'ポイント' : locale === 'ko' ? '%p' : ' pp';
  return `${formatted}${suffix}`;
};

export const formatDate = (value: string | null | undefined, locale: Locale = 'en') => {
  if (!value) return 'n/a';
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(intlLocales[locale], {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(date);
};

export const formatDateTime = (value: string, locale: Locale = 'en') => {
  if (!value) return 'n/a';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${new Intl.DateTimeFormat(intlLocales[locale], {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(date)} UTC`;
};

export const formatQuarter = (value: string, locale: Locale = 'en') => {
  const match = /^(\d{4})Q([1-4])$/.exec(value);
  if (!match) return value;
  const [, year, quarter] = match;
  if (locale === 'zh') return `${year} 年第 ${quarter} 季度`;
  if (locale === 'ja') return `${year}年第${quarter}四半期`;
  if (locale === 'ko') return `${year}년 ${quarter}분기`;
  return `Q${quarter} ${year}`;
};

export const changeBadgeVariant = (changeType?: string) => {
  if (changeType === 'new' || changeType === 'increase') return 'success' as const;
  if (changeType === 'exit' || changeType === 'decrease') return 'destructive' as const;
  return 'secondary' as const;
};

export const directionTextClass = (value: number) => {
  if (value > 0) return 'text-emerald-700';
  if (value < 0) return 'text-red-700';
  return 'text-slate-600';
};

export const changeTypeClass = (changeType?: string) => {
  if (changeType === 'new' || changeType === 'increase') return 'text-emerald-700';
  if (changeType === 'exit' || changeType === 'decrease') return 'text-red-700';
  return 'text-slate-600';
};

export const themeName = (theme: string, locale: Locale = 'en') => {
  const key = themeMessageKeys[theme];
  return key ? translate(locale, key) : theme;
};

export const changeName = (changeType: string, locale: Locale = 'en') => {
  const supported = ['new', 'exit', 'increase', 'decrease', 'unchanged'] as const;
  return supported.includes(changeType as (typeof supported)[number])
    ? translate(locale, `change.${changeType}` as `change.${(typeof supported)[number]}`)
    : changeType;
};

export const concentrationName = (value: string, locale: Locale = 'en') => {
  const supported = ['focused', 'balanced', 'diversified', 'unknown'] as const;
  return supported.includes(value as (typeof supported)[number])
    ? translate(locale, `concentration.${value}` as `concentration.${(typeof supported)[number]}`)
    : value;
};

export function getViewFormatters(locale: Locale) {
  return {
    changeName: (value: string) => changeName(value, locale),
    concentrationName: (value: string) => concentrationName(value, locale),
    formatCurrency: (value: number, compact = true) => formatCurrency(value, compact, locale),
    formatDate: (value: string | null | undefined) => formatDate(value, locale),
    formatDateTime: (value: string) => formatDateTime(value, locale),
    formatNumber: (value: number) => formatNumber(value, locale),
    formatPercent: (value: number | null | undefined, digits = 2) => formatPercent(value, digits, locale),
    formatPercentagePoints: (value: number | null | undefined, digits = 2) => formatPercentagePoints(value, digits, locale),
    formatQuarter: (value: string) => formatQuarter(value, locale),
    formatSignedCurrency: (value: number, compact = true) => formatSignedCurrency(value, compact, locale),
    formatSignedNumber: (value: number) => formatSignedNumber(value, locale),
    formatWeight: (value: number | null | undefined, digits = 2) => formatWeight(value, digits, locale),
    themeName: (value: string) => themeName(value, locale),
  };
}
