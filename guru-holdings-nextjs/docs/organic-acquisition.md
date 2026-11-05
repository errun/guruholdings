# 自然搜索新增用户考核

用于补齐考核2：首次通过自然搜索获取的新增用户数。沿用Google官方只读授权，在现有私有POST /api/seo/daily增加固定view=acquisition，不增加Google权限、依赖、前台采集脚本或费用。

固定使用newUsers，firstUserDefaultChannelGroup严格为Organic Search；限定两个正式主机，排除firstUserSource以codex_开头的测试来源。首次获客和当前会话来源分开，不能用自然搜索会话、newSessions、activeUsers或first_visit次数替代新增用户。此口径也不代表已经识别真人。

每次按America/Los_Angeles解析一次绝对日期，6项查询为最近7个完整日/前7日、最近28日/前28日的4个直接总数，以及28日逐日和前100来源样本。最多3项并发，主表直接采用Google周期总数，不把来源或日期分项相加替代。近期完整日仍可能修订；跨发布日比较要另外排除发布当天，相邻多批修改不能各自归因。

新模式使用原有管理员口令、加密授权存储、no-store/noindex和通用错误。无授权或错误口令在读取Google授权前拒绝；不覆盖保存的日报，不接受任意资源/指标/过滤器。独立查询失败保留其余结果，抽样、隐私阈值、截断、汇总限制及资源时区差异均标记。显式0保留为0；无返回行、缺失或无效总数保留null及原因。

本地采集入口scripts/seo/collect-acquisition.py，仅从指定本机配置读取既有SEO_JOB_SECRET，发送到固定正式域名，不输出或下载Google凭据。默认配置路径.private/vercel-env.json、输出reports/organic-acquisition-latest.json均相对运行目录；只保存4周期总数、28个逐日、前30来源和完整性信息。自检参数--self-test不读配置、不访问网络。源/媒介会去除查询字符串并遮蔽邮箱及疑似凭据。

审核阶段通过合成依赖和独立HTTP夹具验证，不将其当真实Google数据。Vercel预览不绑定生产Google密钥/私有存储；真实6项Google调用和新增用户读数需在本批获得生产批准后验收，不能提前宣称精准统计已可用。发布后沿用既有7天体验/28天SEO复盘，无需新增自动任务。

官方定义：https://developers.google.com/analytics/devguides/reporting/data/v1/predefined-reports
