export const formatNumber = (num: number | string): string => {
  if (typeof num !== 'number') {
    const parsed = Number(num);
    if (Number.isNaN(parsed)) {
      return '0';
    }
    num = parsed;
  }

  if (Math.abs(num) >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  }
  if (Math.abs(num) >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  }
  if (Math.abs(num) >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatPercent = (num: number | null | undefined): string => {
  if (num === null || num === undefined || Number.isNaN(Number(num))) {
    return 'N/A';
  }
  const value = Number(num);
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
};

export const getChangeColor = (changeType: string | undefined): string => {
  switch (changeType) {
    case 'increase':
      return 'text-green-600 bg-green-50';
    case 'decrease':
      return 'text-red-600 bg-red-50';
    case 'new':
      return 'text-blue-600 bg-blue-50';
    case 'exit':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

