import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { CodeChallengeMethod, OAuth2Client } from 'google-auth-library';
import { get, put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { RESEARCH_PERIODS, researchReportRequest } from './research-report';

export const SCOPES = ['https://www.googleapis.com/auth/analytics.readonly', 'https://www.googleapis.com/auth/webmasters.readonly'];
export const PROPERTY = '542593473';
export const SITE = 'https://guruholdings.net/';
const COOKIE = '__Host-guru-seo-oauth';
const TOKEN_PATH = 'seo/google/credentials.enc';
const HEADERS = {
  'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
};
type Config = { clientId: string; clientSecret: string; origin: string; key: Buffer; connectSecret: string; jobSecret: string };
type Pending = { state: string; verifier: string; created: number };
type Grant = { refreshToken: string; connectedAt: string; scope: string };
type Tokens = { accessToken: string; refreshToken: string; scope: string };
type Row = { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] };
type GaReport = { rows?: Row[]; rowCount?: number; metadata?: Record<string, unknown>; [key: string]: unknown };
export type CloudReport = { generatedAt: string; ga4: GaReport[]; gsc: Record<string, unknown>[]; warnings: string[]; evidence: Evidence[];
  behavior?: { status: 'available' | 'unavailable'; periods: typeof RESEARCH_PERIODS; reports: GaReport[] } };
type Evidence = { source: string; httpStatus: number; elapsedMs: number };
export interface Dependencies {
  authorizationUrl(state: string, challenge: string): string;
  exchange(code: string, verifier: string): Promise<Tokens>;
  verifyAccess(accessToken: string): Promise<void>;
  read(path: string): Promise<string | null>;
  write(path: string, value: string): Promise<void>;
  collect(grant: Grant): Promise<CloudReport>;
}

export function readConfig(env: Record<string, string | undefined> = process.env): Config {
  const required = ['SEO_GOOGLE_CLIENT_ID', 'SEO_GOOGLE_CLIENT_SECRET', 'SEO_TOKEN_KEY', 'SEO_CONNECT_SECRET', 'SEO_JOB_SECRET'];
  if (required.some(name => !env[name])) throw new Error('configuration_missing');
  const key = Buffer.from(env.SEO_TOKEN_KEY!, 'base64');
  if (key.length !== 32 || env.SEO_CONNECT_SECRET!.length < 32 || env.SEO_JOB_SECRET!.length < 32) throw new Error('configuration_invalid');
  const origin = env.SEO_PUBLIC_ORIGIN || 'https://guruholdings.net';
  if (!/^https:\/\/[^/]+$/.test(origin)) throw new Error('origin_invalid');
  return { clientId: env.SEO_GOOGLE_CLIENT_ID!, clientSecret: env.SEO_GOOGLE_CLIENT_SECRET!, key,
    connectSecret: env.SEO_CONNECT_SECRET!, jobSecret: env.SEO_JOB_SECRET!, origin };
}

export function equal(a: string, b: string): boolean {
  const left = Buffer.from(a); const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function seal(value: unknown, key: Buffer, purpose: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from(purpose));
  const body = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64url');
}

export function unseal<T>(value: string, key: Buffer, purpose: string): T {
  const bytes = Buffer.from(value, 'base64url');
  const decipher = createDecipheriv('aes-256-gcm', key, bytes.subarray(0, 12));
  decipher.setAAD(Buffer.from(purpose)); decipher.setAuthTag(bytes.subarray(12, 28));
  return JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString('utf8')) as T;
}

function scopesValid(value: string): boolean {
  const scopes = new Set(value.split(/\s+/).filter(Boolean));
  return scopes.size === SCOPES.length && SCOPES.every(scope => scopes.has(scope));
}

