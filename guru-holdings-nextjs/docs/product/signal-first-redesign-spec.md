# Signal-first 13F 重设计规格

日期：2026-06-24

输入审计：`docs/product/current-product-audit.md`

范围：本阶段只产出产品与设计规格，不修改生产代码。

## 产品定位

这个产品不应再像通用股票仪表盘，也不应只是宽泛的 13F 数据浏览器。它应被重设计为一个 Signal-first 的 13F 信号发现工具。

核心承诺：

- 英文：Track Top Institutions' Latest Portfolio Moves
- 中文：看清顶级机构最新变仓

目标用户最关心的问题：

- 哪些股票被顶级机构新买入。
- 哪些股票被多个顶级基金同时增持。
- 哪些股票被减持。
- 哪些股票被清仓。
- 哪些机构本季度组合变化最大。
- 每个信号是否能追溯到原始 SEC 13F 文件。

设计原则：

- 先展示信号，再展示仪表盘。
- 先展示最新季度，再展示历史背景。
- 先给出可读的变仓摘要，再提供原始表格。
- SEC 证据要靠近信号本身，而不是只放在页脚或折叠说明里。
- 英文、中文、日文、韩文页面必须保持同一套 Signal-first 语义。

## 1. 新首页结构

首页要成为快速进入信号发现的入口，而不是产品介绍页或机构目录页。

建议结构：

1. 顶部导航
   - 保留现有品牌、语言切换和响应式外壳。
   - 将主导航 `13F Data` 改为 `13F Signals`。
   - 增加一个主要入口：`Explore Signals`。

2. Signal-first 首屏
   - H1 使用精确口号：
     - 英文：`Track Top Institutions' Latest Portfolio Moves`
     - 中文：`看清顶级机构最新变仓`
   - 副文案用一句话说明产品：
     - “Discover new buys, increases, reductions, and exits from the latest SEC 13F filings.”
   - 搜索框必须直接可见，支持股票、ticker、CUSIP、机构搜索。
   - 四个核心信号模式作为分段控件直接出现：
     - New Buys
     - Increased
     - Reduced
     - Exited
   - 显示数据新鲜度条：
     - 最新季度
     - 覆盖机构数
     - 当前可用 filing 数
     - SEC 来源状态
     - 13F 延迟说明

3. 最新信号预览
   - Hero 下方第一个内容区应是紧凑的信号流。
   - 默认展示最新、可信度高的机构变仓。
   - 每张卡片展示机构、股票、动作、季度、变化幅度和 SEC 来源链接。

4. 多基金共振区
   - 将现有 consensus increases / reductions 重构为“被多个顶级机构同时变仓的股票”。
   - 四类动作应获得同等权重：
     - 多基金新买入
     - 多基金增持
     - 多基金减持
     - 多基金清仓

5. 变化最大的机构
   - 展示本季度组合变化最明显的机构。
   - 可按变仓数量、估算市值变化、组合权重变化排序。
   - 每张机构卡片链接到对应机构的最新变仓详情页。

6. 股票与机构发现
   - 保留更宽泛的查找能力，但放在信号区之后。
   - 文案应改为“查找某只股票或某家机构的变仓信号”，不要再使用“investment research search”这种泛化表达。

7. SEC 来源信任区
   - 说明信号来自哪里、SEC 13F 是什么、13F 数据存在披露延迟。
   - 展示来源覆盖情况和链接行为。

8. SEO 支撑区
   - 用简洁的多语言说明承接搜索流量。
   - 不要让首屏变成博客页或通用股票筛选器页面。

## 2. 新 Signal Dashboard 结构

现有 `/live-13f` 应重设计为主 Signal Dashboard。可以保留这个路由用于连续性和 SEO，但页面体验要从数据浏览器变成实时信号发现工作台。

建议页面名称：

- 英文：`13F Signals`
- 中文：`13F 变仓信号`

Dashboard 结构：

1. Dashboard 头部
   - 标题：`Latest 13F Signals`
   - 副标题展示最新可用季度、覆盖机构数、SEC 来源状态。
   - 在标题附近放紧凑来源信任提示。

