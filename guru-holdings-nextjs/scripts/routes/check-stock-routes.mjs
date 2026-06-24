import fs from 'node:fs';
import path from 'node:path';
import { buildStockRouteAliases, buildStockSlugRegistry, isReadableStockSlug } from './stock-slug-utils.mjs';

const root = process.cwd();
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const snapshot = readJson('data-generated/snapshots/latest.json');
const registry = readJson('data-source/stock-slugs.json');
const routeAliases = readJson('data-source/stock-route-aliases.json');
const overrides = readJson('data-source/stock-slug-overrides.json');
const errors = [];
const readSource = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const stockIds = new Set(snapshot.stocks.map((stock) => stock.companyId));
const slugs = Object.values(registry);
const uniqueSlugs = new Set(slugs);

for (const stock of snapshot.stocks) {
  const slug = registry[stock.companyId];
  if (!slug) errors.push(`Missing slug for ${stock.companyId} (${stock.canonicalName})`);
  else if (!isReadableStockSlug(slug)) errors.push(`Unreadable slug for ${stock.companyId}: ${slug}`);
}

if (uniqueSlugs.size !== slugs.length) errors.push('Stock slug registry contains duplicate slugs.');
if (registry.alphabet !== 'alphabet') errors.push('Alphabet canonical slug must remain alphabet.');
if (registry.microsoft !== 'microsoft') errors.push('Microsoft canonical slug must remain microsoft.');
if (registry['191216100'] !== 'coca-cola') errors.push('Coca-Cola canonical slug must be coca-cola.');
if (registry['037833100'] !== 'apple') errors.push('Apple canonical slug must be apple.');

const rebuilt = buildStockSlugRegistry(snapshot.stocks, registry, overrides);
if (JSON.stringify(rebuilt) !== JSON.stringify(registry)) errors.push('Registry is not stable after a no-change sync.');
const rebuiltAliases = buildStockRouteAliases(snapshot.stocks, registry);
if (JSON.stringify(rebuiltAliases) !== JSON.stringify(routeAliases)) errors.push('Legacy redirect registry is incomplete or unstable.');

const legacyAliases = new Map(snapshot.stocks.map((stock) => [stock.companyId, stock.companyId]));
const isOptionCompanyId = (companyId) => /:(?:CALL|PUT)$/.test(companyId);
for (const stock of snapshot.stocks) {
  for (const cusip of stock.rawCusips || []) {
    const existing = legacyAliases.get(cusip);
    const optionVsOrdinary = existing && isOptionCompanyId(existing) !== isOptionCompanyId(stock.companyId);
    if (existing && existing !== stock.companyId && !stockIds.has(cusip) && !optionVsOrdinary) {
      errors.push(`Legacy alias collision: ${cusip} maps to ${existing} and ${stock.companyId}`);
    }
    if (!existing || (isOptionCompanyId(existing) && !isOptionCompanyId(stock.companyId))) {
      legacyAliases.set(cusip, stock.companyId);
    }
  }
}

for (const [alias, companyId] of legacyAliases) {
  if (!stockIds.has(companyId) || !registry[companyId]) errors.push(`Legacy alias cannot resolve: ${alias}`);
}

const routeContracts = [
  ['app/(default)/stocks/[companyId]/page.tsx', ['resolveStockRoute', 'permanentRedirect', 'withSearchParams', 'getStockMetadata']],
  ['app/[locale]/stocks/[companyId]/page.tsx', ['resolveStockRoute', 'permanentRedirect', 'withSearchParams', 'localizedPath', 'getStockMetadata']],
  ['app/sitemap.ts', ['stockPath(stock.companyId)', 'languageAlternates(path)']],
  ['lib/i18n/metadata.ts', ['canonical:', 'languages: languageAlternates', "'x-default'"]],
  ['components/layout/LanguageSelector.tsx', ['window.location.search', 'window.location.hash', 'localizedPath(nextLocale']],
  ['middleware.ts', ['stock-route-aliases.json', 'NextResponse.redirect(destination, 308)', 'request.nextUrl.clone()']],
];

for (const [relativePath, markers] of routeContracts) {
  const source = readSource(relativePath);
  for (const marker of markers) {
    if (!source.includes(marker)) errors.push(`${relativePath}: route contract marker missing: ${marker}`);
  }
}

if (errors.length) {
  console.error(`Route check failed with ${errors.length} issue(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Route check passed: ${stockIds.size} current stocks, ${slugs.length} stable slugs, ${Object.keys(routeAliases).length} middleware redirects.`);
