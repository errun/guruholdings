import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import process from 'node:process';
import { load } from 'cheerio';

const root = process.cwd();
const siteUrl = 'https://guruholdings.net';
const snapshot = JSON.parse(fs.readFileSync(path.join(root, 'data-generated', 'snapshots', 'latest.json'), 'utf8'));
const locales = {
  en: { prefix: '', lang: 'en', marker: "Track Top Institutions' Latest Portfolio Moves" },
  zh: { prefix: '/zh', lang: 'zh-CN', marker: '看清顶级机构最新变仓' },
  ja: { prefix: '/ja', lang: 'ja', marker: 'トップ機関投資家の最新ポートフォリオ変化を追跡' },
  ko: { prefix: '/ko', lang: 'ko', marker: '주요 기관의 최신 포트폴리오 변화를 추적하세요' },
};
const hreflang = { en: 'en', zh: 'zh-Hans', ja: 'ja', ko: 'ko' };
const representativePaths = [
  '/',
  '/live-13f',
  '/live-13f/berkshire',
  '/live-13f/himalaya',
  '/stocks/alphabet',
  '/stocks/microsoft',
  '/stocks/nvidia',
  '/stocks/coca-cola',
];
const errors = [];
const titlesByLocale = new Map();
let child;

const localize = (locale, pathname) => {
  const normalized = pathname === '/' ? '' : pathname;
  return `${locales[locale].prefix}${normalized}` || '/';
};
const canonical = (locale, pathname) => {
  const localized = localize(locale, pathname);
  return localized === '/' ? siteUrl : `${siteUrl}${localized}`;
};

const getFreePort = () => new Promise((resolve, reject) => {
  const server = net.createServer();
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    server.close(() => resolve(address.port));
  });
});

