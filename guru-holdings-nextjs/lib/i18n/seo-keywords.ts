import type { Locale } from './site';

export const seoKeywordMap: Record<Locale, Record<'home' | 'data' | 'manager' | 'stock', string[]>> = {
  en: {
    home: ['13F holdings tracker', 'institutional holdings', 'guru portfolios'],
    data: ['SEC 13F holdings', '13F filing data', 'institutional portfolio comparison'],
    manager: ['13F portfolio', 'quarterly holdings changes', 'investment manager holdings'],
    stock: ['institutional ownership', '13F stock holders', 'hedge fund holdings'],
  },
  zh: {
    home: ['13F 持仓追踪', '投资机构持仓', '投资大师持仓'],
    data: ['SEC 13F 数据', '机构持仓对比', '季度持仓变化'],
    manager: ['13F 持仓', '季度持仓变化', '投资机构持仓'],
    stock: ['机构持股', '哪些机构持有', '13F 股票持仓'],
  },
  ja: {
    home: ['13F 保有銘柄', '機関投資家 保有銘柄', '著名投資家 ポートフォリオ'],
    data: ['SEC 13F データ', '機関投資家 比較', '四半期 保有変化'],
    manager: ['13F ポートフォリオ', '保有銘柄 変化', '投資機関 保有銘柄'],
    stock: ['機関投資家 保有', '13F 銘柄 保有者', 'ヘッジファンド 保有銘柄'],
  },
  ko: {
    home: ['13F 보유종목', '기관투자자 보유종목', '유명 투자자 포트폴리오'],
    data: ['SEC 13F 데이터', '기관투자자 비교', '분기별 보유 변화'],
    manager: ['13F 포트폴리오', '보유종목 변화', '투자기관 보유종목'],
    stock: ['기관투자자 보유', '13F 종목 보유기관', '헤지펀드 보유종목'],
  },
};

export const financeGlossary = {
  '13F': { en: '13F filing', zh: '13F 报告', ja: '13F報告書', ko: '13F 보고서' },
  new: { en: 'New position', zh: '新增', ja: '新規取得', ko: '신규 매수' },
  increase: { en: 'Increased', zh: '增持', ja: '買い増し', ko: '비중 확대' },
  decrease: { en: 'Reduced', zh: '减持', ja: '保有縮小', ko: '비중 축소' },
  exit: { en: 'Exited', zh: '退出', ja: '全売却', ko: '전량 매도' },
  weight: { en: 'Portfolio weight', zh: '仓位占比', ja: 'ポートフォリオ比率', ko: '포트폴리오 비중' },
} as const;