2. 主信号模式标签
   - `All Moves`
   - `New Buys`
   - `Increased`
   - `Reduced`
   - `Exited`
   - `Multi-fund Moves`
   - `Biggest Institution Changes`

3. 信号搜索与筛选
   - 搜索框保持在页面顶部可见。
   - 筛选变成二级控制：
     - 机构
     - 股票或主题
     - 季度
     - 动作类型
     - 最少参与机构数
     - 最小市值或权重变化
     - SEC 来源可用性
   - 移动端将筛选收进抽屉。

4. 主信号流
   - 中央结果区应是信号列表或信号卡片，而不是股票、机构、共识结果三列并列。
   - 每个信号必须回答：
     - 发生了什么变化。
     - 哪家机构做了变化。
     - 哪只股票受到影响。
     - 变化有多大。
     - 是否有 SEC filing 支撑。

5. 桌面右侧洞察栏
   - 最新季度摘要。
   - 变化最大的机构。
   - 被多家基金重复变仓的股票。
   - SEC 来源状态。
   - 移动端把这些内容放到信号流下方的折叠区。

6. 深度分析工具
   - 现有 manager comparison 和 charts 移到信号流之后。
   - 这些模块应被定位为深入分析，而不是第一产品体验。

## 3. 修订后的股票详情页结构

股票页要优先回答：“顶级机构刚刚对这只股票做了什么？”

建议结构：

1. 信号化股票页头
   - 示例：`Alphabet: 5 tracked institutions changed exposure in 2026Q1`
   - 保留 ticker、公司名、CUSIP、主题，但不要让身份信息压过首屏信号摘要。

2. 股票信号摘要条
   - 新买入的机构数。
   - 增持的机构数。
   - 减持的机构数。
   - 清仓的机构数。
   - 净方向。
   - 最新季度和 SEC 证据状态。

3. 机构动作流
   - 将现有 “Who holds it and what changed this quarter” 直接放到摘要条下方。
   - 同时纳入当前持有人和已清仓机构。
   - 支持按动作分组或过滤：
     - New
     - Increased
     - Reduced
     - Exited
   - 每一行都要包含原始 SEC filing 链接或来源详情入口。

4. 多季度背景
   - 保留 `StockTrendChart`，但放到最新动作之后。
   - 定位为“这个信号如何演化”，而不是页面主要目的。

5. 原始证据与细节
   - 保留季度 holdings 详情、CUSIP 详情、SEC 提示。
   - 这些内容应折叠展示，并明确属于二级信息。

6. 相关信号
   - 展示同一批机构还变动了哪些股票。
   - 展示与当前股票类似的多基金变仓信号。

## 4. 修订后的机构详情页结构

机构页要优先回答：“这家机构刚刚改了什么仓位？”

建议结构：

1. 机构信号页头
   - 示例：`Berkshire Hathaway Latest Portfolio Moves`
   - 展示 lead investor、legal manager name、CIK、最新季度、filing 日期和来源。

2. 最新变仓摘要
   - 新建仓数量。
   - 增持数量。
   - 减持数量。
   - 清仓数量。
   - 最大增持。
   - 最大减持。
   - 最大新买入。
   - 最大清仓。

3. 最新动作流
   - 将完整 increased/new 和 reduced/exited 列表移到图表之前。
   - 使用分组标签：
     - New Buys
     - Increased
     - Reduced
     - Exited
   - 行内展示股票、ticker/CUSIP、动作、股数/市值/权重变化、SEC 来源。

4. 组合变化强度
   - 增加一个模块展示这家机构相对自身组合的变化程度。
   - 可用指标：
     - 发生变化的持仓数量。
     - 披露持仓中发生变化的比例。
     - 估算变化市值。
     - Top 10 concentration 变化。

5. 图表与历史背景
   - 保留 `ManagerCharts`。
   - 图表移动到最新信号流之后。
   - 标签语义应是“看到最新动作后的背景解释”。

6. 原始 holdings 和操作表
   - 保留 `ManagerOperationsTable` 和 raw holdings table。
   - 放在最新动作和图表之后。
   - 保留筛选能力，服务深度研究。

