import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { NextRequest } from 'next/server';
import { createHandlers, readConfig, productionDependencies, SCOPES, seal, unseal, periodRanges, realtimeDiagnostic, type Dependencies } from '../../lib/seo/cloud';
import { collectTrafficReports, trafficReportRequests } from '../../lib/seo/traffic-report';
import { acquisitionCount, acquisitionPeriods, acquisitionReportRequests, collectAcquisitionReports } from '../../lib/seo/acquisition-report';

const config = readConfig({ SEO_GOOGLE_CLIENT_ID: 'fixture.apps.googleusercontent.com', SEO_GOOGLE_CLIENT_SECRET: 'fixture-not-real',
  SEO_TOKEN_KEY: randomBytes(32).toString('base64'), SEO_CONNECT_SECRET: 'c'.repeat(40), SEO_JOB_SECRET: 'j'.repeat(40) });
const origin = config.origin;
function fixture() {
  const store = new Map<string, string>();
  const calls: string[] = [];
  const deps: Dependencies = {
    authorizationUrl(state, challenge) { calls.push('url'); return `https://accounts.google.com/o/oauth2/v2/auth?state=${state}&code_challenge=${challenge}`; },
    async exchange() { calls.push('exchange'); return { accessToken: 'fixture-access', refreshToken: 'fixture-refresh', scope: SCOPES.join(' ') }; },
    async verifyAccess() { calls.push('verify'); },
    async read(path) { return store.get(path) || null; },
    async write(path, value) { calls.push('write'); store.set(path, value); },
    async collect() { calls.push('collect'); return { generatedAt: '2026-11-02T10:00:00Z', ga4: [], gsc: [], warnings: [], evidence: [{ source: 'fixture', httpStatus: 200, elapsedMs: 5 }] }; },
  };
  return { store, calls, deps, handlers: createHandlers(config, deps) };
}
function connectRequest(secret = config.connectSecret, from = origin) {
  return new NextRequest(`${origin}/api/seo/google/connect`, { method: 'POST',
    headers: { Origin: from, 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ secret }) });
}
async function pending(f: ReturnType<typeof fixture>) {
  const response = await f.handlers.connect(connectRequest());
  assert.equal(response.status, 303);
  const location = new URL(response.headers.get('location')!);
  const cookie = response.headers.get('set-cookie')!.split(';')[0];
  return { state: location.searchParams.get('state')!, cookie, response };
}
function callback(cookie: string, state: string) {
  return new NextRequest(`${origin}/api/seo/google/callback?code=fixture-code&state=${state}`, { headers: { Cookie: cookie } });
}

