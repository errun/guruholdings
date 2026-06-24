const corporateSuffixes = new Set([
  'co',
  'company',
  'corp',
  'corporation',
  'inc',
  'incorporated',
  'limited',
  'llc',
  'lp',
  'ltd',
  'plc',
]);

export function cleanSlug(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function companyNameSlug(value) {
  const parts = cleanSlug(value).split('-').filter(Boolean);
  while (parts.length > 1 && corporateSuffixes.has(parts.at(-1))) parts.pop();
  return parts.join('-') || 'company';
}

export function isReadableStockSlug(value) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) return false;
  if (/^\d+$/.test(value)) return false;
  if (/^(?=.*\d)[a-z0-9]{9}$/.test(value)) return false;
  return !['company', 'security', 'stock'].includes(value);
}

function classDescriptor(stock) {
  const option = /:(CALL|PUT)$/.exec(stock.companyId);
  if (option) return `${option[1].toLowerCase()}-option`;

  const title = (stock.rawHoldings || [])
    .map((holding) => holding.titleOfClass)
    .find(Boolean);
  if (!title) return '';

  return cleanSlug(title)
    .replace(/^com(?:mon)?(?:-stock)?$/, '')
    .replace(/^cl-([a-z0-9]+)$/, 'class-$1')
    .replace(/^com-cl-([a-z0-9]+)$/, 'class-$1')
    .replace(/^com-(?:shs-)?ser-([a-z0-9]+)$/, 'series-$1');
}

export function buildStockSlugRegistry(stocks, existing = {}, overrides = {}) {
  const baseGroups = new Map();
  for (const stock of stocks) {
    const base = companyNameSlug(stock.canonicalName || stock.issuerNames?.[0] || stock.companyId);
    const group = baseGroups.get(base) || [];
    group.push(stock);
    baseGroups.set(base, group);
  }

  const registry = { ...existing };
  const occupied = new Map();
  for (const [companyId, slug] of Object.entries(registry)) {
    if (!isReadableStockSlug(slug)) throw new Error(`Invalid existing slug ${companyId}: ${slug}`);
    const owner = occupied.get(slug);
    if (owner && owner !== companyId) throw new Error(`Duplicate existing slug ${slug}: ${owner}, ${companyId}`);
    occupied.set(slug, companyId);
  }

  for (const stock of [...stocks].sort((a, b) => a.companyId.localeCompare(b.companyId))) {
    if (registry[stock.companyId]) continue;

    const base = companyNameSlug(stock.canonicalName || stock.issuerNames?.[0] || stock.companyId);
    const group = baseGroups.get(base) || [];
    const descriptor = group.length > 1 ? classDescriptor(stock) : '';
    const candidate = overrides[stock.companyId] || [base, descriptor].filter(Boolean).join('-');

    if (!isReadableStockSlug(candidate)) {
      throw new Error(`Unreadable generated slug ${stock.companyId}: ${candidate}`);
    }

    const owner = occupied.get(candidate);
    if (owner) {
      throw new Error(`Unresolved slug collision ${candidate}: ${owner}, ${stock.companyId}. Add an explicit override.`);
    }

    registry[stock.companyId] = candidate;
    occupied.set(candidate, stock.companyId);
  }

  return Object.fromEntries(Object.entries(registry).sort(([left], [right]) => left.localeCompare(right)));
}

export function buildStockRouteAliases(stocks, registry) {
  const aliases = new Map();
  const owners = new Map();
  const isOptionCompanyId = (companyId) => /:(?:CALL|PUT)$/.test(companyId);

  const setAlias = (alias, companyId) => {
    const slug = registry[companyId];
    if (!slug || alias === slug) return;
    const existingOwner = owners.get(alias);
    if (!existingOwner || (isOptionCompanyId(existingOwner) && !isOptionCompanyId(companyId))) {
      owners.set(alias, companyId);
      aliases.set(alias, slug);
    }
  };

  for (const stock of [...stocks].sort((a, b) => a.companyId.localeCompare(b.companyId))) {
    setAlias(stock.companyId, stock.companyId);
    for (const cusip of stock.rawCusips || []) setAlias(cusip, stock.companyId);
  }

  return Object.fromEntries([...aliases].sort(([left], [right]) => left.localeCompare(right)));
}