7. 来源信任区
   - 展示 CIK、filing accession/source XML、季度、filing 日期，以及该机构是否落后于站点最新季度。

## 5. 修订后的搜索结果页结构

搜索应从 entity-first 改成 signal-first。

建议搜索行为：

1. 搜索入口
   - 首页 hero 搜索。
   - Signal Dashboard 搜索。
   - 桌面端 header 搜索，移动端可用紧凑图标入口。

2. 搜索结果层级
   - 第一优先级：匹配的最新信号。
   - 第二优先级：匹配的股票。
   - 第二优先级：匹配的机构。
   - 第三优先级：历史或原始 holdings 匹配。

3. 搜索结果布局
   - 查询标题示例：`Signals for "NVDA"`。
   - 信号模式标签保持可见：
     - All
     - New
     - Increased
     - Reduced
     - Exited
   - 顶部结果卡片总结：
     - 最新季度。
     - 匹配机构数量。
     - 净方向。
     - SEC 来源覆盖。

4. 结果卡片
   - 股票查询：展示哪些机构变动了这只股票。
   - 机构查询：展示这家机构变动了哪些股票。
   - CUSIP 查询：展示匹配公司和信号历史。

5. 空结果状态
   - 说明是最新季度没有信号，还是没有匹配实体。
   - 给出扩展入口：
     - 全部最新信号
     - 全部机构
     - 全部股票

建议路由：

- 新增 `/search`
- 新增本地化路由：`/zh/search`、`/ja/search`、`/ko/search`

## 6. 首屏重设计

用户应在 5 秒内理解产品承诺，无需滚动。

桌面首屏要求：

- Header 中出现 `13F Signals` 导航。
- H1 使用精确口号。
- 显示最新季度数据新鲜度条。
- 搜索框直接可见。
- 四个信号模式控制：
  - New Buys
  - Increased
  - Reduced
  - Exited
- 至少可见三张最新信号卡片。
- 信号卡片附近可见 SEC 来源提示。

移动端首屏要求：

- 品牌、语言切换、紧凑菜单。
- H1 和一句话解释。
- 搜索框无需展开即可看到。
- 横向信号模式标签。
- 至少可见一张高价值信号卡。
- 数据新鲜度和来源说明压缩为一行，可点击展开。

推荐首屏顺序：

1. 口号。
2. 搜索。
3. 信号模式控制。
4. 数据新鲜度和来源条。
5. 信号预览卡片。

避免：

- 把搜索放在 manager profiles 之后。
- 在展示任何信号之前先堆通用统计。
- 首屏展示图表或原始表格。
- 用 “data explorer” 作为主产品标签。

## 7. 现有代码组件复用计划

优先复用已经支持新定位的数据工具和 UI 基础。

继续复用：

- `SiteShell`
- `Header`
- `Footer`
- `LanguageSelector`
- `Button`
- `Badge`
- `Card`
- `Input`
- `Select`
- `Table`
- `Alert`
- `Tooltip`
- `StockTrendChart`
- `ManagerCharts`
- `ManagerCompare`
- `ManagerOperationsTable`
- `lib/sec13f-lite.ts`
- `lib/holding-change.mjs`
- `lib/sec13f-view`
- `lib/stock-routes.ts`
- 现有 i18n 路由和本地化页面结构。

建议重构而不是替换：

- `HomePage`
  - 从通用 hero 和分区重排为 Signal-first hero 与信号流。
- `Live13FPage`
  - 改成 Signal Dashboard。
  - 复用搜索和筛选逻辑，但改变结果层级。
- `ExplorerSearch`
  - 保留数据匹配和筛选能力。
  - UI 改向信号标签和主信号流。
- `ExplorerSearchDisclosure`
  - 首页首屏不再使用折叠搜索。
  - 可保留给页面下方的二级查找模块。
- `StockPage`
  - 保留当前 manager action row 数据。
  - 增加顶部摘要并重排模块顺序。
- `ManagerPage`
  - 保留现有卡片、图表和表格。
  - 将最新动作列表移到图表密集区之前。

后续再判断：

- `components/holdings/*`
- `components/home/*`
- `hooks/useHoldingsData.ts`
- 旧 Buffett / Li Lu 静态数据文件

