const managerColors = [
  '#0f766e',
  '#b45309',
  '#2563eb',
  '#be123c',
  '#6d28d9',
  '#047857',
  '#475569',
];

export function getManagerColor(managerId: string) {
  const hash = Array.from(managerId).reduce((total, character) => total + character.charCodeAt(0), 0);
  return managerColors[hash % managerColors.length];
}

export function getShortManagerName(name: string) {
  return name
    .replace(/^Berkshire Hathaway$/i, 'Berkshire')
    .replace(/^Himalaya Capital$/i, 'Himalaya')
    .replace(/^Palliser Capital$/i, 'Palliser')
    .replace(/\s+(capital management|asset management|management|associates|holdings|ltd\.?|llc)$/i, '')
    .replace(/^Pershing Square Capital$/i, 'Pershing Square')
    .trim();
}
