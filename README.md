# Guru Holdings

Guru Holdings 是一个基于 SEC EDGAR 13F 报告的机构持仓研究站点。当前跟踪 Berkshire Hathaway、Himalaya Capital、Bridgewater Associates、Pershing Square、Scion Asset Management、Tiger Global 和 Palliser Capital。

生产地址：[https://guruholdings.net](https://guruholdings.net)

## 核心能力

- 查看机构完整 13F 持仓和最近四个季度变化。
- 按股票、机构、投资人、Ticker 或 CUSIP 搜索。
- 对比新增、增持、减持、清仓、共同持仓和共同变化。
- 保留 SEC 原始 Issuer、CUSIP、申报编号和 XML 来源。
- 每月自动抓取、校验并发布新的 13F 数据。
- 支持英文、简体中文、日文和韩文的服务端页面与多语言 SEO。

## 技术栈

- Next.js 15 App Router、React 19、TypeScript
- Tailwind CSS、Radix UI、Recharts
- GitHub Actions 数据自动化
- Vercel 生产部署

应用目录为 `guru-holdings-nextjs`。

## 本地运行

```powershell
Set-Location "C:\Users\edwin\Documents\augment-projects\guruHoldings\repo\guru-holdings-nextjs"
npm ci
npm run dev
```

生产验证：

```powershell
npm run i18n:check
npm run typecheck
npm run build
npm run seo:check
```

`seo:check` 需要已有生产构建。它会启动本地生产服务器，检查四种语言的代表页面、canonical、`hreflang`、Open Graph、Twitter、robots、重定向、404 和 Sitemap。

## 多语言网址

- 英文：无语言前缀，例如 `/live-13f/berkshire`
- 简体中文：`/zh/...`
- 日文：`/ja/...`
- 韩文：`/ko/...`
- `/en/...` 永久重定向到无前缀英文网址

翻译统一维护在 `guru-holdings-nextjs/lib/i18n/site.ts`。新增文案时必须同时补齐四种语言，并确保插值占位符一致。金融关键词和术语表位于 `lib/i18n/seo-keywords.ts`。

## SEO 规则

- 所有可收录页面均在服务端输出当前语言内容。
- 每个页面具有自引用 canonical 和完整、双向的 `hreflang`。
- `x-default` 指向无前缀英文页面。
- Sitemap 根据最新快照自动生成，不包含内部验证页和旧持仓网址。
- `/data-automation-check` 是公开可访问的运维信息页，但设置为 `noindex,nofollow`；这不构成访问控制。

## 数据更新

`.github/workflows/update-13f-data.yml` 每月 16 日运行：抓取 SEC 数据、验证远端与本地哈希、执行站点检查，全部通过后才提交生成数据。Vercel 在 `master` 更新后自动部署。

13F 通常存在约 45 天披露延迟，本站信息不代表实时持仓，也不构成投资建议。
