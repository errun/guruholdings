export const themeLabels: Record<string, string> = {
  technology: '科技',
  financials: '金融',
  consumer: '消费',
  'china-assets': '中国资产',
  energy: '能源',
  healthcare: '医疗健康',
  unclassified: '未分类',
};

export const changeLabels: Record<string, string> = {
  new: '新增',
  exit: '清仓',
  increase: '增持',
  decrease: '减持',
  unchanged: '持平',
};

export const formatCurrency = (value: number, compact = true) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value);

export const formatSignedCurrency = (value: number, compact = true) => {
  const formatted = formatCurrency(Math.abs(value), compact);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
};

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value);

export const formatSignedNumber = (value: number) => {
  const formatted = formatNumber(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
};

export const formatPercent = (value: number | null | undefined, digits = 2) => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'n/a';
  return `${value >= 0 ? '+' : ''}${value.toFixed(digits)}%`;
};

export const formatDate = (value: string | null | undefined) => {
  if (!value) return 'n/a';
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(`${value}T00:00:00Z`));
};

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

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

export const themeName = (theme: string) => themeLabels[theme] || theme;
export const changeName = (changeType: string) => changeLabels[changeType] || changeType;
