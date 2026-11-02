async (page) => {
  const loads = [];
  const base = 'http://127.0.0.1:3191';
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin === 'https://guruholdings.net') {
      const response = await route.fetch({ url: base + url.pathname + url.search });
      await route.fulfill({ response });
    } else if (url.origin === 'https://www.googletagmanager.com' && url.pathname === '/gtag/js') {
      loads.push('google-tag-fixture');
      await route.fulfill({ status: 200, contentType: 'application/javascript', body: 'window.__googleTagFixtureLoaded = true;' });
    } else await route.abort();
  });
  const response = await page.goto('https://guruholdings.net/');
  await page.waitForFunction(() => window.__googleTagFixtureLoaded === true);
  const first = await page.evaluate(() => {
    const calls = (window.dataLayer || []).map((row) => Array.from(row));
    return { configs: calls.filter((row) => row[0] === 'config').length,
      js: calls.filter((row) => row[0] === 'js').length,
      signals: calls.filter((row) => row[0] === 'event' && row[1] === 'signal_view').length };
  });
  if (response.status() !== 200 || first.configs !== 1 || first.js !== 1) throw new Error('bootstrap must initialize once');
  await page.getByRole('link', { name: '13F Signals', exact: true }).click();
  await page.getByRole('heading', { level: 1, name: 'Institutional consensus moves this quarter', exact: true }).waitFor();
  const after = await page.evaluate(() => ({
    configs: (window.dataLayer || []).filter((row) => row[0] === 'config').length,
    signals: (window.dataLayer || []).filter((row) => row[0] === 'event' && row[1] === 'signal_view').length,
  }));
  if (after.configs !== 1 || loads.length !== 1 || after.signals < 1) throw new Error('navigation must preserve single initialization and working observer');
  return { isolatedProductionHostFixture: true, httpStatus: response.status(),
    initializations: after.configs, googleTagFixtureLoads: loads.length, observedSignals: after.signals,
    realGoogleNetworkRequests: 0, googleIngestionTested: false };
}
