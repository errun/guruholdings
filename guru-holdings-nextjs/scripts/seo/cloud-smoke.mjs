import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import { randomBytes } from 'node:crypto';

const probe = net.createServer();
probe.listen(0, '127.0.0.1');
await once(probe, 'listening');
const port = probe.address().port;
await new Promise(resolve => probe.close(resolve));
const base = `http://127.0.0.1:${port}`;
const origin = 'https://guruholdings.net';
const connectSecret = randomBytes(32).toString('hex');
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '-H', '127.0.0.1'], {
  stdio: 'ignore', env: { ...process.env,
    SEO_GOOGLE_CLIENT_ID: 'smoke-fixture.apps.googleusercontent.com', SEO_GOOGLE_CLIENT_SECRET: 'not-a-real-secret',
    SEO_TOKEN_KEY: randomBytes(32).toString('base64'), SEO_CONNECT_SECRET: connectSecret,
    SEO_JOB_SECRET: randomBytes(32).toString('hex'), SEO_PUBLIC_ORIGIN: origin,
  },
});
const results = [];
async function check(path, options, expected) {
  const start = Date.now();
  const response = await fetch(base + path, { ...options, redirect: 'manual' });
  assert.equal(response.status, expected, `${path} HTTP status`);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
  results.push({ path, httpStatus: response.status, elapsedMs: Date.now() - start });
  return response;
}
try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    try { await fetch(base + '/api/seo/google/connect'); ready = true; break; } catch {}
    if (server.exitCode !== null) throw new Error('Production server exited.');
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  assert.ok(ready, 'production server ready');
  const page = await check('/api/seo/google/connect', {}, 200);
  assert.ok((await page.text()).includes('name="secret"'));
  await check('/api/seo/google/connect', { method: 'POST', headers: { Origin: 'https://attacker.invalid' } }, 403);
  const start = await check('/api/seo/google/connect', { method: 'POST', headers: {
    Origin: origin, 'Content-Type': 'application/x-www-form-urlencoded',
  }, body: new URLSearchParams({ secret: connectSecret }).toString() }, 303);
  const location = new URL(start.headers.get('location'));
  assert.equal(location.origin, 'https://accounts.google.com');
  assert.equal(location.searchParams.get('code_challenge_method'), 'S256');
  assert.ok(start.headers.get('set-cookie').includes('HttpOnly'));
  assert.ok(start.headers.get('set-cookie').includes('Secure'));
  assert.ok(start.headers.get('set-cookie').includes('SameSite=lax'));
  await check('/api/seo/google/callback?code=fixture&state=forged', {}, 400);
  await check('/api/seo/daily', { method: 'POST' }, 401);
  await check('/api/seo/daily?view=traffic', { method: 'POST' }, 401);
  await check('/api/seo/daily?view=traffic', { method: 'POST', headers: { Authorization: 'Bearer incorrect' } }, 401);
  console.log(JSON.stringify({ fixtureOnly: true, results, googleConsentOrStorageTested: false }, null, 2));
} finally {
  server.kill();
  if (server.exitCode === null) await once(server, 'exit');
}
