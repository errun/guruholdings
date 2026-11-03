import type { Locale } from './site';

type Methodology = { title: string; intro: string; coverage: string; dates: string; meaning: string;
  sections: { title: string; body: string }[]; sources: string; explore: string };

export const methodologyCopy: Record<Locale, Methodology> = {
  en: {
    title: '13F data sources and methodology',
    intro: 'Guru Holdings organizes public SEC EDGAR filings to support independent research into institutional portfolio changes.',
    coverage: 'Coverage', dates: 'How to read the dates', meaning: 'Report date = quarter-end holdings. Filing date = submission to the SEC. Holdings updated = changed site data. SEC checked = the last successful source verification. Market-data timestamps describe separate quotes.',
    sections: [
      { title: 'What does this site cover?', body: 'We track a selected set of managers identified by CIK, not the entire market. Managers can have different latest reporting quarters. A manager with an older report is not assumed to have zero current holdings.' },
      { title: 'How are changes calculated?', body: 'New, increased, reduced and exited positions compare disclosed share counts between available quarters. A portfolio weight can rise while share count falls. A change in reported market value is not net cash buying, realized profit or investment performance.' },
      { title: 'Why are 13F holdings delayed?', body: '13F generally reports quarter-end holdings and is filed up to 45 days later, subject to filing-calendar rules. Reports do not reveal current positions, exact trade dates or execution prices. The prices shown elsewhere are estimates from separate market data, not reported transaction prices.' },
      { title: 'How are companies and options grouped?', body: 'Configured company mappings and issuer aliases group security rows for company-level research; original CUSIPs remain visible. PUT and CALL positions are separate from share positions. Different securities from the same issuer may have different rights and prices, so grouped share counts do not describe one fungible security.' },
      { title: 'How can a result be verified?', body: 'Manager and stock details link to original SEC information tables. Updates independently check source hashes and holding calculations before publication. Source-fetch or validation failures preserve the previous published snapshot. Check the individual source and quarter before interpreting a signal.' },
      { title: 'What are the limitations?', body: 'Public 13F filings do not represent all assets, all managers or complete trading activity. This site does not determine investment suitability or provide buy/sell recommendations. The filing is authoritative if a display or company mapping differs from the source.' },
    ], sources: 'Primary sources', explore: 'Explore the disclosed holdings',
  },
  zh: {
    title: '13F 数据来源与计算方法', intro: 'Guru Holdings 整理 SEC EDGAR 公开披露，帮助用户独立研究机构持仓变化。',
    coverage: '数据覆盖', dates: '如何理解不同日期', meaning: '报告截止日代表季度末持仓；披露日期代表向 SEC 提交的日期；持仓更新代表本站数据内容变化；SEC 核验代表最近一次成功验证原文。市值等市场数据有独立的时间。',
    sections: [
      { title: '本站覆盖哪些机构？', body: '本站按 CIK 跟踪选定机构，并不覆盖全市场。不同机构的最新报告季度可能不同；某机构保留旧季度，不代表其当前持仓为零。' },
      { title: '新增、增持、减持和退出如何计算？', body: '依据可用相邻季度披露股数的变化分类。股数减少时，组合权重仍可能上升。披露市值的变化不是净买入金额、已实现利润或投资回报。' },
      { title: '为什么 13F 不是实时持仓？', body: '13F 通常反映季度末持仓，通常在季度结束后 45 天内提交，具体日期受披露日历规则影响。报告不能说明当前持仓、确切交易日或成交价格。站内另行展示的市场价格估算不等于机构披露的成交价。' },
      { title: '公司、证券和期权如何归并？', body: '公司层面的研究会使用已配置的证券映射及发行人别名归并行，原始 CUSIP 仍保留。PUT、CALL 与普通证券持仓分别展示。同一发行人的不同证券可能具有不同权利和价格，归并股数不代表单一可互换证券。' },
      { title: '如何验证结果？', body: '机构与股票详情保留 SEC 原始持仓表链接。数据发布前独立检查原文哈希与持仓计算；来源获取或校验失败时保留上一版。解读信号前，请核对具体机构、原文和所属季度。' },
      { title: '这些数据有什么限制？', body: '公开 13F 不包含所有资产、所有机构或完整交易活动。本站不判断投资适合性，也不提供买卖建议。页面或公司映射与披露不一致时，应以原文为准。' },
    ], sources: '一手资料', explore: '继续查看披露持仓',
  },
  ja: {
    title: '13Fデータの出典と計算方法', intro: 'Guru HoldingsはSEC EDGARの公開提出書類を整理し、機関の保有変化を独立して調査するための情報を提供します。',
    coverage: '対象範囲', dates: '日付の読み方', meaning: '報告基準日は四半期末の保有、提出日はSECへの提出日です。保有データ更新は内容の変更、SEC確認は原文の最終検証を示します。市場価格は別の時点のデータです。',
    sections: [
      { title: '対象となる機関', body: 'CIKで特定した一部の機関が対象で、市場全体ではありません。各機関の最新四半期は異なる場合があります。古い報告が残っていても、現在の保有がゼロという意味ではありません。' },
      { title: '保有変化の計算', body: '利用可能な隣接四半期の開示株数を比較します。株数が減っても構成比が上昇する場合があります。評価額の差は純購入額、実現利益、運用成績ではありません。' },
      { title: '開示の遅れ', body: '13Fは通常、四半期末の保有を四半期終了後45日以内に提出しますが、提出日程の規則が適用されます。現在の保有、正確な取引日、約定価格は分かりません。別の市場データによる推定価格は機関の約定価格ではありません。' },
      { title: '企業とオプションの区別', body: '企業単位の集計には設定済み証券マッピングと発行体の別名を使用し、元のCUSIPを保持します。PUTとCALLは株式と区別します。同一発行体の証券でも権利や価格は異なり、合算株数が単一の交換可能な証券を表すとは限りません。' },
      { title: '検証の方法', body: '詳細ページからSEC原本に移動できます。公開前に原文ハッシュと保有計算を独立検証し、取得や検証に失敗した場合は前回データを保持します。機関と四半期を原文で確認してください。' },
      { title: '制約', body: '13Fは全資産、全機関、全取引を含みません。投資適合性の判断や売買推奨を行いません。表示や企業マッピングに相違がある場合は原本を優先してください。' },
    ], sources: '一次資料', explore: '開示保有を調べる',
  },
  ko: {
    title: '13F 데이터 출처와 계산 방법', intro: 'Guru Holdings는 SEC EDGAR 공개 공시를 정리하여 기관 보유 변화를 독립적으로 조사할 수 있도록 돕습니다.',
    coverage: '데이터 범위', dates: '날짜를 읽는 방법', meaning: '보고 기준일은 분기 말 보유, 제출일은 SEC 제출 날짜입니다. 보유 데이터 갱신은 내용 변경, SEC 확인은 원문 검증 시각입니다. 시가총액 등 시장 데이터는 별도 시각을 사용합니다.',
    sections: [
      { title: '어떤 기관을 다루나요?', body: 'CIK로 식별한 일부 기관을 추적하며 전체 시장을 다루지 않습니다. 기관별 최신 보고 분기는 다를 수 있습니다. 이전 분기 공시가 남아 있다고 현재 보유가 없다는 뜻은 아닙니다.' },
      { title: '변화는 어떻게 계산하나요?', body: '이용 가능한 인접 분기의 공시 주식 수를 비교합니다. 주식 수가 줄어도 포트폴리오 비중은 늘 수 있습니다. 평가액 변화는 순매수 금액, 실현 이익 또는 투자 수익률이 아닙니다.' },
      { title: '왜 실시간 보유가 아닌가요?', body: '13F는 일반적으로 분기 말 보유를 분기 종료 후 45일 이내 제출하며 공시 달력 규칙이 적용됩니다. 현재 보유, 정확한 거래일과 체결 가격은 알 수 없습니다. 별도 시장 데이터에 근거한 가격 추정치는 기관의 체결 가격이 아닙니다.' },
      { title: '회사와 옵션은 어떻게 구분하나요?', body: '회사별 연구에는 설정된 증권 매핑과 발행인 별칭을 사용하며 원래 CUSIP을 유지합니다. PUT과 CALL은 주식과 구분합니다. 같은 발행인의 증권이라도 권리와 가격이 달라 합산 주식 수가 하나의 교환 가능한 증권을 뜻하지 않습니다.' },
      { title: '결과는 어떻게 검증하나요?', body: '상세 페이지에 SEC 원문 링크가 있습니다. 공개 전 원문 해시와 보유 계산을 독립 검증하고 수집이나 검증 실패 시 이전 데이터를 유지합니다. 해석 전 기관과 분기를 원문으로 확인하세요.' },
      { title: '한계는 무엇인가요?', body: '13F는 모든 자산, 기관 또는 거래를 포함하지 않습니다. 투자 적합성을 판단하거나 매매를 추천하지 않습니다. 화면이나 회사 매핑이 공시와 다르면 원문을 우선하세요.' },
    ], sources: '1차 자료', explore: '공시 보유 내역 살펴보기',
  },
};