const waitForServer = async (baseUrl) => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(baseUrl, { redirect: 'manual' });
      if (response.status > 0) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${baseUrl}`);
};

const externalBaseUrl = process.env.SEO_BASE_URL;
let baseUrl = externalBaseUrl;

if (!baseUrl) {
  if (!fs.existsSync(path.join(root, '.next', 'BUILD_ID'))) {
    throw new Error('Production build not found. Run npm run build before npm run seo:check.');
  }
  const port = await getFreePort();
  baseUrl = `http://127.0.0.1:${port}`;
  const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
  child = spawn(process.execPath, [nextBin, 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: root,
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await waitForServer(baseUrl);
}

const getHtml = async (pathname, expectedStatus = 200) => {
  const response = await fetch(`${baseUrl}${pathname}`, { redirect: 'manual' });
  const html = await response.text();
  if (response.status !== expectedStatus) {
    errors.push(`${pathname}: expected ${expectedStatus}, received ${response.status}`);
  }
  return { response, html, $: load(html) };
};

try {
  for (const [locale, config] of Object.entries(locales)) {
    const localeTitles = new Set();
    titlesByLocale.set(locale, localeTitles);

    for (const pathname of representativePaths) {
      const localized = localize(locale, pathname);
      const { html, $ } = await getHtml(localized);
      const title = $('title').first().text().trim();
      const description = $('meta[name="description"]').attr('content')?.trim();
      const canonicalHref = $('link[rel="canonical"]').attr('href');
      const robots = $('meta[name="robots"]').attr('content') || '';

      if ($('html').attr('lang') !== config.lang) errors.push(`${localized}: incorrect html lang`);
      if (!title) errors.push(`${localized}: missing title`);
      if (!description) errors.push(`${localized}: missing meta description`);
      if (localeTitles.has(title)) errors.push(`${localized}: duplicate title within ${locale}`);
      localeTitles.add(title);
      if (canonicalHref !== canonical(locale, pathname)) errors.push(`${localized}: incorrect canonical ${canonicalHref}`);
      if (/noindex/i.test(robots)) errors.push(`${localized}: canonical page is noindex`);
      if (/{{\s*\w+\s*}}/.test(html)) errors.push(`${localized}: unresolved translation placeholder`);
      if (/\uFFFD|Ã.|Â.|â(?:€|™|€œ|€\u009d)|涓|鎸|鍙|鏁版嵁/.test(html)) errors.push(`${localized}: possible mojibake`);
      if (pathname === '/' && !$('body').text().includes(config.marker)) errors.push(`${localized}: localized home marker missing from initial HTML`);

      for (const targetLocale of Object.keys(locales)) {
        const expected = canonical(targetLocale, pathname);
        const actual = $(`link[rel="alternate"][hreflang="${hreflang[targetLocale]}"]`).attr('href');
        if (actual !== expected) errors.push(`${localized}: incorrect ${hreflang[targetLocale]} alternate`);
      }
      const xDefault = $('link[rel="alternate"][hreflang="x-default"]').attr('href');
      if (xDefault !== canonical('en', pathname)) errors.push(`${localized}: incorrect x-default alternate`);
      if (!$('meta[property="og:title"]').attr('content')) errors.push(`${localized}: missing Open Graph title`);
      if (!$('meta[property="og:description"]').attr('content')) errors.push(`${localized}: missing Open Graph description`);
      if (!$('meta[name="twitter:title"]').attr('content')) errors.push(`${localized}: missing Twitter title`);
    }
  }

  const internalPage = await getHtml('/data-automation-check');
  const internalRobots = internalPage.$('meta[name="robots"]').attr('content') || '';
  if (!/noindex/i.test(internalRobots) || !/nofollow/i.test(internalRobots)) {
    errors.push('/data-automation-check: expected noindex,nofollow');
  }

  const notFoundPage = await getHtml('/ko/stocks/not-a-real-company', 404);
  if (!/noindex/i.test(notFoundPage.$('meta[name="robots"]').attr('content') || '')) {
    errors.push('404 page: expected noindex');
  }

  const redirectCases = [
    ['/en', '/'],
    ['/en/live-13f/berkshire', '/live-13f/berkshire'],
    ['/holdings/buffett', '/live-13f/berkshire'],
    ['/ja/holdings/li-lu', '/ja/live-13f/himalaya'],
    ['/stocks/191216100', '/stocks/coca-cola'],
    ['/zh/stocks/191216100', '/zh/stocks/coca-cola'],
  ];
  for (const [source, destination] of redirectCases) {
    const response = await fetch(`${baseUrl}${source}`, { redirect: 'manual' });
    if (![307, 308].includes(response.status)) errors.push(`${source}: expected permanent redirect, received ${response.status}`);
    const location = response.headers.get('location');
    const actualPath = location ? new URL(location, baseUrl).pathname : '';
    if (actualPath !== destination) errors.push(`${source}: expected redirect to ${destination}, received ${actualPath}`);
  }

  const robotsResponse = await fetch(`${baseUrl}/robots.txt`);
  const robotsText = await robotsResponse.text();
  if (!robotsText.includes('Disallow: /data-automation-check')) errors.push('robots.txt: internal page is not disallowed');
  if (!robotsText.includes(`${siteUrl}/sitemap.xml`)) errors.push('robots.txt: sitemap URL is missing');

  const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
  const sitemapText = await sitemapResponse.text();
  const sitemap = load(sitemapText, { xmlMode: true });
  const locations = sitemap('url > loc').map((_, element) => sitemap(element).text()).get();
  const expectedCount = (2 + snapshot.managers.length + snapshot.stocks.length) * Object.keys(locales).length;
  if (locations.length !== expectedCount) errors.push(`sitemap.xml: expected ${expectedCount} URLs, received ${locations.length}`);
  if (new Set(locations).size !== locations.length) errors.push('sitemap.xml: duplicate URLs found');
  if (locations.some((url) => !url.startsWith(siteUrl))) errors.push('sitemap.xml: non-canonical domain found');
  if (locations.some((url) => url.includes('data-automation-check') || url.includes('/holdings/'))) errors.push('sitemap.xml: internal or legacy URL found');
  const stockLocations = locations.filter((url) => new URL(url).pathname.includes('/stocks/'));
  const opaqueStockUrl = stockLocations.find((url) => {
    const slug = new URL(url).pathname.split('/').at(-1) || '';
    return /^\d+$/.test(slug) || /^(?=.*\d)[A-Za-z0-9]{9}$/.test(slug);
  });
  if (opaqueStockUrl) errors.push(`sitemap.xml: opaque stock URL found ${opaqueStockUrl}`);
  if (!locations.includes(`${siteUrl}/stocks/coca-cola`)) errors.push('sitemap.xml: readable Coca-Cola URL is missing');
  if (locations.includes(`${siteUrl}/stocks/191216100`)) errors.push('sitemap.xml: legacy Coca-Cola CUSIP URL is present');

  if (errors.length > 0) {
    console.error(`SEO check failed with ${errors.length} issue(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log(`SEO check passed: ${representativePaths.length * Object.keys(locales).length} localized pages and ${locations.length} sitemap URLs validated.`);
  }
} finally {
  if (child) child.kill();
}
