# Current Product Audit: Signal-first 13F Signal Discovery

Date: 2026-06-24

Product goal being evaluated: make the product feel like a Signal-first 13F signal discovery tool.

Target positioning:

- English slogan: Track Top Institutions' Latest Portfolio Moves
- Chinese slogan: 看清顶级机构最新变仓
- Core job: help users quickly see what top institutions are buying, increasing, reducing, and exiting based on the latest SEC 13F filings.

## Audit Evidence

Production site inspected: `https://guruholdings.net`

Codebase inspected: `C:\Users\edwin\Documents\augment-projects\guruHoldings\repo\guru-holdings-nextjs`

Primary files inspected:

- `app/(default)/page.tsx`, `app/[locale]/page.tsx`
- `app/(default)/live-13f/page.tsx`, `app/[locale]/live-13f/page.tsx`
- `app/(default)/stocks/[companyId]/page.tsx`, `app/[locale]/stocks/[companyId]/page.tsx`
- `app/(default)/live-13f/[managerId]/page.tsx`, `app/[locale]/live-13f/[managerId]/page.tsx`
- `components/site-pages/HomePage.tsx`
- `components/site-pages/Live13FPage.tsx`
- `components/site-pages/StockPage.tsx`
- `components/site-pages/ManagerPage.tsx`
- `components/explorer/ExplorerSearch.tsx`
- `components/explorer/ExplorerSearchDisclosure.tsx`
- `components/explorer/ManagerCompare.tsx`
- `components/explorer/ManagerOperationsTable.tsx`
- `lib/sec13f-lite.ts`
- `lib/holding-change.mjs`
- `lib/i18n/site.ts`
- `data-generated/snapshots/latest.json`

Production evidence captured:

- `docs/product/current-product-audit-assets/live/01-home-first-view.png`
- `docs/product/current-product-audit-assets/live/02-live13f-search-default.png`
- `docs/product/current-product-audit-assets/live/live-text-evidence.json`

Supplemental local preview evidence captured before the production URL was provided:

- `docs/product/current-product-audit-assets/01-home-first-view.png`
- `docs/product/current-product-audit-assets/02-live13f-search-default.png`
- `docs/product/current-product-audit-assets/03-live13f-search-nvda.png`
- `docs/product/current-product-audit-assets/04-stock-alphabet-first-view.png`
- `docs/product/current-product-audit-assets/text-evidence.json`

Screenshot limit: on `guruholdings.net`, the browser successfully captured the homepage first view and `/live-13f` first view. Production screenshots for the interacted search state, stock detail, manager detail, and Chinese homepage were not reliable in the browser automation session, so those views are grounded by production HTML/text evidence in `live-text-evidence.json`, code inspection, and the supplemental local preview screenshots where the rendered structure matched production.

## 1. Current Product Structure

The current product is a Next.js App Router site using static/generated SEC 13F snapshot data.

Core structure:

- `app/`: route entry points, with a default English route group and localized route segment.
- `components/site-pages/`: page-level product screens.
- `components/explorer/`: search, comparison, chart, and operation-table experiences.
- `components/layout/`: global header, footer, shell, language selector, error and not-found states.
- `components/ui/`: shadcn-style primitives: button, badge, card, input, table, select, alert, tooltip.
- `lib/i18n/`: multilingual messages, metadata, keywords, locale helpers.
- `lib/sec13f-lite.ts`: trims the large snapshot into search/comparison/chart-friendly view models.
- `lib/stock-routes.ts`: canonical stock slugs and legacy alias resolution.
- `data-generated/snapshots/latest.json`: current product data source for latest quarter, managers, stocks, consensus moves, company changes, holdings, SEC source links.
- `scripts/data/`: SEC 13F update and verification scripts.
- `scripts/routes/`: stock slug generation/checking.
- `scripts/i18n`, `scripts/seo`, `scripts/ui`: validation scripts.

Current dataset snapshot:

- Latest site quarter: `2026Q1`
- Tracked managers: `7`
- Stock/company search universe: `1,479`
- Shared increase signals: `10`
- Shared reduction signals: `24`
- Data source label: SEC EDGAR 13F filings

Manager coverage:

- Berkshire Hathaway
- Himalaya Capital
- Bridgewater Associates
- Pershing Square
- Scion Asset Management
- Tiger Global
- Palliser Capital

