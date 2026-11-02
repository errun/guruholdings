async (page) => {
  const events = [];
  const errors = [];
  const checks = [];
  let googleRequests = 0;
  const base = 'http://127.0.0.1:3191';
  const check = (value, name) => { if (!value) throw new Error(name); checks.push(name); };
  const count = (name) => events.filter((event) => event.name === name).length;
  const until = async (condition, name) => {
    for (let i = 0; i < 50; i++) {
      if (condition()) return;
      await page.waitForTimeout(100);
    }
    throw new Error('Timed out: ' + name);
  };
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route(/https:\/\/([^/]+\.)?(google-analytics\.com|googletagmanager\.com)\//, async (route) => {
    googleRequests++;
    await route.abort();
  });
  await page.exposeFunction('__captureResearch', (event) => events.push(event));
  await page.addInitScript(() => {
    window.gtag = (command, name, params) => {
      if (command === 'event') void window.__captureResearch({ name, params });
    };
  });
  let response = await page.goto(base + '/');
  check(response.status() === 200, 'home HTTP 200');
  await until(() => count('signal_view') > 0, 'visible signal');
  check(count('search_results') === 0 && count('compare_start') === 0, 'passive view does not invent searches or comparisons');
  const initialViews = count('signal_view');
  await page.waitForTimeout(800);
  check(count('signal_view') === initialViews, 'visible signal observations are deduplicated');
  await page.locator('a[data-analytics-signal="shared_increase"][data-analytics-entity="alphabet"]').click();
  await page.getByRole('heading', { level: 1, name: 'Alphabet Inc.', exact: true }).waitFor();
  await until(() => count('signal_select') === 1 && count('research_navigation') === 1, 'signal click and research navigation');
  check(events.find((event) => event.name === 'research_navigation').params.page_type === 'home', 'navigation retains source page context');

  const chart = page.locator('[data-analytics-chart="stock_history"] .recharts-wrapper');
  await chart.scrollIntoViewIfNeeded();
  await chart.click({ position: { x: 120, y: 100 } });
  await until(() => count('chart_interact') === 1, 'chart interaction');
  await chart.click({ position: { x: 130, y: 100 } });
  check(count('chart_interact') === 1, 'chart interactions deduplicated per page');
  const details = page.locator('details[data-analytics-history]').first();
  await details.locator('summary').click();
  await until(() => count('history_details_open') === 1, 'history opened');
  await details.locator('summary').click();
  check(count('history_details_open') === 1, 'closing history does not count as opening');

  await page.getByRole('link', { name: 'Berkshire Hathaway', exact: true }).click();
  await page.getByRole('heading', { level: 1, name: 'Berkshire Hathaway', exact: true }).waitFor();
  await page.locator('[data-analytics-section="quarter_table"] select').first().selectOption('2025Q4');
  await until(() => count('history_quarter_change') === 1, 'quarter changed');
  check(events.find((event) => event.name === 'history_quarter_change').params.quarter === '2025Q4', 'quarter and manager page context recorded');

  response = await page.goto(base + '/live-13f');
  check(response.status() === 200, 'signals HTTP 200');
  const search = page.getByTestId('explorer-search-input');
  await search.fill('private@example.invalid');
  await until(() => count('search_no_results') === 1, 'empty search');
  check(count('search_results') === 1, 'one settled search event instead of per-keystroke events');
  await search.fill('NVDA');
  await until(() => count('search_results') === 2, 'matched search');
  check(count('search_no_results') === 1, 'matched result does not count as no-result');
  check(!JSON.stringify(events).includes('private@example.invalid'), 'free-text query excluded from event payloads');

  const compare = page.locator('[data-analytics-section="comparison"]');
  await compare.getByRole('button', { name: 'Berkshire Hathaway', exact: true }).click();
  await until(() => count('compare_start') === 1 && count('compare_results') === 1, 'active comparison');
  await compare.getByRole('button', { name: 'Berkshire Hathaway', exact: true }).click();
  await until(() => count('compare_results') === 2, 'comparison changes');
  check(count('compare_start') === 1, 'comparison start not duplicated');
  const compareLink = compare.locator('a').first();
  await compareLink.click();
  await until(() => count('compare_result_select') === 1, 'comparison result click');

  await page.goto(base + '/live-13f');
  await page.getByTestId('explorer-search-input').fill('NVDA');
  await until(() => count('search_results') === 3, 'second page search');
  await page.locator('a[data-testid="stock-result"][href="/stocks/nvidia"]').click();
  await page.getByRole('heading', { level: 1, name: 'NVIDIA Corp.', exact: true }).waitFor();
  await until(() => count('search_result_select') === 1, 'search result selection');
  check(events.filter((event) => event.name === 'research_navigation').length === 4, 'exactly one navigation event for each intentional internal click');

  await page.goto(base + '/zh/live-13f/himalaya');
  await page.locator('[data-analytics-section="quarter_table"] select').first().selectOption('2025Q4');
  await until(() => count('history_quarter_change') === 2, 'localized quarter change');
  check(events.filter((event) => event.name === 'history_quarter_change').at(-1).params.page_locale === 'zh', 'localized page context');
  check(googleRequests === 0, 'preview never loads or sends to production Google Analytics');
  check(errors.length === 0, 'no browser runtime exceptions');
  await page.screenshot({ path: 'output/playwright/research-stats-proof.png', fullPage: false });
  return { passed: checks.length, checks, eventCounts: Object.fromEntries([...new Set(events.map((event) => event.name))].map((name) => [name, count(name)])),
    productionGoogleRequests: googleRequests, runtimeErrors: errors.length, screenshot: 'output/playwright/research-stats-proof.png',
    googleIngestionTested: false };
}
