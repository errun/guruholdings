import fs from 'node:fs';
import path from 'node:path';
import { buildStockRouteAliases, buildStockSlugRegistry } from './stock-slug-utils.mjs';

const root = process.cwd();
const snapshotPath = path.join(root, 'data-generated', 'snapshots', 'latest.json');
const registryPath = path.join(root, 'data-source', 'stock-slugs.json');
const aliasesPath = path.join(root, 'data-source', 'stock-route-aliases.json');
const overridesPath = path.join(root, 'data-source', 'stock-slug-overrides.json');

const readJson = (filePath, fallback) => fs.existsSync(filePath)
  ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
  : fallback;

const snapshot = readJson(snapshotPath, null);
if (!snapshot?.stocks) throw new Error('Published stock snapshot is missing.');

const existing = readJson(registryPath, {});
const overrides = readJson(overridesPath, {});
const registry = buildStockSlugRegistry(snapshot.stocks, existing, overrides);
const aliases = buildStockRouteAliases(snapshot.stocks, registry);

fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
fs.writeFileSync(aliasesPath, `${JSON.stringify(aliases, null, 2)}\n`);
console.log(`Stock routes synced: ${Object.keys(registry).length} stable slugs and ${Object.keys(aliases).length} legacy redirects.`);