## 2. Existing Routes / Pages

Current route structure:

- `/`
  - English homepage.
  - Uses `HomePage`.
- `/zh`, `/ja`, `/ko`
  - Localized homepages.
  - Uses `HomePage` with locale.
- `/live-13f`
  - Main 13F data explorer.
  - Uses `Live13FPage`.
- `/zh/live-13f`, `/ja/live-13f`, `/ko/live-13f`
  - Localized 13F explorer.
- `/live-13f/[managerId]`
  - Institution / manager detail page.
  - Uses `ManagerPage`.
- `/zh/live-13f/[managerId]`, `/ja/live-13f/[managerId]`, `/ko/live-13f/[managerId]`
  - Localized institution detail pages.
- `/stocks/[companyId]`
  - Stock / company detail page.
  - Uses `StockPage`.
  - Canonical route uses generated slugs, with legacy aliases redirected.
- `/zh/stocks/[companyId]`, `/ja/stocks/[companyId]`, `/ko/stocks/[companyId]`
  - Localized stock detail pages.
- `/data-automation-check`
  - Default route-group operational verification page, Chinese title and copy.

Additional app-level outputs:

- `app/sitemap.ts`
- `app/robots.ts`
- middleware redirect for stock aliases under default and localized stock routes.

## 3. Existing Homepage Structure

Homepage first-view structure:

1. Sticky header
   - Logo mark and `Guru Holdings`.
   - Navigation: Home, 13F Data.
   - Language selector.
2. Hero band
   - Badge: `SEC EDGAR 13F`.
   - H1: `See What Top Funds Are Buying and Selling`.
   - Two stat cards: latest quarter and manager count.
3. Consensus moves this quarter
   - Left column: shared increases.
   - Right column: shared reductions.
   - Each card shows company, ticker/CUSIP, net share change, involved managers, action badge, weight transition, share delta.
   - CTA: view complete 13F data.
4. New and exited position signals
   - Shared new positions.
   - Shared exits.
5. Tracked manager profiles
   - Card grid for all managers.
   - Each card shows manager name, lead investor, latest quarter, increase/decrease/new counts, link to manager detail.
6. Search
   - Section title: investment research search.
   - Search is collapsed behind `Open stock and manager search`.
7. Footer
   - SEC source and investment advice disclaimer.

Signal-first read:

- The homepage already leads with consensus increases and reductions, which supports signal discovery.
- The hero slogan is close but not the requested slogan. It says what funds are buying and selling, not explicitly "latest portfolio moves."
- The latest-quarter proof is visible, but filing freshness, reporting delay, and which managers are stale are not visible in the first decision area.
- Search is placed after consensus and manager sections, and is collapsed. A user looking for a stock or manager cannot search immediately from the homepage first screen.

## 4. Existing Search Flow

Search appears in two contexts:

- Homepage: `ExplorerSearchDisclosure`, collapsed by default.
- `/live-13f`: `ExplorerSearch`, visible near the top of the page.

Search inputs and filters:

- Text search by ticker, company, manager, or CUSIP.
- Manager filter.
- Change type filter:
  - New positions
  - Increases
  - Reductions
  - Exits
  - Unchanged
- Theme filter.
- Concentration filter.

Search outputs:

- Stock results.
  - Company name, ticker/CUSIP, manager count, combined value, top holder action badges.
- Manager results.
  - Manager name, lead investor, total value, Top 10 weight, concentration, latest quarter.
- Consensus moves.
  - Company name, CUSIP, shared increase/reduction badge, manager count, net share and market value change.

Observed flow from production page structure and supplemental interaction capture:

- `/live-13f` opens with the search box visible and usable.
- Searching `NVDA` narrows results to:
  - 2 stock results.
  - 0 manager results.
  - 1 consensus move.
- The result layout is clear, but the default result order is broad research-oriented. It does not first answer "which top institutions bought, increased, reduced, or exited this in the latest quarter?"

Signal-first read:

- Strong: search can combine text query with action filters.
- Strong: consensus moves are part of the result set.
- Weak: action filters are dropdowns, so the four key signal modes are not immediately scannable as primary controls.
- Weak: stock results and manager results visually compete with consensus moves; the user must interpret three columns instead of seeing one signal feed first.
- Weak: no dedicated "latest signals" default mode with buying/increasing/reducing/exiting tabs.