function json(value: unknown, status = 200) { return NextResponse.json(value, { status, headers: HEADERS }); }
function html(body: string, status = 200) {
  return new NextResponse(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Guru Holdings 数据授权</title><body>${body}</body></html>`,
    { status, headers: { ...HEADERS, 'Content-Type': 'text/html; charset=utf-8' } });
}
function clear(response: NextResponse) {
  response.cookies.set(COOKIE, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 });
  return response;
}

export function createHandlers(config: Config, deps: Dependencies) {
  return {
    page() {
      const response = html('<h1>连接 Google 只读数据</h1><p>仅供站点管理员使用。授权范围为 GA4 与 Search Console 只读报告。</p><form method="post"><label>管理员连接码 <input name="secret" type="password" autocomplete="off" required maxlength="256"></label><button>前往 Google 授权</button></form>');
      // Native form POSTs under no-referrer send Origin: null in Chromium.
      // Keep the strict Origin check; disclose referrers only within this site.
      response.headers.set('Referrer-Policy', 'same-origin');
      // Chromium also checks the form's cross-origin OAuth redirect against CSP.
      response.headers.set('Content-Security-Policy', "default-src 'none'; form-action 'self' https://accounts.google.com; frame-ancestors 'none'; base-uri 'none'");
      return response;
    },
    async connect(request: NextRequest) {
      if (request.headers.get('origin') !== config.origin) return json({ error: 'origin_rejected' }, 403);
      if (!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) return json({ error: 'invalid_content_type' }, 400);
      const body = await request.text();
      if (body.length > 1024) return json({ error: 'invalid_request' }, 400);
      if (!equal(new URLSearchParams(body).get('secret') || '', config.connectSecret)) return json({ error: 'unauthorized' }, 401);
      const pending: Pending = { state: randomBytes(32).toString('base64url'), verifier: randomBytes(48).toString('base64url'), created: Date.now() };
      const challenge = createHash('sha256').update(pending.verifier).digest('base64url');
      const response = NextResponse.redirect(deps.authorizationUrl(pending.state, challenge), { status: 303, headers: HEADERS });
      response.cookies.set(COOKIE, seal(pending, config.key, 'oauth-state'), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 600 });
      return response;
    },
    async callback(request: NextRequest) {
      let pending: Pending;
      try { pending = unseal(request.cookies.get(COOKIE)?.value || '', config.key, 'oauth-state'); }
      catch { return clear(json({ error: 'invalid_oauth_state' }, 400)); }
      const url = request.nextUrl;
      if (!pending.state || !pending.verifier || !Number.isFinite(pending.created) ||
          Date.now() - pending.created > 600_000 || pending.created > Date.now() + 5000 ||
          !equal(url.searchParams.get('state') || '', pending.state)) return clear(json({ error: 'invalid_oauth_state' }, 400));
      if (url.searchParams.has('error') || !url.searchParams.get('code')) return clear(html('<h1>授权未完成</h1><p>可以返回连接页重新发起。</p>', 400));
      try {
        const tokens = await deps.exchange(url.searchParams.get('code')!, pending.verifier);
        if (!tokens.accessToken || !tokens.refreshToken || !scopesValid(tokens.scope)) return clear(json({ error: 'readonly_grant_required' }, 400));
        // Verify the exact GA4/GSC resources before replacing a previously working grant.
        await deps.verifyAccess(tokens.accessToken);
        const grant: Grant = { refreshToken: tokens.refreshToken, connectedAt: new Date().toISOString(), scope: tokens.scope };
        await deps.write(TOKEN_PATH, seal(grant, config.key, 'google-grant'));
        return clear(html('<h1>Google 只读授权已连接</h1><p>已核验指定 GA4 和 GSC 接口访问。真实数据量、采集完整性及每日任务状态将另行检查。</p>'));
      } catch { return clear(json({ error: 'google_connection_failed' }, 502)); }
    },
    async daily(request: NextRequest) {
      if (!equal(request.headers.get('authorization') || '', `Bearer ${config.jobSecret}`)) return json({ error: 'unauthorized' }, 401);
      try {
        const encrypted = await deps.read(TOKEN_PATH);
        if (!encrypted) return json({ error: 'google_not_connected' }, 409);
        const grant = unseal<Grant>(encrypted, config.key, 'google-grant');
        if (!scopesValid(grant.scope)) return json({ error: 'readonly_grant_required' }, 409);
        const report = await deps.collect(grant);
        await deps.write(`seo/reports/${report.generatedAt.slice(0, 10)}.enc`, seal(report, config.key, 'seo-report'));
        return json(report);
      } catch { return json({ error: 'collection_failed_reauthorization_or_service_check_needed' }, 502); }
    },
  };
}

function client(config: Config) {
  return new OAuth2Client(config.clientId, config.clientSecret, `${config.origin}/api/seo/google/callback`);
}
const GA_URL = `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:runReport`;
const GSC_SITE_URL = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}`;

export function periodRanges(now = new Date()) {
  // GSC calendar dates use Pacific time; exclude the latest three dates conservatively.
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (type: string) => parts.find(p => p.type === type)!.value;
  const end = new Date(`${part('year')}-${part('month')}-${part('day')}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() - 3);
  const date = (offset: number) => new Date(end.getTime() + offset * 86400000).toISOString().slice(0, 10);
  return [{ startDate: date(-27), endDate: date(0) }, { startDate: date(-55), endDate: date(-28) }];
}

export function productionDependencies(config: Config): Dependencies {
  return {
    authorizationUrl(state, challenge) {
      return client(config).generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: SCOPES,
        include_granted_scopes: false, state, code_challenge: challenge, code_challenge_method: CodeChallengeMethod.S256 });
    },
    async exchange(code, verifier) {
      const { tokens } = await client(config).getToken({ code, codeVerifier: verifier });
      return { accessToken: tokens.access_token || '', refreshToken: tokens.refresh_token || '', scope: tokens.scope || '' };
    },
    async verifyAccess(accessToken) {
      const oauth = client(config); oauth.setCredentials({ access_token: accessToken });
      await oauth.request({ url: GSC_SITE_URL, timeout: 20000 });
      await oauth.request({ url: GA_URL, method: 'POST', timeout: 20000,
        data: { dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }], metrics: [{ name: 'activeUsers' }], limit: 1 } });
    },
    async read(path) {
      const value = await get(path, { access: 'private', useCache: false });
      if (!value) return null;
      if (value.statusCode !== 200 || !value.stream) throw new Error('storage_read_failed');
      return new Response(value.stream).text();
    },
    async write(path, value) {
      await put(path, value, { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/octet-stream' });
    },
    async collect(grant) {
      const oauth = client(config); oauth.setCredentials({ refresh_token: grant.refreshToken });
      const ga4: GaReport[] = []; const gsc: Record<string, unknown>[] = []; const evidence: Evidence[] = [];
      const ranges = periodRanges();
      const hostFilter = { filter: { fieldName: 'hostName', inListFilter: { values: ['guruholdings.net', 'www.guruholdings.net'] } } };
      const request = async <T>(source: string, url: string, data: unknown): Promise<T> => {
        const started = Date.now();
        const response = await oauth.request<T>({ url, method: 'POST', data, timeout: 25000 });
        evidence.push({ source, httpStatus: response.status, elapsedMs: Date.now() - started });
        return response.data;
      };
      for (const range of ranges) {
        ga4.push(await request<GaReport>('ga4_totals', GA_URL, { dateRanges: [range], dimensionFilter: hostFilter,
          metrics: ['activeUsers', 'sessions', 'engagedSessions', 'screenPageViews', 'userEngagementDuration'].map(name => ({ name })) }));
        gsc.push(await request('gsc_totals', `${GSC_SITE_URL}/searchAnalytics/query`, { ...range, dataState: 'final', type: 'web' }));
      }
      ga4.push(await request<GaReport>('ga4_pages', GA_URL, { dateRanges: [ranges[0]], dimensionFilter: hostFilter,
        dimensions: [{ name: 'pagePath' }], metrics: ['activeUsers', 'screenPageViews', 'userEngagementDuration'].map(name => ({ name })),
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: 500 }));
      for (const dimensions of [['page'], ['query']]) {
        gsc.push(await request('gsc_top_' + dimensions[0], `${GSC_SITE_URL}/searchAnalytics/query`,
          { ...ranges[0], dataState: 'final', type: 'web', dimensions, rowLimit: 500 }));
      }
      const warnings = [
        'GSC 页面/搜索词为前 500 行机会样本，非全量；匿名搜索词不会完整返回。',
        'GA4 时区可能与 GSC 不同；数据变化不能单独证明优化的因果效果。',
        '页面参与时长为前台参与总秒数；不能把后台挂机或单纯时长增加视为用户满意。',
      ];
      if (!ga4[0].rows?.length) warnings.push('GA4 本站主机名过滤后无数据，须核查资源绑定和统计采集。');
      if (!Array.isArray(gsc[0].rows) || !gsc[0].rows.length) warnings.push('GSC 已完成数据为空；不能断言没有搜索曝光或接口失效。');
      if ((ga4[2].rowCount || 0) > 500) warnings.push('GA4 页面超过 500 行，当前结果按浏览量截取。');
      if (ga4.some(r => r.metadata?.subjectToThresholding)) warnings.push('GA4 报告受隐私阈值限制。');
      const behavior: NonNullable<CloudReport['behavior']> = { status: 'available', periods: RESEARCH_PERIODS, reports: [] };
      try {
        for (const range of RESEARCH_PERIODS) behavior.reports.push(await request<GaReport>('ga4_research_events', GA_URL, researchReportRequest(range)));
      } catch {
        behavior.status = 'unavailable'; behavior.reports = [];
        warnings.push('功能使用事件报表暂不可用；基础流量与搜索采集仍保留，不能将缺失事件解释为零使用。');
      }
      return { generatedAt: new Date().toISOString(), period: ranges, ga4, gsc, behavior, warnings, evidence } as CloudReport;
    },
  };
}

export function handlers() { const config = readConfig(); return createHandlers(config, productionDependencies(config)); }
export function configurationFailure() { return json({ error: 'seo_cloud_not_configured' }, 503); }
