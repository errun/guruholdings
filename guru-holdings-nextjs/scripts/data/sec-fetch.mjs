import { setTimeout as sleep } from 'node:timers/promises';

const retryDelays = [2000, 6000, 18000];
const maxRetryAfter = 30000;

function retryAfterMs(header) {
  if (header === null) return 0;
  if (/^\d+$/.test(header)) return Number(header) * 1000;
  const deadline = Date.parse(header);
  return Number.isFinite(deadline) ? Math.max(0, deadline - Date.now()) : 0;
}

/** @param {{ request?: typeof fetch, wait?: (ms: number) => Promise<void> }} options */
export function createSecFetch({ request = fetch, wait = sleep } = {}) {
  const userAgent = process.env.SEC_USER_AGENT || 'GuruHoldingsTracker/0.2 https://guruholdings.net';
  let lastRequestAt = -Infinity;

  return async function secFetch(url, options = {}) {
    for (let attempt = 0; ; attempt += 1) {
      const spacing = 160 - (performance.now() - lastRequestAt);
      if (spacing > 0) await wait(spacing);
      lastRequestAt = performance.now();
      const backoff = retryDelays[attempt];
      let response;
      try {
        response = await request(url, {
          ...options,
          signal: AbortSignal.timeout(25000),
          headers: {
            'User-Agent': userAgent,
            'Accept-Encoding': 'gzip, deflate',
            ...options.headers,
          },
        });
      } catch (error) {
        if (backoff === undefined) throw error;
        await wait(backoff);
        continue;
      }

      if (response.ok) return response;
      await response.body?.cancel().catch(() => {});
      const error = new Error(`SEC request failed ${response.status} for ${url}`);
      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable || backoff === undefined) throw error;
      const retryAfter = retryAfterMs(response.headers.get('Retry-After'));
      // Respect longer source pauses by failing this run instead of retrying early.
      if (retryAfter > maxRetryAfter) throw error;
      await wait(Math.max(backoff, retryAfter));
    }
  };
}
