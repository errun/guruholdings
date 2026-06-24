const managerColorOverrides: Record<string, string> = {
  berkshire: '#2563eb',
  himalaya: '#16a34a',
  bridgewater: '#f97316',
  pershing: '#7c3aed',
  scion: '#dc2626',
  tiger: '#0891b2',
  palliser: '#a16207',
  ark: '#db2777',
  coatue: '#4f46e5',
  icahn: '#0f766e',
  'third-point': '#b91c1c',
  baupost: '#9333ea',
  greenlight: '#15803d',
  oaktree: '#92400e',
  hhlr: '#0e7490',
  greenwoods: '#65a30d',
};

const managerColors = [
  '#2563eb',
  '#dc2626',
  '#16a34a',
  '#f97316',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#a16207',
  '#4f46e5',
  '#0f766e',
  '#b91c1c',
  '#65a30d',
];

export function getManagerColor(managerId: string) {
  const override = managerColorOverrides[managerId];
  if (override) return override;

  const hash = Array.from(managerId).reduce((total, character, index) => total + character.charCodeAt(0) * (index + 1), 0);
  return managerColors[hash % managerColors.length];
}

export function getShortManagerName(name: string) {
  return name
    .replace(/^Berkshire Hathaway$/i, 'Berkshire')
    .replace(/^Himalaya Capital$/i, 'Himalaya')
    .replace(/^Palliser Capital$/i, 'Palliser')
    .replace(/^Coatue Management$/i, 'Coatue')
    .replace(/^Icahn Capital$/i, 'Icahn')
    .replace(/^Baupost Group$/i, 'Baupost')
    .replace(/^Greenlight Capital$/i, 'Greenlight')
    .replace(/^Oaktree Capital$/i, 'Oaktree')
    .replace(/^Hillhouse \/ HHLR Advisors$/i, 'HHLR')
    .replace(/^Greenwoods \/ Jinglin$/i, 'Greenwoods')
    .replace(/\s+(capital management|asset management|management|associates|holdings|ltd\.?|llc)$/i, '')
    .replace(/^Pershing Square Capital$/i, 'Pershing Square')
    .trim();
}