这些内容看起来不是当前 Signal-first 主产品的核心，不应主导本次重设计。

## 8. 需要新增的组件

建议新增组件：

- `SignalHero`
  - 首页首屏定位、搜索、信号标签、数据新鲜度条。

- `SignalModeTabs`
  - New、Increased、Reduced、Exited、All 的可复用分段控件。

- `SignalFeed`
  - 主信号列表或卡片网格。
  - 用于首页、Signal Dashboard、股票详情、机构详情和搜索。

- `SignalCard`
  - 单个信号项。
  - 展示股票、机构、动作、季度、变化幅度和 SEC 来源。

- `SignalSummaryStrip`
  - 紧凑的数量和净方向摘要。
  - 用于首页、股票页、机构页和 dashboard。

- `FilingFreshnessStrip`
  - 最新季度、当前 filing 数、滞后机构数、13F 延迟说明。

- `SecSourceTrustBlock`
  - 可复用的 SEC 证据和信任说明。

- `SourceLinkBadge`
  - 行内小型来源链接或状态控件，指向 source XML 或来源详情。

- `InstitutionMoverCard`
  - 展示机构的最新主要变仓和变化强度。

- `StockSignalSummary`
  - 股票专属的新买入、增持、减持、清仓摘要。

- `InstitutionMovesPanel`
  - 机构专属的分组最新动作面板。

- `SignalFilterDrawer`
  - 移动端 dashboard 和 search 的筛选抽屉。

- `SignalEmptyState`
  - 解释没有最新信号、没有实体匹配或没有 SEC 来源的情况。

可作为后续增强：

- `SignalSourceDrawer`
  - 展开 filing 证据详情。
- `RelatedSignals`
  - 类似变仓和相关股票。
- `SignalSeoBlock`
  - 位于产品体验下方的本地化 SEO 内容。

## 9. 保留的路由

为保持连续性、SEO 和已有索引，保留这些路由：

- `/`
- `/zh`
- `/ja`
- `/ko`
- `/live-13f`
- `/zh/live-13f`
- `/ja/live-13f`
- `/ko/live-13f`
- `/live-13f/[managerId]`
- `/zh/live-13f/[managerId]`
- `/ja/live-13f/[managerId]`
- `/ko/live-13f/[managerId]`
- `/stocks/[companyId]`
- `/zh/stocks/[companyId]`
- `/ja/stocks/[companyId]`
- `/ko/stocks/[companyId]`
- `/data-automation-check`
- `sitemap.ts`
- `robots.ts`
- 现有 stock alias redirects

保留路由不等于保留原有页面层级。内容和标签仍应改成 Signal-first。

## 10. 需要改变的路由

改变这些路由的体验和 metadata：

- `/`
  - 首页改成 Signal-first 入口。
  - 替换当前 hero 口号。
  - 搜索上移到首屏。

- 本地化首页
  - 应用等价的 Signal-first 结构和本地化口号。
  - 中文首页必须使用 `看清顶级机构最新变仓`。

- `/live-13f`
  - 从 `Verified 13F data explorer` 改成 `Latest 13F Signals`。
  - 信号流成为主结果区。
  - 更深的 explorer 和 comparison 工具下移。

- 本地化 `/live-13f`
  - 同样改变结构、标签和 metadata。

- `/live-13f/[managerId]`
  - 保持 URL，页面层级改为机构最新变仓优先。

- 本地化机构详情路由
  - 同样改变层级和来源信任文案。

- `/stocks/[companyId]`
  - 保持 URL，页面层级改为股票信号摘要优先。

- 本地化股票详情路由
  - 同样改变层级和 metadata。

## 11. 需要新增的路由

建议新增：

- `/signals`
  - 可选的 Signal Dashboard canonical route。
  - 如果新增，`/live-13f` 可继续作为兼容路由或重定向目标。
  - 实现前必须确定 canonical 策略，避免 SEO 重复。

- 本地化 signal 路由：
  - `/zh/signals`
  - `/ja/signals`
  - `/ko/signals`

- `/search`
  - 专用的 Signal-first 搜索结果页。

