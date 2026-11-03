# 第一轮：搜索身份、真实季度与可核验说明

日期：2026-11-03。范围是独立审核分支，不含生产合并、付费推广或对外联系。

## 具体问题与修改

- 旧股票元数据只采用发行人名称，普通证券、PUT/CALL以及同名不同证券可能重名。当前2002项中有157个名称重复余项；新搜索身份区分期权与必要的CUSIP，目录唯一性纳入回归检查。
- 机构与股票元数据未标明报告季度。新模板采用机构实际季度；股票采用实际有披露事件的最近季度，而不是统一套全站最新季度。Scion等旧季度页面必须保留其真实边界。
- 新增四语言`/methodology`，解释机构覆盖、日期、股数与权重变化、市场价值变化、公司归并、期权与数据限制，链接SEC一手资料和各机构页面。方法页不把估计价格写成真实成交价。
- 全站页脚提供方法入口；机构、证券、信号和方法页增加可见面包屑，并用相同内容生成BreadcrumbList。JSON-LD转义外部来源名称中的`<`，防止结束script标签注入。
- 方法页进入多语言sitemap。现有canonical、hreflang、重定向和访问边界保持验收，不把已有功能重复算为新增成果。

## 首批重点页面

首页、13F信号页；Berkshire、Himalaya、Bridgewater、ARK、Pershing、Scion、HHLR、Greenwoods；Alphabet、NVIDIA、Microsoft、Amazon、Coca-Cola、TSMC、Broadcom、Meta、Space Exploration、Cerebras。总计20个英语主题页，另抽查语言版本。个别证券名称按SEC原始披露展示，不补造ticker或公司简介。

私下审阅报告保留重点页面选择依据、实际GSC聚合样本和覆盖限制；完整Google报表、账号与任何密钥不进入公开仓库。

## 外部引用与候选渠道

本轮仅做盘点与筛选，没有外联。候选不是已获得链接，不承诺收录、排名或AI引用。重点条件候选为TerminalValue、whalstreet、Show HN、Product Hunt、Indie Hackers、awesome-quant、Quantocracy和Portfolio123，分别需要核实表单规则、编辑意愿或社区准入。

FinMasters官方联系页明确拒绝客座投稿和付费/赞助链接，不采用该推广路线。失效入口、自动访问限制和未确定收费均在本地清单保留，不能把未验证渠道写为可直接投放。GSC Links不由现有查询接口返回，浏览器访问需登录；公开空搜索也不能证明没有外链。本人GitHub README的链接仅算自有引用。

## 验证及边界

独立验证搜索身份、历史季度、四语言说明、JSON-LD转义；生产构建后检查36个本地页面和8084个sitemap URL，另用真实浏览器验收导航及手机布局。结构化数据仅描述可见内容，不保证富结果或AI引用。UA模拟可达性不能证明真实爬虫已访问或Google已收录。

生产发布仍需审阅本PR；新的对外发送、投稿或支出需要具体对象与成稿审核。下一轮先收集真实数据和可复核研究材料，不批量生成无依据的投资建议或购买操纵排名的链接。

官方依据：

- https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/essentials/spam-policies#link-spam