## 5. Existing Stock Detail Page Structure

Example inspected: `/stocks/alphabet`.

First-view structure:

1. Back link to 13F data.
2. Stock identity:
   - ticker badge, theme badge.
   - company name.
   - CUSIPs and short explanation.
3. Header stats:
   - current managers.
   - latest reporting quarter.
4. Main signal section:
   - `Who holds it and what changed this quarter`.
   - Action rows per manager.
   - Each row includes manager, lead investor, quarter, action badge, weight transition, explanatory sentence, share delta, SEC source link.

Lower-page structure:

- Four-quarter trend chart.
- Historical and source details.
- Quarterly holdings details disclosure.
- Raw CUSIP details disclosure.
- SEC data source alert.

Signal-first read:

- Strong: the first content section is directly about who changed position this quarter.
- Strong: action badges and signed deltas make manager-level movement understandable.
- Strong: exits/new positions are modelled as explicit actions, not only numeric deltas.
- Weak: the page title is still stock-first, not signal-first. It starts with "Alphabet Inc." rather than a summary such as "5 top institutions changed Alphabet in Q1 2026."
- Weak: there is no compact top summary of buy/increase/reduce/exit counts for this stock above the rows.
- Weak: the rows are manager-centric and require scanning each row to understand aggregate direction.
- Weak: "current managers" can hide exited managers because an exit is not a current holder, even though exits are critical signal events.

## 6. Existing Institution Detail Page Structure

Example inspected: `/live-13f/berkshire`.

Rendered text evidence shows this structure:

1. Back link to 13F data.
2. Latest quarter badge.
3. Institution name.
4. Intro with manager legal name and CIK.
5. SEC source XML button.
6. Metric cards:
   - company-level holdings.
   - Top 10 weight.
   - new / increased count.
   - exited / reduced count.
7. Largest increase and largest reduction insight cards.
8. Trends and portfolio structure:
   - total value trend.
   - holdings count trend.
   - quarterly action counts.
   - top holdings weight.
   - theme allocation.
9. Four-quarter summary table.
10. Increased / new this quarter.
11. Reduced / exited this quarter.
12. Quarterly operations table with filters.
13. Complete raw holdings table.
14. SEC filing source alert.
15. Next manager CTA.

Signal-first read:

- Strong: manager detail has the right source material for a signal page.
- Strong: new/increased and exited/reduced counts are visible near the top.
- Strong: largest increase and largest reduction are prominent before the charts.
- Weak: the flow quickly shifts into portfolio structure and historical charts before exposing the full latest action feed.
- Weak: "Increased / new this quarter" and "Reduced / exited this quarter" appear after charts and a four-quarter table, so latest moves are not the dominant page narrative.
- Weak: the key user question "What did Berkshire just change?" is partially answered by two insight cards, but not by a complete first-screen latest-moves feed.

## 7. Existing Reusable Components

Page-level components:

- `HomePage`
- `Live13FPage`
- `StockPage`
- `ManagerPage`

Signal and explorer components:

- `ExplorerSearch`
- `ExplorerSearchDisclosure`
- `ManagerCompare`
- `ManagerOperationsTable`
- `ManagerCharts`
- `StockTrendChart`

Layout components:

- `SiteShell`
- `Header`
- `Footer`
- `LanguageSelector`
- `Analytics`
- `ErrorState`
- `NotFoundState`

UI primitives:

- `Button`
- `Badge`
- `Card`
- `Input`
- `Select`
- `Table`
- `Alert`
- `Tooltip`

Older / likely legacy holdings components still present:

- `components/holdings/AIInsights.tsx`
- `components/holdings/DataNotice.tsx`
- `components/holdings/HoldingsChart.tsx`
- `components/holdings/HoldingsTable.tsx`
- `components/holdings/ResourcesSection.tsx`
- `components/home/GuruCard.tsx`
- `components/home/ShareholderLetters.tsx`
- `hooks/useHoldingsData.ts`
- `data/buffett.ts`
- `data/li-lu.ts`
- `data/buffett-letters.ts`

Design system observations:

- Visual tone is restrained and research-oriented.
- Cards, badges, tables, and charts dominate.
- Green/red directional colors already support movement semantics.
- The interface is usable and calm, but the amount of card/table structure can make it feel like a generic financial dashboard rather than a sharp signal discovery tool.

