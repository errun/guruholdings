import { test } from 'node:test';
import assert from 'node:assert/strict';
import { researchContext, researchPayload, trackResearch } from '../../lib/research-analytics';
import { RESEARCH_PERIODS, researchReportRequest } from '../../lib/seo/research-report';

test('localized research paths resolve without retaining query, hash or arbitrary URLs', () => {
  assert.deepEqual(researchContext('/zh/stocks/alphabet?q=private@example.com#notes'), {
    page_type: 'stock', page_locale: 'zh', page_entity: 'alphabet',
  });
  assert.equal(researchContext('/ko/live-13f/berkshire').page_type, 'manager');
  assert.equal(researchContext('/ja/live-13f').page_type, 'signals');
  assert.equal(researchContext('/').page_type, 'home');
  assert.equal(researchContext('/api/seo/google/callback').page_type, 'other');
  assert.ok(!('page_entity' in researchContext('/stocks/person@example.com')));
});

test('event payload drops free text, credentials, identifiers and arbitrary parameters', () => {
  const payload = researchPayload('/live-13f?q=private', {
    query: 'private@example.com', email: 'private@example.com', user_id: 'secret-person',
    token: 'secret', page_location: 'https://example.com/?token=secret',
    entity_id: 'alphabet', section: 'search', result_count: 3, has_theme: true,
    target_id: 'private@example.com', engagement_time_msec: 60_000,
  });
  assert.deepEqual(payload, { page_type: 'signals', page_locale: 'en', measurement_version: 1,
    entity_id: 'alphabet', section: 'search', result_count: 3, has_theme: true });
});

test('malformed counters and unbounded payloads cannot create fake duration or huge events', () => {
  const payload = researchPayload('/', { result_count: Infinity, stock_results: -1,
    selected_count: 3.8, shared_holdings: 1e20, section: 'x'.repeat(1000) });
  assert.equal(payload.selected_count, 3);
  assert.equal(payload.shared_holdings, 100_000);
  assert.ok(!('result_count' in payload) && !('stock_results' in payload) && !('section' in payload));
});

test('tracking during server rendering is a safe no-op', () => {
  assert.equal(trackResearch('search_results', { result_count: 3 }), false);
});

test('read-only event reports isolate production hosts and use registered built-in dimensions', () => {
  const request = researchReportRequest({ startDate: '2026-10-03', endDate: '2026-10-30' });
  assert.deepEqual(request.dimensions, [{ name: 'eventName' }]);
  assert.ok(!JSON.stringify(request).includes('customEvent:'));
  assert.deepEqual(request.dimensionFilter.andGroup.expressions[0].filter.inListFilter.values, ['guruholdings.net', 'www.guruholdings.net']);
  assert.ok(request.dimensionFilter.andGroup.expressions[1].filter.inListFilter.values.includes('search_no_results'));
  assert.ok(!request.dimensionFilter.andGroup.expressions[1].filter.inListFilter.values.includes('user_engagement'));
});

test('behavior periods cover yesterday and a non-overlapping previous week in the GA4 property timezone', () => {
  assert.deepEqual(RESEARCH_PERIODS, [
    { startDate: '7daysAgo', endDate: 'yesterday' },
    { startDate: '14daysAgo', endDate: '8daysAgo' },
  ]);
});
