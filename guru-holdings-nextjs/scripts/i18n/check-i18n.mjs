import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const sourcePath = path.join(root, 'lib', 'i18n', 'site.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
  fileName: sourcePath,
}).outputText;

const localModule = { exports: {} };
new Function('exports', 'module', compiled)(localModule.exports, localModule);
const { locales, messages } = localModule.exports;

const errors = [];
const baseKeys = Object.keys(messages.en).sort();
const placeholderPattern = /{{\s*([\w]+)\s*}}/g;
const identicalWhitelist = new Set(['brand.name']);
const mojibakePattern = /\uFFFD|Ã.|Â.|â(?:€|™|€œ|€\u009d)|涓|鎸|鍙|鏁版嵁/;

const placeholders = (value) => [...value.matchAll(placeholderPattern)].map((match) => match[1]).sort();

for (const locale of locales) {
  const dictionary = messages[locale];
  const keys = Object.keys(dictionary).sort();

  if (JSON.stringify(keys) !== JSON.stringify(baseKeys)) {
    errors.push(`${locale}: translation keys do not match English`);
  }

  for (const key of baseKeys) {
    const value = dictionary[key];
    if (typeof value !== 'string' || !value.trim()) {
      errors.push(`${locale}:${key}: empty translation`);
      continue;
    }
    if (mojibakePattern.test(value)) {
      errors.push(`${locale}:${key}: possible mojibake`);
    }
    if (JSON.stringify(placeholders(value)) !== JSON.stringify(placeholders(messages.en[key]))) {
      errors.push(`${locale}:${key}: placeholders differ from English`);
    }
    if (locale !== 'en' && value === messages.en[key] && !identicalWhitelist.has(key)) {
      errors.push(`${locale}:${key}: untranslated English value`);
    }
  }
}

const requiredTerms = {
  zh: { 'change.new': '新增', 'change.increase': '增持', 'change.decrease': '减持', 'change.exit': '清仓' },
  ja: { 'change.new': '新規取得', 'change.increase': '買い増し', 'change.decrease': '保有縮小', 'change.exit': '全売却' },
  ko: { 'change.new': '신규 매수', 'change.increase': '비중 확대', 'change.decrease': '비중 축소', 'change.exit': '전량 매도' },
};

for (const [locale, terms] of Object.entries(requiredTerms)) {
  for (const [key, expected] of Object.entries(terms)) {
    if (messages[locale][key] !== expected) {
      errors.push(`${locale}:${key}: expected glossary term "${expected}"`);
    }
  }
}

const uiRoots = [
  path.join(root, 'components', 'site-pages'),
  path.join(root, 'components', 'explorer'),
  path.join(root, 'components', 'layout'),
  path.join(root, 'app', '[locale]'),
];

const collectFiles = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const fullPath = path.join(directory, entry.name);
  if (entry.isDirectory()) return collectFiles(fullPath);
  return /\.(?:ts|tsx)$/.test(entry.name) ? [fullPath] : [];
});

for (const filePath of uiRoots.flatMap(collectFiles)) {
  const contents = fs.readFileSync(filePath, 'utf8');
  if (mojibakePattern.test(contents)) {
    errors.push(`${path.relative(root, filePath)}: possible mojibake in UI source`);
  }
  if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(contents)) {
    errors.push(`${path.relative(root, filePath)}: hard-coded CJK text outside dictionaries`);
  }
}

if (errors.length > 0) {
  console.error(`i18n check failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`i18n check passed: ${baseKeys.length} keys across ${locales.length} locales.`);
