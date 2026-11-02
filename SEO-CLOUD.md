# Google 只读云端接入

本批实现授权与每日采集。自动分析、修改代码及提交优化 PR 的 AI 执行任务尚未接入；不能把数据采集工作流称为完整 SEO 优化代理。

## 资源与执行位置

- 网站：https://guruholdings.net/
- GA4 媒体资源：542593473。报告按主机名过滤本站，避免混入同媒体资源的其他站点。
- GSC URL 前缀资源：https://guruholdings.net/
- Google Cloud 项目：gen-lang-client-0845981613。
- Vercel：处理授权回调、私有令牌与报告存储、受保护的采集接口。
- GitHub Actions：计划每天 02:00 UTC（北京时间 10:00）调用采集接口；平台调度可能延迟。

## 上线配置

当前只准备代码，未修改生产环境变量或创建存储资源。先验证预览部署，再由站点所有者批准生产上线。

1. 创建专用 **private** Vercel Blob store，并连接到目标项目。预览和生产必须隔离，不能让预览读取生产凭据。可用 BLOB_STORE_ID/OIDC，或为各环境配置独立 BLOB_READ_WRITE_TOKEN。
2. 仅在 Vercel 服务端配置以下变量，不得使用 NEXT_PUBLIC_ 前缀：

| 变量 | 来源或作用 |
|---|---|
| SEO_GOOGLE_CLIENT_ID | 用户下载的 Web application JSON |
| SEO_GOOGLE_CLIENT_SECRET | 同上，设为 Secret |
| SEO_PUBLIC_ORIGIN | https://guruholdings.net，无末尾斜杠 |
| SEO_TOKEN_KEY | 随机生成的 32 字节密钥，Base64；设为 Secret |
| SEO_CONNECT_SECRET | 单独随机生成的至少 32 字符管理员连接码；设为 Secret |
| SEO_JOB_SECRET | 独立随机生成的至少 32 字符采集口令；设为 Secret |

3. 部署含本批提交的生产版本。先核对实际生产分支：2026-11-02 仓库默认分支 master，但 Vercel 最新成功部署元数据来自 main；两分支当时同为 10913e461a901914b45a8e46ead656cf39909467。不得仅按旧文档假定发布分支。
4. 管理员访问 `/api/seo/google/connect`，输入连接码。Google 客户端必须注册 `https://guruholdings.net/api/seo/google/callback`。用户本人完成同意，授权只包含 analytics.readonly 与 webmasters.readonly。
5. 回调成功只证明指定 API 资源可访问。必须再手动调用一次采集接口，检查本站主机名、日期范围、数据量、HTTP 状态和耗时；空报告不能证明统计正常。
6. 把同一个 SEO_JOB_SECRET 保存到 GitHub Actions Secrets；手动采集验证后才设置仓库变量 SEO_COLLECTION_ENABLED=true。未设置时定时任务跳过。
7. 外部 OAuth 应用 Testing 状态下刷新令牌会有七天有效期限制。启用长期运行前核实发布状态；令牌撤销和过期均应通知所有者重新授权。不要绕过 Google 的授权或验证要求。

## 保存与访问

刷新令牌、报告均先经 AES-256-GCM 加密，再写入 private Blob。状态 Cookie 绑定随机 state、PKCE 和十分钟有效期，并设置 Secure、HttpOnly、SameSite=Lax。不得把密钥、JSON 配置、原始报告提交到公开仓库或工作流产物。

`POST /api/seo/daily` 要求 Authorization: Bearer SEO_JOB_SECRET，只有受控任务可以调用；失败仅返回通用状态，不输出 Google 原始错误或令牌。

采集结果包含当前和前期各 28 天汇总，以及当前前 500 个页面/搜索词机会样本，不宣称全量。GSC 使用已完成数据，保守排除最近三天；GA4 时区可能不同。原始报表保留在私有存储，可据证据另行分析，但不能把流量变化直接归因为某项优化。

## 检查与回退

新增 `npm run seo:cloud:test` 覆盖完整模拟授权/采集、权限拒绝、状态伪造、过期、加密用途隔离、官方 SDK 的实际授权请求参数以及日期边界。模拟测试不等同于真实 Google 授权。

上线前运行云端接入测试、类型检查、四语言检查、生产构建与现有 SEO 检查。真实 Google 授权和私有存储读写需在环境配置后补验。

本批同时把 Next.js 从 15.5.19 更新至同系列安全版本 15.5.28，并为其 PostCSS 及存储链 Zod 加入兼容的安全版本约束。最终生产依赖审计为 0 条公告；完整依赖树仍有 14 条开发工具的中等级公告，另行跟踪，不宣称整站没有安全风险。

回退：先把 SEO_COLLECTION_ENABLED 改为 false；回退本批生产部署；在 Google 账号中撤销本应用的授权；按需移除新增环境变量。新建存储保留至确认无需恢复后再处理；不覆盖已有统计配置。

## 下一阶段

读取私有报告、维护待审核优化清单、通过云端 AI 执行器实施小批次改进并提交 PR；配置模型调用预算与运行凭据后先人工触发实测，再启用每日优化。禁止未经审核自动合并上线，禁止用重复浏览、后台挂机或虚假事件拉高指标。
