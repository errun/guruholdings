import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getDataFreshness } from '../../lib/update-cadence';

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
