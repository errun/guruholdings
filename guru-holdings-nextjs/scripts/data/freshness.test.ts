import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getDataFreshness } from '../../lib/update-cadence';
import { createSecFetch } from './sec-fetch.mjs';

const snapshot = { latestQuarter: '2026Q2', generatedAt: '2026-11-02T16:45:03Z', dataFingerprint: 'verified-content',
  managers: [
    { latestQuarter: '2026Q2', latestFiling: { reportDate: '2026-06-30', filingDate: '2026-08-14' } },
    { latestQuarter: '2026Q2', latestFiling: { reportDate: '2026-06-30', filingDate: '2026-08-07' } },
    { latestQuarter: '2025Q3', latestFiling: { reportDate: '2025-09-30', filingDate: '2025-11-03' } },
  ] };
const check = { checkedAt: '2026-11-02T17:00:00Z', dataFingerprint: 'verified-content', latestQuarter: '2026Q2', verifiedManagerCount: 3 };

test('disclosure dates and coverage describe the actual latest-quarter sources, not old managers', () => {
  assert.deepEqual(getDataFreshness(snapshot, check), { checkedAt: check.checkedAt, reportDate: '2026-06-30',
    filingStart: '2026-08-07', filingEnd: '2026-08-14', currentManagerCount: 2, managerCount: 3 });
});

test('changed data, partial verification or invalid dates cannot claim a successful SEC check', () => {
  for (const change of [{ dataFingerprint: 'old-content' }, { verifiedManagerCount: 2 }, { latestQuarter: '2026Q1' },
    { checkedAt: 'invalid' }, { checkedAt: '2026-06-24T00:00:00Z' }]) {
    assert.equal(getDataFreshness(snapshot, { ...check, ...change }).checkedAt, null);
  }
});

test('missing latest-quarter data does not invent a date or manager coverage', () => {
  const result = getDataFreshness({ ...snapshot, managers: [] }, check);
  assert.equal(result.checkedAt, null);
  assert.equal(result.reportDate, null);
  assert.equal(result.filingStart, null);
  assert.equal(result.currentManagerCount, 0);
});

const sourceUrl = 'https://www.sec.gov/fixture.xml';

function secFixture(responses: Response[]) {
  let requests = 0;
  const waits: number[] = [];
  const fetchSec = createSecFetch({
    request: async () => responses[requests++],
    wait: async (ms: number) => { if (ms >= 1000) waits.push(ms); },
  });
  return { fetchSec, waits, count: () => requests };
}

test('the same SEC file can recover after three temporary 503 responses', async () => {
  const errors = Array.from({ length: 3 }, () => new Response('unavailable', { status: 503 }));
  const fixture = secFixture([...errors, new Response('<filing/>')]);
  assert.equal(await (await fixture.fetchSec(sourceUrl)).text(), '<filing/>');
  assert.equal(fixture.count(), 4);
  assert.deepEqual(fixture.waits, [2000, 6000, 18000]);
  assert.ok(errors.every(response => response.bodyUsed));
});

test('SEC throttling honors the source wait before trying again', async () => {
  const fixture = secFixture([new Response(null, { status: 429, headers: { 'Retry-After': '12' } }), new Response('ok')]);
  assert.equal((await fixture.fetchSec(sourceUrl)).status, 200);
  assert.deepEqual(fixture.waits, [12000]);
});

test('a long SEC Retry-After or a missing file stops this run without an early retry', async () => {
  for (const response of [
    new Response(null, { status: 503, headers: { 'Retry-After': '120' } }),
    new Response(null, { status: 404 }),
  ]) {
    const fixture = secFixture([response]);
    await assert.rejects(fixture.fetchSec(sourceUrl), new RegExp(String(response.status)));
    assert.equal(fixture.count(), 1);
    assert.deepEqual(fixture.waits, []);
  }
});

test('persistent SEC unavailability fails after four attempts', async () => {
  const fixture = secFixture(Array.from({ length: 4 }, () => new Response(null, { status: 503 })));
  await assert.rejects(fixture.fetchSec(sourceUrl), /503/);
  assert.equal(fixture.count(), 4);
  assert.deepEqual(fixture.waits, [2000, 6000, 18000]);
});