- 本地化 search 路由：
  - `/zh/search`
  - `/ja/search`
  - `/ko/search`

- `/institutions`
  - 可选机构目录，如果机构发现仍然重要。
  - 页面应展示最新变仓摘要，而不是只展示机构 profile cards。

- 本地化 institution directory 路由：
  - `/zh/institutions`
  - `/ja/institutions`
  - `/ko/institutions`

不要默认在 P0 中加入所有可选路由。先实现能让产品真正变成 Signal-first 的最小集合。

## 12. 移动端布局变化

移动端要优先支持快速扫描和单手筛选。

必需变化：

- 首页搜索框在首屏直接可见。
- 动作模式使用横向可滚动 signal tabs。
- `SignalCard` 使用单列布局。
- 信号卡片保持紧凑：
  - action badge
  - 股票
  - 机构数或机构名
  - 变化幅度
  - 季度和来源状态
- 复杂筛选进入 `SignalFilterDrawer`。
- 避免在首屏出现宽表格。
- 需要解释最新信号时，将密集表格转成卡片。
- 原始表格仍保留在页面更深处。
- Signal Dashboard 使用 sticky 或近似 sticky 的搜索和筛选控制。
- SEC 来源入口要可见但紧凑，例如 source badge 或 icon button。
- tabs、filters、source links 的触控目标要足够大。

移动端页面顺序：

1. 口号或页面标题。
2. 搜索。
3. 信号标签。
4. 数据新鲜度和来源行。
5. 信号流。
6. 筛选和深度分析。
7. 图表、表格、来源说明。

## 13. 多语言 SEO 影响

重设计会改变产品语义，因此 metadata 和本地化文案需要同步到 Signal-first。

必需 SEO 更新：

- 首页 title 和 description 聚焦 13F signals 和最新机构组合变仓。
- 合适位置使用精确中文口号：
  - `看清顶级机构最新变仓`
- 为这些概念补齐本地化表达：
  - 13F signals
  - latest portfolio moves
  - institutional buying
  - new positions
  - increased positions
  - reduced positions
  - exited positions
  - SEC filings
- 保持现有本地化路由和 `hreflang` 行为。
- 如果新增 `/signals`，必须定义它与 `/live-13f` 的 canonical 关系。
- 新增路由要更新 sitemap。
- 避免本地化 URL 下出现大段完全相同的英文内容。
- 股票和机构详情 metadata 要变成信号导向：
  - 股票页示例：`Alphabet 13F Signals: Top Institutions Buying, Reducing, and Exiting`
  - 机构页示例：`Berkshire Hathaway 13F Portfolio Moves: Latest Buys, Reductions, and Exits`
- SEC 来源说明应有可抓取文本，但放在核心产品体验之后。

中文 SEO 方向：

- 主要词：
  - `13F 变仓`
  - `机构持仓变化`
  - `顶级机构最新持仓`
  - `新建仓`
  - `增持`
  - `减持`
  - `清仓`
  - `SEC 13F 文件`

日文和韩文 SEO 应沿用同一语义结构，而不是简单复制英文表达。

## 14. SEC 来源信任区设计

SEC 信任层要可复用，并靠近信号展示。

组件名：

- `SecSourceTrustBlock`

紧凑版本：

- 最新季度。
- SEC EDGAR 来源标签。
- 当前 filing 可用的覆盖机构数。
- 13F 延迟说明。
- 来源详情入口。

展开版本：

- 季度。
- filing 日期或来源刷新日期。
- 机构 legal name。
- CIK。
- accession number，如数据可用。
- source XML 链接。
- filing type。
- 标准化说明：
  - 公司名和 ticker 可能为了可读性做标准化。
  - CUSIP 和 source rows 保留用于追溯。
- 延迟说明：
  - 13F filings 有披露延迟，不是实时交易数据。
- 投资免责声明：
  - 信号仅供信息参考，不构成投资建议。

放置规则：

- 首页：
  - 在最新信号预览附近显示紧凑 trust row。
- Signal Dashboard：
  - 页头显示紧凑 trust row，首屏信号流之后放展开 trust block。