test('cloud flow: connect -> callback -> resource check -> encrypted credential -> daily encrypted report', async () => {
  const f = fixture(); const p = await pending(f);
  const response = await f.handlers.callback(callback(p.cookie, p.state));
  assert.equal(response.status, 200);
  assert.deepEqual(f.calls, ['url', 'exchange', 'verify', 'write']);
  const encrypted = f.store.get('seo/google/credentials.enc')!;
  assert.ok(!encrypted.includes('fixture-refresh'));
  assert.equal(unseal<{ refreshToken: string }>(encrypted, config.key, 'google-grant').refreshToken, 'fixture-refresh');
  const daily = await f.handlers.daily(new NextRequest(`${origin}/api/seo/daily`, { method: 'POST', headers: { Authorization: `Bearer ${config.jobSecret}` } }));
  assert.equal(daily.status, 200);
  assert.equal((await daily.json()).evidence[0].httpStatus, 200);
  assert.ok(f.store.has('seo/reports/2026-11-02.enc'));
  assert.ok(!JSON.stringify(await response.text()).includes('fixture-refresh'));
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('forged origin and wrong admin secret never reach OAuth', async () => {
  const f = fixture();
  assert.equal((await f.handlers.connect(connectRequest(config.connectSecret, 'https://attacker.invalid'))).status, 403);
  assert.equal((await f.handlers.connect(connectRequest('incorrect'))).status, 401);
  assert.deepEqual(f.calls, []);
});

test('connect form preserves browser Origin and permits only the Google redirect; callback remains no-referrer', async () => {
  const f = fixture();
  const page = f.handlers.page();
  assert.equal(page.headers.get('referrer-policy'), 'same-origin');
  assert.equal(page.headers.get('content-security-policy'), "default-src 'none'; form-action 'self' https://accounts.google.com; frame-ancestors 'none'; base-uri 'none'");
  assert.equal((await f.handlers.connect(connectRequest(config.connectSecret, 'null'))).status, 403);
  const response = await f.handlers.callback(callback('', 'forged'));
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
});

test('callback rejects mismatched state, tampered cookie and expired request before exchanging code', async () => {
  const f = fixture(); const p = await pending(f);
  assert.equal((await f.handlers.callback(callback(p.cookie, 'forged'))).status, 400);
  assert.equal((await f.handlers.callback(callback(p.cookie + 'broken', p.state))).status, 400);
  const expired = seal({ state: p.state, verifier: 'fixture', created: Date.now() - 601_000 }, config.key, 'oauth-state');
  assert.equal((await f.handlers.callback(callback(`__Host-guru-seo-oauth=${expired}`, p.state))).status, 400);
  assert.deepEqual(f.calls, ['url']);
});

test('readonly scope refusal and inaccessible resources do not replace working credentials', async () => {
  const f = fixture(); f.store.set('seo/google/credentials.enc', 'previous');
  f.deps.exchange = async () => ({ accessToken: 'a', refreshToken: 'r', scope: SCOPES.join(' ') + ' https://www.googleapis.com/auth/webmasters' });
  let p = await pending(f);
  assert.equal((await f.handlers.callback(callback(p.cookie, p.state))).status, 400);
  assert.equal(f.store.get('seo/google/credentials.enc'), 'previous');
  f.deps.exchange = async () => ({ accessToken: 'a', refreshToken: 'r', scope: SCOPES.join(' ') });
  f.deps.verifyAccess = async () => { throw new Error('fixture-private-upstream-error'); };
  p = await pending(f);
  const failed = await f.handlers.callback(callback(p.cookie, p.state));
  assert.equal(failed.status, 502);
  assert.ok(!(await failed.text()).includes('fixture-private'));
  assert.equal(f.store.get('seo/google/credentials.enc'), 'previous');
});

test('missing offline refresh token is rejected', async () => {
  const f = fixture();
  f.deps.exchange = async () => ({ accessToken: 'a', refreshToken: '', scope: SCOPES.join(' ') });
  const p = await pending(f);
  assert.equal((await f.handlers.callback(callback(p.cookie, p.state))).status, 400);
  assert.equal(f.store.size, 0);
});

test('job authentication and disconnected state are distinct', async () => {
  const f = fixture();
  assert.equal((await f.handlers.daily(new NextRequest(`${origin}/api/seo/daily`, { method: 'POST' }))).status, 401);
  assert.equal((await f.handlers.daily(new NextRequest(`${origin}/api/seo/daily`, { method: 'POST', headers: { Authorization: `Bearer ${config.jobSecret}` } }))).status, 409);
  assert.deepEqual(f.calls, []);
});

test('realtime verification requires job authentication and never overwrites the encrypted daily report', async () => {
  const f = fixture(); const p = await pending(f);
  await f.handlers.callback(callback(p.cookie, p.state));
  f.store.set('seo/reports/2026-11-02.enc', 'existing-daily-report');
  let realtimeFlag: boolean | undefined;
  f.deps.collect = async (_grant, realtime) => {
    realtimeFlag = realtime;
    return { generatedAt: '2026-11-02T12:00:00Z', ga4: [], gsc: [], warnings: [], evidence: [] };
  };
  const url = `${origin}/api/seo/daily?view=realtime`;
  assert.equal((await f.handlers.daily(new NextRequest(url, { method: 'POST' }))).status, 401);
  assert.equal(realtimeFlag, undefined);
  const response = await f.handlers.daily(new NextRequest(url, { method: 'POST', headers: { Authorization: `Bearer ${config.jobSecret}` } }));
  assert.equal(response.status, 200);
  assert.equal(realtimeFlag, true);
  assert.equal(f.store.get('seo/reports/2026-11-02.enc'), 'existing-daily-report');
  assert.equal(f.calls.filter(call => call === 'write').length, 1);
  assert.equal((await f.handlers.daily(new NextRequest(`${origin}/api/seo/daily?view=invalid`, {
    method: 'POST', headers: { Authorization: `Bearer ${config.jobSecret}` },
  }))).status, 400);
});

test('AES envelopes cannot be moved between state, credentials and reports', () => {
  const encrypted = seal({ secret: 'fixture' }, config.key, 'google-grant');
  assert.throws(() => unseal(encrypted, config.key, 'oauth-state'));
  assert.throws(() => unseal(encrypted, randomBytes(32), 'google-grant'));
});

test('traffic diagnostics are authenticated and cannot overwrite the daily report', async () => {
  const f = fixture(); const p = await pending(f);
  await f.handlers.callback(callback(p.cookie, p.state));
  f.store.set('seo/reports/2026-11-02.enc', 'original-daily');
  let flags: unknown[] = [];
  f.deps.collect = async (_grant, realtime, traffic) => {
    flags = [realtime, traffic];
    return { generatedAt: '2026-11-02T12:00:00Z', ga4: [], gsc: [], warnings: [], evidence: [] };
  };
  const url = `${origin}/api/seo/daily?view=traffic`;
  assert.equal((await f.handlers.daily(new NextRequest(url, { method: 'POST' }))).status, 401);
  assert.deepEqual(flags, []);
  const response = await f.handlers.daily(new NextRequest(url, { method: 'POST', headers: { Authorization: `Bearer ${config.jobSecret}` } }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(flags, [false, true]);
  assert.equal(f.store.get('seo/reports/2026-11-02.enc'), 'original-daily');
  assert.equal(f.calls.filter(call => call === 'write').length, 1);
});

test('traffic queries use complete days, production hosts and test exclusions, without identifying dimensions', () => {
  const queries = trafficReportRequests();
  assert.equal(Object.keys(queries).length, 7);
  for (const query of Object.values(queries)) {
    assert.deepEqual(query.dateRanges, [{ startDate: '28daysAgo', endDate: 'yesterday' }]);
    const text = JSON.stringify(query);
    assert.ok(text.includes('hostName') && text.includes('codex_') && text.includes('notExpression'));
    assert.ok(!/userId|clientId|pageLocation|QueryString|customEvent:|searchTerm/.test(text));
    assert.ok(query.limit <= 200);
  }
  assert.ok(queries.landing.dimensions.some(d => d.name === 'landingPage'));
});

test('one upstream failure preserves independent diagnostics and cannot expose SDK credentials', async () => {
  const result = await collectTrafficReports(async source => {
    if (source.endsWith('_geography')) throw { config: { headers: { Authorization: 'fixture-private' } } };
    return { rowCount: source.endsWith('_landing') ? 201 : 1, rows: [],
      metadata: source.endsWith('_events') ? { subjectToThresholding: true } : {} };
  });
  assert.equal(result.status, 'partial');
  assert.deepEqual(result.unavailable, ['geography']);
  assert.equal(Object.keys(result.reports).length, 6);
  assert.deepEqual(new Set(result.limited), new Set(['landing', 'events']));
  assert.ok(!JSON.stringify(result).includes('fixture-private'));
  const missing = await collectTrafficReports(async () => { throw new Error('private'); });
  assert.equal(missing.status, 'unavailable');
  assert.equal(Object.keys(missing.reports).length, 0);
});

test('remaining reports exclude only the joint suspicious segment, preserving other Singapore, desktop and direct visits', () => {
  type Expr = { andGroup?: { expressions: Expr[] }; notExpression?: Expr;
    filter?: { fieldName: string; inListFilter?: { values: string[] }; stringFilter?: { matchType: string; value: string } } };
  function matches(expression: Expr, row: Record<string, string>): boolean {
    if (expression.andGroup) return expression.andGroup.expressions.every(e => matches(e, row));
    if (expression.notExpression) return !matches(expression.notExpression, row);
    const filter = expression.filter!; const value = row[filter.fieldName] || '';
    if (filter.inListFilter) return filter.inListFilter.values.includes(value);
    const expected = filter.stringFilter!.value.toLowerCase();
    return filter.stringFilter!.matchType === 'EXACT' ? value.toLowerCase() === expected : value.toLowerCase().startsWith(expected);
  }
  const baseline = { hostName: 'guruholdings.net', sessionSource: '(direct)',
    sessionSourceMedium: '(direct) / (none)', country: 'Singapore', deviceCategory: 'desktop' };
  for (const query of Object.values(trafficReportRequests('remaining'))) {
    const expression = query.dimensionFilter as Expr;
    assert.equal(matches(expression, baseline), false);
    assert.equal(matches(expression, { ...baseline, deviceCategory: 'mobile' }), true);
    assert.equal(matches(expression, { ...baseline, sessionSource: 'google', sessionSourceMedium: 'google / organic' }), true);
    assert.equal(matches(expression, { ...baseline, country: 'United States' }), true);
    assert.equal(matches(expression, { ...baseline, country: 'United States', sessionSource: 'codex_validation' }), false);
    assert.equal(matches(expression, { ...baseline, country: 'United States', hostName: 'preview.vercel.app' }), false);
  }
});

test('remaining mode uses the same admin gate, does not persist results, and labels the cohort', async () => {
  const f = fixture(); const p = await pending(f); await f.handlers.callback(callback(p.cookie, p.state));
  let received: unknown;
  f.deps.collect = async (_grant, realtime, traffic) => {
    received = { realtime, traffic };
    return { generatedAt: '2026-11-03T10:00:00Z', ga4: [], gsc: [], warnings: [], evidence: [] };
  };
  const url = `${origin}/api/seo/daily?view=traffic_remaining`;
  assert.equal((await f.handlers.daily(new NextRequest(url, { method: 'POST' }))).status, 401);
  assert.equal(received, undefined);
  const result = await f.handlers.daily(new NextRequest(url, { method: 'POST', headers: { Authorization: `Bearer ${config.jobSecret}` } }));
  assert.equal(result.status, 200); assert.equal(result.headers.get('cache-control'), 'no-store');
  assert.deepEqual(received, { realtime: false, traffic: 'remaining' });
  assert.equal(f.calls.filter(c => c === 'write').length, 1);
  const collected = await collectTrafficReports(async () => ({ rows: [], rowCount: 0 }), 'remaining');
  assert.equal(collected.cohort, 'remaining');
  assert.equal(Object.keys(collected.reports).length, 8);
  const queries = trafficReportRequests('remaining');
  assert.ok(queries.geography.dimensions.some(d => d.name === 'newVsReturning'));
  assert.ok(queries.events.dimensions.some(d => d.name === 'date'));
  assert.ok(queries.pages!.dimensions.some(d => d.name === 'pagePath'));
  assert.deepEqual(collected.excludedSegment, { sessionSourceMedium: '(direct) / (none)', country: 'Singapore', deviceCategory: 'desktop' });
});

test('Google official SDK requests offline access, PKCE and exactly two readonly scopes', () => {
  const url = new URL(productionDependencies(config).authorizationUrl('fixture-state', 'fixture-challenge'));
  assert.equal(url.origin, 'https://accounts.google.com');
  assert.deepEqual(new Set(url.searchParams.get('scope')!.split(' ')), new Set(SCOPES));
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(url.searchParams.get('include_granted_scopes'), 'false');
  assert.equal(url.searchParams.get('access_type'), 'offline');
  assert.equal(url.searchParams.get('redirect_uri'), `${origin}/api/seo/google/callback`);
});

test('rolling date ranges use Pacific calendar dates, independent of runner timezone', () => {
  assert.deepEqual(periodRanges(new Date('2026-11-02T12:00:00Z')), [
    { startDate: '2026-10-03', endDate: '2026-10-30' }, { startDate: '2026-09-05', endDate: '2026-10-02' },
  ]);
  assert.equal(periodRanges(new Date('2026-11-02T01:00:00Z'))[0].endDate, '2026-10-29');
});

test('realtime diagnostics never serialize request headers or sensitive OAuth errors', () => {
  const error = { response: { status: 400, data: { error: { status: 'INVALID_ARGUMENT', message: 'Unsupported metric combination' } } },
    config: { headers: { Authorization: 'Bearer fixture-private-access' } } };
  assert.deepEqual(realtimeDiagnostic(error), { status: 400, code: 'INVALID_ARGUMENT', detail: 'Unsupported metric combination' });
  error.response.data.error.message = 'client_secret=fixture-secret';
  assert.equal(realtimeDiagnostic(error).detail, 'Google realtime report unavailable');
});

test('organic acquisition fixes equal completed-day windows in the property timezone, including midnight and leap day', () => {
  const periods = acquisitionPeriods(new Date('2026-11-05T05:00:00Z'));
  assert.deepEqual(periods, {
    current7: { startDate: '2026-10-28', endDate: '2026-11-03' },
    previous7: { startDate: '2026-10-21', endDate: '2026-10-27' },
    current28: { startDate: '2026-10-07', endDate: '2026-11-03' },
    previous28: { startDate: '2026-09-09', endDate: '2026-10-06' },
  });
  assert.equal(acquisitionPeriods(new Date('2026-11-05T07:59:00Z')).current7.endDate, '2026-11-03');
  assert.equal(acquisitionPeriods(new Date('2026-11-05T08:01:00Z')).current7.endDate, '2026-11-04');
  assert.deepEqual(acquisitionPeriods(new Date('2028-03-01T20:00:00Z')).current28,
    { startDate: '2028-02-02', endDate: '2028-02-29' });
});

test('acquisition selects first-user organic discovery even when the current session is direct, excludes tests and previews', () => {
  type Expr = { andGroup?: { expressions: Expr[] }; notExpression?: Expr;
    filter?: { fieldName: string; inListFilter?: { values: string[] }; stringFilter?: { matchType: string; value: string; caseSensitive: boolean } } };
  const matches = (e: Expr, row: Record<string, string>): boolean => {
    if (e.andGroup) return e.andGroup.expressions.every(x => matches(x, row));
    if (e.notExpression) return !matches(e.notExpression, row);
    const f = e.filter!, value = row[f.fieldName] || '';
    if (f.inListFilter) return f.inListFilter.values.includes(value);
    const rule = f.stringFilter!, actual = rule.caseSensitive ? value : value.toLowerCase();
    const expected = rule.caseSensitive ? rule.value : rule.value.toLowerCase();
    return rule.matchType === 'EXACT' ? actual === expected : actual.startsWith(expected);
  };
  const organic = { hostName: 'guruholdings.net', firstUserDefaultChannelGroup: 'Organic Search', firstUserSource: 'google',
    sessionDefaultChannelGroup: 'Direct', country: 'Singapore', deviceCategory: 'desktop' };
  const queries = acquisitionReportRequests(new Date('2026-11-05T05:00:00Z'));
  assert.equal(Object.keys(queries).length, 6);
  for (const query of Object.values(queries)) {
    assert.equal(matches(query.dimensionFilter, organic), true);
    assert.equal(matches(query.dimensionFilter, { ...organic, firstUserDefaultChannelGroup: 'Direct', sessionDefaultChannelGroup: 'Organic Search' }), false);
    assert.equal(matches(query.dimensionFilter, { ...organic, firstUserSource: 'CODEX_fixture' }), false);
    assert.equal(matches(query.dimensionFilter, { ...organic, hostName: 'preview.vercel.app' }), false);
    assert.deepEqual(query.metrics, [{ name: 'newUsers' }]);
    assert.ok(query.limit <= 100);
    assert.ok(!/userId|clientId|pageLocation|QueryString|customEvent:|searchTerm|sessionSource/.test(JSON.stringify(query)));
  }
});

test('an explicit zero newUsers count stays zero while absent, invalid and ambiguous totals stay null', () => {
  assert.deepEqual(acquisitionCount({ rows: [{ metricValues: [{ value: '0' }] }] }), { newUsers: 0, state: 'reported' });
  assert.deepEqual(acquisitionCount(), { newUsers: null, state: 'unavailable' });
  assert.deepEqual(acquisitionCount({ rows: [] }), { newUsers: null, state: 'no_rows' });
  assert.deepEqual(acquisitionCount({ rows: [{ metricValues: [{ value: 'NaN' }] }] }), { newUsers: null, state: 'invalid_metric' });
  assert.equal(acquisitionCount({ rows: [{}, {}] }).state, 'ambiguous_rows');
});

test('acquisition bounds concurrent calls, retains independent totals, and flags incomplete metadata without exposing errors', async () => {
  let active = 0, maximum = 0;
  const result = await collectAcquisitionReports(async source => {
    active++; maximum = Math.max(maximum, active);
    try {
      await new Promise(resolve => setTimeout(resolve, 2));
      if (source.endsWith('_previous7')) throw { config: { headers: { Authorization: 'fixture-private-acquisition' } } };
      return { metricHeaders: [{ name: 'newUsers' }], rows: [{ metricValues: [{ value: '3' }] }],
        rowCount: source.endsWith('_sources28') ? 101 : 1,
        metadata: source.endsWith('_daily28') ? { timeZone: 'UTC' } : { timeZone: 'America/Los_Angeles' } };
    } finally { active--; }
  }, new Date('2026-11-05T05:00:00Z'));
  assert.equal(maximum, 3);
  assert.equal(result.status, 'partial');
  assert.deepEqual(result.unavailable, ['previous7']);
  assert.equal(result.totals.current7.newUsers, 3);
  assert.equal(result.totals.previous7.newUsers, null);
  assert.deepEqual(new Set(result.limited), new Set(['daily28', 'sources28']));
  assert.ok(!JSON.stringify(result).includes('fixture-private-acquisition'));
  const invalid = await collectAcquisitionReports(async () => ({ metricHeaders: [{ name: 'activeUsers' }], rows: [] }));
  assert.equal(invalid.status, 'unavailable');
  assert.equal(invalid.totals.current28.newUsers, null);
});

test('acquisition is job-authenticated, ignores arbitrary query options, and never overwrites encrypted daily reports', async () => {
  const f = fixture(); const p = await pending(f);
  await f.handlers.callback(callback(p.cookie, p.state));
  f.store.set('seo/reports/2026-11-02.enc', 'original-daily');
  let flags: unknown[] = [];
  f.deps.collect = async (_grant, realtime, traffic, acquisition) => {
    flags = [realtime, traffic, acquisition];
    return { generatedAt: '2026-11-02T12:00:00Z', ga4: [], gsc: [], warnings: [], evidence: [] };
  };
  const url = `${origin}/api/seo/daily?view=acquisition&property=untrusted&metric=totalRevenue`;
  assert.equal((await f.handlers.daily(new NextRequest(url, { method: 'POST' }))).status, 401);
  assert.equal((await f.handlers.daily(new NextRequest(url, { method: 'POST', headers: { Authorization: 'Bearer incorrect' } }))).status, 401);
  assert.deepEqual(flags, []);
  const response = await f.handlers.daily(new NextRequest(url, { method: 'POST', headers: { Authorization: `Bearer ${config.jobSecret}` } }));
  assert.equal(response.status, 200);
  assert.deepEqual(flags, [false, false, true]);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.equal(f.store.get('seo/reports/2026-11-02.enc'), 'original-daily');
  assert.equal(f.calls.filter(call => call === 'write').length, 1);
});
