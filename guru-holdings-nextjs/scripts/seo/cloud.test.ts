import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { NextRequest } from 'next/server';
import { createHandlers, readConfig, productionDependencies, SCOPES, seal, unseal, periodRanges, type Dependencies } from '../../lib/seo/cloud';

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