## 8. What Currently Feels Like A Generic Stock Dashboard

The current product feels generic in these areas:

1. Brand and slogan
   - `Guru Holdings` and "Verified 13F data explorer" sound like a data portal.
   - The requested slogan "Track Top Institutions' Latest Portfolio Moves" is not the homepage H1.
   - Chinese homepage says "洞见机构仓位动向", which is directionally correct but not the requested "看清顶级机构最新变仓".

2. Homepage hierarchy
   - Hero has title plus stats, then a broad consensus section.
   - It does not immediately frame the page as "latest portfolio moves from top institutions."
   - The first 5 seconds do not expose a crisp signal control set: Buying / Increasing / Reducing / Exiting.

3. Search language
   - Search title is "Investment research search".
   - This is broader than signal discovery.
   - The search experience feels like lookup/research, not "find the latest institutional move."

4. Live 13F page language
   - Title is "Verified 13F data explorer".
   - It emphasizes data validity and coverage more than latest signals.

5. Institution pages
   - Heavy use of portfolio structure, charts, quarter summary, and complete holdings.
   - These are useful, but they compete with the latest action feed.

6. Stock pages
   - Stock identity and current holder stats lead the page.
   - The signal section is present, but the top summary is still stock-detail oriented.

7. Manager cards
   - Manager grid feels like directory navigation.
   - It lists counts, but does not show the actual most important current moves on the card.

8. Tables and charts
   - Extensive raw tables and trend charts make the product feel analyst-heavy.
   - Signal-first products usually lead with decisions and deltas, then allow drilling into raw evidence.

## 9. What Currently Supports Signal-first Positioning

The product already has meaningful Signal-first foundations:

1. Homepage consensus moves
   - Shared increases and shared reductions are shown above manager profiles.
   - Cards include involved managers, share deltas, weight transitions, and count badges.

2. New / exit modeling
   - New positions and exits are explicit `changeType` values.
   - They appear in filters, badges, homepage position signals, stock rows, manager cards, and manager detail.

3. Latest quarter is visible
   - Homepage and live page show Q1 2026.
   - Manager pages warn when a manager trails the site-wide latest quarter.

4. SEC evidence is present
   - Detail pages link to SEC source XML.
   - Footer and source alerts explain 13F delay and data provenance.

5. Search supports signal filters
   - Users can filter by new, increase, decrease, exit, unchanged.

6. Stock detail page has strong manager action rows
   - It directly answers "who holds it and what changed this quarter."

7. Manager detail page has largest increase / largest reduction cards
   - It gives a first useful signal before detailed charts.

8. `latest.json` data model is signal-ready
   - It includes latest company changes, quarterly company changes, consensus shared increases/decreases, new/exit managers, weight changes, value changes, and SEC sources.

## 10. What Blocks Users From Seeing Latest Institutional Signals Within 5 Seconds

Main blockers:

1. No visible four-mode signal switch on the homepage
   - Buying / Increasing / Reducing / Exiting is the mental model in the positioning.
   - The UI uses shared increases/reductions plus new/exits lower down, but does not present the four modes as the main control.

2. Search is hidden on the homepage
   - The homepage search is collapsed behind a button and placed after manager cards.
   - Users cannot immediately type a stock, manager, or CUSIP from the first screen.

3. Current hero is not the core slogan
   - "See What Top Funds Are Buying and Selling" is close, but does not fully communicate latest portfolio moves across buy, increase, reduce, exit.

4. Data freshness is under-explained in the first screen
   - Latest quarter is visible.
   - Filing dates, 13F delay, stale manager status, and "latest available" nuance are not visible at the signal level.

5. Consensus cards are dense
   - They show valuable data, but the user has to parse multiple rows, badges, weights, share changes, and counts.
   - The card does not start with a natural-language signal summary.

6. Manager-level actions are split across pages
   - Homepage shows consensus by stock.
   - Manager details show manager moves.
   - There is no single latest institutional signal feed that users can scan across top institutions.

7. Live page default results are mixed
   - Stock results, manager results, and consensus moves have equal visual weight.
   - For Signal-first positioning, consensus/latest moves should be the default primary output.

8. Manager detail buries complete latest move lists
   - The page shows counts and largest moves early, but complete increased/new and reduced/exited sections come after charts and historical tables.

