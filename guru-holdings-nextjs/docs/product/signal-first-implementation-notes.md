# Signal-first backlog implementation notes

日期：2026-06-24

范围：记录本轮 P0 / P1 backlog 的数据与产品实现依据。产品方向继续以 `docs/product/signal-first-redesign-spec.md` 为准：先展示机构变仓信号，再提供 SEC 来源与明细验证。

## 数据原则

- 机构身份以 SEC EDGAR submissions 为 canonical source。
- 机构 logo 只使用可确认的官网资源 URL；不能确认时保留 `logoUrl: null`，并在 `logoFallbackReason` 记录原因。
- 股票与机构一句话描述维护在 source config 中，生成到快照后供四语种页面复用。
- 股票普通股与期权 / 可转债等非普通证券保持分离；普通股页面只提示相关证券存在，不合并计算。

## 新增机构 SEC 身份

| ID | 展示名 | SEC legal filer name | CIK | 最新已确认 13F filing |
| --- | --- | --- | --- | --- |
| `ark` | ARK Invest | ARK Investment Management LLC | `0001697748` | 2026-05-12 / `0001104659-26-059240` |
| `coatue` | Coatue Management | COATUE MANAGEMENT LLC | `0001135730` | 2026-05-15 / `0000919574-26-003501` |
| `icahn` | Icahn Capital | ICAHN CARL C | `0000921669` | 2026-05-15 / `0001539497-26-001469` |
| `third-point` | Third Point | Third Point LLC | `0001040273` | 2026-05-15 / `0001040273-26-000002` |
| `baupost` | Baupost Group | BAUPOST GROUP LLC/MA | `0001061768` | 2026-05-14 / `0001061768-26-000007` |
| `greenlight` | Greenlight Capital | DME Capital Management, LP | `0001489933` | 2026-05-15 / `0001172661-26-002341` |
| `oaktree` | Oaktree Capital | OAKTREE CAPITAL MANAGEMENT LP | `0000949509` | 2026-05-20 / `0000949509-26-000004` |
| `hhlr` | Hillhouse / HHLR Advisors | HHLR ADVISORS, LTD. | `0001762304` | 2026-05-15 / `0000919574-26-003551` |
| `greenwoods` | Greenwoods / Jinglin | Greenwoods Asset Management Hong Kong Ltd. | `0001848138` | 2026-05-08 / `0001848138-26-000008` |

Notes:
- Greenlight 的旧 SEC filer `GREENLIGHT CAPITAL INC` 最近 13F 停在 2024-02-14；本轮使用仍在更新的 `DME Capital Management, LP`，并保留 Greenlight / David Einhorn aliases。
- Icahn 的旧 `ICAHN CAPITAL LP` 13F 停在 2011；本轮使用当前仍在更新的 `ICAHN CARL C`。
- Baupost 模糊检索会返回旧 CIK `0001054420`，但当前 13F filer 是 `0001061768`。

## Logo 处理

已确认官网资源：

| ID | logoUrl |
| --- | --- |
| `ark` | `https://assets.ark-funds.com/media-12243148-2a3e-4996-9763-260f93905eb9/90a5283e-7d28-4d42-90cc-2a486d39fdd6/ark-logo-1-1.svg` |
| `coatue` | `https://www.coatue.com/favicon.jpg` |
| `third-point` | `https://www.thirdpoint.com/img/apple-touch-icon.png` |
| `oaktree` | `https://www.oaktreecapital.com/Assets/OaktreeCap/Images/favicon_1024x1024_1.png` |
| `hhlr` | `https://www.hillhouseinvestment.cn/wp-content/uploads/2024/01/Hillhouse_Primary_On_BG_Symbol_RGB_AW.jpg` |
| `greenwoods` | `https://www.greenwoodsasset.com/favicon.ico` |

未确认可靠官网 logo URL：

- `icahn`
- `baupost`
- `greenlight`
- 既有机构中的 Berkshire、Himalaya、Bridgewater、Pershing、Scion、Tiger、Palliser

这些机构页面显示 initials fallback，并暴露 fallback reason。

## UNH / Scion 数据结论

普通股页面使用 `UnitedHealth Group Inc.` common stock `91324P102`。相关期权行 `91324P102:CALL` 单独保留，不合并到普通股持仓。

当前 16 家机构跟踪集下：

| Quarter | holderCount | eventCount | totalShares | 说明 |
| --- | ---: | ---: | ---: | --- |
| 2025Q2 | 3 | 3 | 5,498,364 | Berkshire 新增 5,039,564；Scion 新增 20,000；Tiger 新增 438,800 |
| 2025Q3 | 3 | 4 | 5,645,796 | Berkshire 持平 5,039,564；Tiger 持平 438,800；Scion 退出 0；Greenwoods 新增 167,432 |

旧 7 家机构视角下，2025Q3 current holders 会从 3 降到 2，因为 Scion 从 20,000 股退出为 0 股。加入 P1 机构后，Greenwoods 在 2025Q3 新增 UNH，因此当前全量页面的 holderCount 是 3，但 Scion 仍必须显示为 `退出 / 0 股`。

## 路由说明

新增机构扩大股票覆盖后，部分普通股与可转债 / 其他证券生成相同公司 slug。路由生成规则已调整为：

- 既有普通股 slug 保持稳定。
- 新增证券若与已占用 slug 冲突，自动追加证券 ID 后缀。
- 个别明确可读覆盖仍保留在 `data-source/stock-slug-overrides.json`。

