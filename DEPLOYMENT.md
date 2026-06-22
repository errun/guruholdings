# Vercel 部署说明

## 生产配置

- 平台：Vercel
- 主域名：`https://guruholdings.net`
- Git 分支：`master`
- Root Directory：`guru-holdings-nextjs`
- 框架：Next.js
- Node.js：22

`www.guruholdings.net` 应在 Vercel Domains 中设置为永久重定向到 `guruholdings.net`。

## 发布流程

1. 本地执行 `npm run i18n:check`、`npm run typecheck`、`npm run build` 和 `npm run seo:check`。
2. 全部通过后提交并推送到 `master`。
3. Vercel Git 集成自动创建生产部署。
4. 确认部署 Commit SHA 与 Git 提交一致，状态为 `READY`。
5. 在线检查四种语言、Sitemap、robots、重定向、404 和运行日志。

GitHub Actions 的 `deploy.yml` 只负责验证，不负责部署。生产发布由 Vercel 完成。

## 数据自动发布

`update-13f-data.yml` 每月 16 日 02:00 UTC 运行。只有 SEC 抓取、哈希验证、翻译检查、类型检查、构建和 SEO 检查全部通过，工作流才会提交最新快照到 `master`，随后触发 Vercel。

## 手动验证命令

```powershell
Set-Location "C:\Users\edwin\Documents\augment-projects\guruHoldings\repo\guru-holdings-nextjs"
npm ci
npm run i18n:check
npm run typecheck
npm run build
npm run seo:check
```
