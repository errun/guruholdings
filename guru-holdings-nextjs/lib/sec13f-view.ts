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

export const concentrationLabels: Record<string, string> = {
  focused: '持仓集中',
  balanced: '相对均衡',
  diversified: '较分散',
  unknown: '未分类',
};

export const formatCurrency = (value: number, compact = true) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value || 0);

export const formatSignedCurrency = (value: number, compact = true) => {
  const formatted = formatCurrency(Math.abs(value || 0), compact);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
};

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value || 0);

export const formatSignedNumber = (value: number) => {
  const formatted = formatNumber(Math.abs(value || 0));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
};

export const formatPercent = (value: number | null | undefined, digits = 2) => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'n/a';
  return `${value >= 0 ? '+' : ''}${value.toFixed(digits)}%`;
};

export const formatWeight = (value: number | null | undefined, digits = 2) => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'n/a';
  return `${value.toFixed(digits)}%`;
};

export const formatDate = (value: string | null | undefined) => {
  if (!value) return 'n/a';
  const [year, month, day] = value.slice(0, 10).split('-');
  if (!year || !month || !day) return value;
  return `${year}/${month}/${day}`;
};

export const formatDateTime = (value: string) => {
  if (!value) return 'n/a';
  const normalized = value.replace('T', ' ');
  const [date, time = ''] = normalized.split('.');
  return `${date.slice(0, 16)} UTC`;
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

export const themeName = (theme: string) => themeLabels[theme] || theme;
export const changeName = (changeType: string) => changeLabels[changeType] || changeType;
export const concentrationName = (value: string) => concentrationLabels[value] || value;