9. Terminology is split
   - "Verified 13F data explorer", "Investment research search", "Tracked manager profiles", and "Consensus moves" describe different product concepts.
   - A Signal-first product needs one consistent concept: latest portfolio moves / 最新变仓信号.

10. Mobile first-screen risk
   - Based on the structure, mobile users will see the hero and stats before most signal cards.
   - Search and filters will likely be even further down.

## 11. What Should Be Redesigned Before Implementation

Redesign these before changing code:

1. Homepage first screen
   - Replace current hero with the exact positioning:
     - English: Track Top Institutions' Latest Portfolio Moves
     - Chinese: 看清顶级机构最新变仓
   - Make the first screen a signal discovery surface, not only a title plus stats.
   - Add a visible search input in the first screen.
   - Add primary signal mode controls:
     - Buying / New
     - Increasing
     - Reducing
     - Exiting
   - Show latest quarter and manager coverage in one compact freshness strip.

2. Signal feed model
   - Define one reusable "Latest Institutional Signal" card/list item.
   - Each signal should answer:
     - Which institution?
     - Which stock/company?
     - What action?
     - How large was the change?
     - Which quarter and filing date?
     - Why should I trust it? SEC link or filing evidence.

3. Homepage consensus cards
   - Keep shared increases/reductions, but reframe them as signal groups.
   - Add short summaries before dense numeric rows, for example:
     - "Berkshire and Bridgewater both increased Alphabet in Q1 2026."
   - Separate "shared new" and "shared exit" into equal first-class groups, not a lower secondary section.

4. Search experience
   - Rename "Investment research search" to a signal-first label.
   - Replace dropdown-first action filtering with visible tabs or segmented controls for:
     - All moves
     - New
     - Increased
     - Reduced
     - Exited
   - Make consensus/latest move results the default primary column.
   - Move stock and manager lookup to secondary sections.

5. `/live-13f` page
   - Reposition from "data explorer" to "latest 13F signal explorer".
   - Put latest moves feed first.
   - Move manager comparison, data source, theme changes, and raw tables lower as analysis tools.

6. Stock detail page
   - Add a signal summary band above the action rows:
     - managers increased
     - managers reduced
     - managers opened
     - managers exited
     - net direction
   - Include prior holders/exits in the top summary, not only current managers.
   - Make the page headline signal-aware:
     - "Alphabet: 5 tracked institutions changed exposure in Q1 2026."

7. Institution detail page
   - Move full latest move lists above charts.
   - Keep charts as supporting context below the latest action feed.
   - Add a top "latest moves by this institution" module grouped by:
     - New
     - Increased
     - Reduced
     - Exited
   - Show filing date next to each group.

8. Navigation and labels
   - Rename nav `13F Data` to something closer to signals, such as `13F Signals` or localized equivalent.
   - Make language-specific slogans exact and consistent.

9. Data freshness and trust treatment
   - Add a compact, reusable freshness component:
     - latest quarter
     - filing date range
     - number of managers current
     - stale manager count
     - "13F delayed, not real-time" disclaimer.
   - Place it near signal results rather than only in footer/detail alerts.

10. Reusable component cleanup
   - Decide whether older `components/holdings/*`, `components/home/*`, `hooks/useHoldingsData.ts`, and older Buffett/Li Lu data are still part of the active product.
   - If they are legacy, keep them out of redesign decisions or remove in a later cleanup task.

11. Accessibility and responsive design pass
   - Keep semantic headings, visible labels, and keyboard-friendly controls.
   - Replace some native dropdowns with clearer segmented controls only if keyboard and screen-reader behavior remains strong.
   - Verify mobile first-view: slogan, search, signal tabs, and at least one latest signal should fit without excessive scrolling.

## Overall Assessment

The current product is already more than a generic stock dashboard at the data-model level. It has consensus moves, manager-level change types, SEC evidence, stock action rows, and institution move counts. The main gap is product framing and first-screen hierarchy.

Today it feels like a verified 13F data explorer with useful signal sections. To feel like a Signal-first discovery tool, it should lead with latest institutional actions, make the four signal modes visible immediately, and push generic portfolio structure, charts, and raw tables into supporting layers.

Recommended redesign priority before implementation:

1. Homepage first screen and slogan.
2. Unified latest signal card/feed.
3. Search default mode and action tabs.
4. Stock detail signal summary.
5. Institution detail latest-moves-first hierarchy.