- `SignalCard`：
  - 行内显示 `SEC Source` badge 或 source icon。
- 股票详情：
  - 摘要条显示来源状态，每行保留来源链接。
- 机构详情：
  - 页头和最新动作之后都要有来源块。
- 页脚：
  - 保留整体免责声明，但不能把页脚当作唯一来源解释。

交互模式：

- 点击 `SEC Source` 打开来源详情或直接跳转 SEC XML。
- 如果来源不可用，显示明确的 unavailable 状态，不要隐藏字段。
- 如果某机构落后于站点最新季度，在机构名和受影响信号旁显示 stale filing warning。

## 15. 实施优先级：P0 / P1 / P2

### P0：重定位核心体验

目标：一个版本内让站点立刻像 Signal-first 的 13F 信号发现工具。

P0 项：

- 用 `SignalHero` 替换首页首屏。
- 使用精确英文和中文口号。
- 搜索框上移到首屏并直接可见。
- 增加 New、Increased、Reduced、Exited 主信号标签。
- 创建可复用的 `SignalCard`、`SignalFeed`、`SignalModeTabs`。
- 将 `/live-13f` 转为主 Signal Dashboard，同时保留路由。
- 将最新信号流设为 dashboard 主内容。
- 增加 `FilingFreshnessStrip`。
- 增加紧凑版 `SecSourceTrustBlock`。
- 重排股票详情页，让信号摘要和机构动作流先于图表出现。
- 重排机构详情页，让最新动作先于图表和 raw holdings 出现。
- 将导航标签从 `13F Data` 改为 `13F Signals`。
- 更新首页和关键路由 metadata，使其符合 Signal-first 定位。
- 验证移动端首屏包含口号、搜索、标签、来源/新鲜度行和至少一个信号。

P0 验收标准：

- 首次访问用户能在 5 秒内判断这是 13F 信号发现工具。
- 用户不用打开 dropdown 就能选择 New、Increased、Reduced、Exited。
- 首屏展示的每个核心信号都有可见 SEC 来源状态。
- 股票和机构详情页在展示图表或原始表格前，先回答最新变仓问题。

### P1：强化发现和搜索

目标：让信号探索更深入、更精确。

P1 项：

- 新增 `/search` 和本地化搜索页。
- 增加 query-specific signal result summary。
- 增加移动端 `SignalFilterDrawer`。
- 增加 `InstitutionMoverCard`。
- 增加变化最大的机构模块。
- 增加多基金变仓排序和筛选。
- 增加最少机构数、最小市值/权重变化筛选。
- 在股票和机构详情页增加 related signals。
- 增加 analytics events：
  - signal tab changes
  - source link clicks
  - stock signal clicks
  - institution signal clicks
  - search queries
- 改进无结果和 stale filing 状态。

P1 验收标准：

- 搜索结果优先展示匹配信号，而不是先展示通用实体。
- 用户能发现哪些机构本季度组合变化最大。
- 移动端用户可以筛选，同时不丢失信号流上下文。

### P2：扩展高级研究价值

目标：增加高级研究工作流，但不削弱 Signal-first 首屏。

P2 项：

- 在 SEO 策略明确后，可新增 `/signals` canonical route。
- 可新增带信号摘要的 `/institutions` 目录。
- 增加展开版 `SignalSourceDrawer`。
- 增加可分享的 signal URL 或 anchors。
- 如果后续产品方向需要账户，可增加 watchlist 或 saved signals。
- 增加跨机构高级对比工作流。
- 增加更丰富的历史信号趋势页。
- 如有需要，增加 CSV/export 支持。
- 在核心产品体验下方增加更深入的多语言 SEO 内容。

P2 验收标准：

- 高级工作流可用，但首页和 dashboard 不重新退化成通用股票仪表盘。
- 新增路由有明确 canonical 和多语言 SEO 策略。
- 所有新增信号表面都保持来源可追溯。

## 最终设计方向

产品应先展示最新机构动作，再邀请用户进入深度分析。现有代码已经具备大量数据和 UI 基础，所以本次重设计重点不是推翻视觉系统，而是调整层级、文案、可复用信号组件、SEC 信任可见性和移动端扫描速度。

