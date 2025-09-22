const buffettData = {
  id: 'buffett',
  overview: {
    name: {
      en: 'Warren Buffett',
      zh: '沃伦·巴菲特'
    },
    company: {
      en: 'Berkshire Hathaway',
      zh: '伯克希尔·哈撒韦'
    },
    avatar: '🧙‍♂️',
    description: {
      en: 'Legendary value investor known for holding high-quality companies for decades.',
      zh: '股神巴菲特，价值投资的代表人物，以长期持有优质公司股票而闻名。'
    },
    highlights: [
      {
        en: 'High portfolio concentration with over 80% in the top ten holdings.',
        zh: '持仓集中度高，前十大持仓占比超过80%'
      },
      {
        en: 'Focuses on consumer staples, financials, and mega-cap technology leaders.',
        zh: '偏爱消费品、金融、科技龙头�?
      },
      {
        en: 'Long-term owner of Apple, Coca-Cola and other blue-chip names.',
        zh: '长期持有苹果、可口可乐等经典股票'
      }
    ]
  },
  lastUpdate: '2025Q2',
  totalValue: 380000000000,
  insights: {
    summary: {
      en: 'Buffett started 2025 with strategic positioning, maintaining high cash reserves while selectively adding to energy and utility positions amid market uncertainty.',
      zh: '2025年初巴菲特保持战略性布局，维持高现金储备的同时，在市场不确定性中有选择性地增加能源和公用事业持仓�?
    },
    keyChanges: [
      {
        en: 'Apple position held steady at current levels, maintaining largest holding status.',
        zh: '苹果公司持仓保持稳定，维持第一大重仓股地位'
      },
      {
        en: 'Cash reserves remain elevated at $320B, providing flexibility for opportunities.',
        zh: '现金储备维持�?200亿美元高位，为投资机会提供灵活�?
      },
      {
        en: 'Added to Chevron position by 8% amid energy sector strength.',
        zh: '在能源板块走强背景下，雪佛龙持仓增加8%'
      }
    ],
    riskLevel: 'moderate',
    diversification: {
      en: 'High concentration: top five holdings represent 68% of the portfolio.',
      zh: '集中度较高，�?大持仓占�?8%'
    }
  },
  valueHistory: [
    { quarter: '2024Q2', value: 325000000000 },
    { quarter: '2024Q3', value: 340000000000 },
    { quarter: '2024Q4', value: 350000000000 },
    { quarter: '2025Q1', value: 365000000000 }
  ],
  holdings: [
    {
      symbol: 'AAPL',
      companyName: {
        en: 'Apple Inc.',
        zh: '苹果公司'
      },
      currentShares: 920000000,
      currentValue: 178000000000,
      currentWeight: 48.77,
      quarters: {
        '2025Q1': {
          shares: 920000000,
          value: 178000000000,
          weight: 48.77,
          changeType: 'increase',
          changePercent: 2.1
        },
        '2024Q4': {
          shares: 915560000,
          value: 174500000000,
          weight: 49.86,
          changeType: 'increase',
          changePercent: 15.2
        },
        '2025Q1': {
          shares: 795000000,
          value: 149800000000,
          weight: 44.06,
          changeType: 'increase',
          changePercent: 8.5
        },
        '2024Q4': {
          shares: 732500000,
          value: 125600000000,
          weight: 38.65,
          changeType: 'unchanged',
          changePercent: 0
        }
      }
    },
    {
      symbol: 'BAC',
      companyName: {
        en: 'Bank of America',
        zh: '美国银行'
      },
      currentShares: 1032852000,
      currentValue: 41314080000,
      currentWeight: 11.8,
      quarters: {
        '2025Q1': {
          shares: 1032852000,
          value: 41314080000,
          weight: 11.8,
          changeType: 'decrease',
          changePercent: -8.2
        },
        '2024Q4': {
          shares: 1125000000,
          value: 42750000000,
          weight: 12.57,
          changeType: 'decrease',
          changePercent: -5.1
        },
        '2024Q3': {
          shares: 1185000000,
          value: 40740000000,
          weight: 12.54,
          changeType: 'unchanged',
          changePercent: 0
        },
        '2024Q2': {
          shares: 1185000000,
          value: 40290000000,
          weight: 12.99,
          changeType: 'unchanged',
          changePercent: 0
        }
      }
    },
    {
      symbol: 'KO',
      companyName: {
        en: 'Coca-Cola',
        zh: '可口可乐'
      },
      currentShares: 400000000,
      currentValue: 24800000000,
      currentWeight: 7.09,
      quarters: {
        '2025Q1': {
          shares: 400000000,
          value: 24800000000,
          weight: 7.09,
          changeType: 'unchanged',
          changePercent: 0
        },
        '2024Q4': {
          shares: 400000000,
          value: 24000000000,
          weight: 7.06,
          changeType: 'unchanged',
          changePercent: 0
        },
        '2024Q3': {
          shares: 400000000,
          value: 23600000000,
          weight: 7.26,
          changeType: 'unchanged',
          changePercent: 0
        },
        '2024Q2': {
          shares: 400000000,
          value: 23100000000,
          weight: 7.45,
          changeType: 'unchanged',
          changePercent: 0
        }
      }
    },
    {
      symbol: 'CVX',
      companyName: {
        en: 'Chevron',
        zh: '雪佛�?
      },
      currentShares: 123100000,
      currentValue: 18465000000,
      currentWeight: 5.28,
      quarters: {
        '2025Q1': {
          shares: 123100000,
          value: 18465000000,
          weight: 5.28,
          changeType: 'unchanged',
          changePercent: 0
        },
        '2024Q4': {
          shares: 123100000,
          value: 18930000000,
          weight: 5.57,
          changeType: 'increase',
          changePercent: 2.1
        },
        '2024Q3': {
          shares: 120500000,
          value: 18315000000,
          weight: 5.64,
          changeType: 'unchanged',
          changePercent: 0
        },
        '2024Q2': {
          shares: 120500000,
          value: 17875000000,
          weight: 5.73,
          changeType: 'unchanged',
          changePercent: 0
        }
      }
    },
    {
      symbol: 'TSM',
      companyName: {
        en: 'Taiwan Semiconductor',
        zh: '台积�?
      },
      currentShares: 60000000,
      currentValue: 6000000000,
      currentWeight: 1.71,
      quarters: {
        '2025Q1': {
          shares: 60000000,
          value: 6000000000,
          weight: 1.71,
          changeType: 'new',
          changePercent: null
        },
        '2024Q4': {
          shares: 0,
          value: 0,
          weight: 0,
          changeType: 'none',
          changePercent: null
        },
        '2024Q3': {
          shares: 0,
          value: 0,
          weight: 0,
          changeType: 'none',
          changePercent: null
        },
        '2024Q2': {
          shares: 0,
          value: 0,
          weight: 0,
          changeType: 'none',
          changePercent: null
        }
      }
    }
  ],
  resources: {
    shareholderLetters: [
      {
        year: 2023,
        title: {
          en: '2023 Shareholder Letter',
          zh: '2023年致股东�?
        },
        description: {
          en: 'Buffett reflects on Berkshire’s performance and capital allocation during 2023.',
          zh: '巴菲特回顾伯克希尔在2023年的经营表现与资本配置策略�?
        },
        url: 'https://www.berkshirehathaway.com/letters/2023ltr.pdf'
      },
      {
        year: 2022,
        title: {
          en: '2022 Shareholder Letter',
          zh: '2022年致股东�?
        },
        description: {
          en: 'Highlights the resilience of Berkshire’s operating companies and investment discipline.',
          zh: '强调伯克希尔旗下运营公司与投资策略在2022年的韧性�?
        },
        url: 'https://www.berkshirehathaway.com/letters/2022ltr.pdf'
      },
      {
        year: 2021,
        title: {
          en: '2021 Shareholder Letter',
          zh: '2021年致股东�?
        },
        description: {
          en: 'Discusses Berkshire’s buyback program and long-term investment philosophy.',
          zh: '讨论伯克希尔的股份回购计划与长期投资理念�?
        },
        url: 'https://www.berkshirehathaway.com/letters/2021ltr.pdf'
      }
    ],
    meetingTranscripts: [
      {
        year: 2024,
        title: {
          en: '2024 Annual Meeting Transcript',
          zh: '2024年股东大会问答实�?
        },
        description: {
          en: 'Full Q&A from the 2024 Berkshire Hathaway annual meeting in Omaha.',
          zh: '2024年伯克希尔股东大会完整问答实录，来自奥马哈现场�?
        },
        url: 'https://www.berkshirehathaway.com/meetings/2024/2024meetingtranscript.pdf'
      },
      {
        year: 2023,
        title: {
          en: '2023 Annual Meeting Transcript',
          zh: '2023年股东大会问答实�?
        },
        description: {
          en: 'Detailed discussion of Berkshire’s holdings, insurance operations, and market outlook.',
          zh: '详尽记录伯克希尔在持仓、保险业务及市场展望方面的讨论�?
        },
        url: 'https://www.berkshirehathaway.com/meetings/2023/2023meetingtranscript.pdf'
      },
      {
        year: 2022,
        title: {
          en: '2022 Annual Meeting Transcript',
          zh: '2022年股东大会问答实�?
        },
        description: {
          en: 'Covers Buffett and Munger’s commentary on inflation, buybacks, and market volatility.',
          zh: '涵盖巴菲特与芒格对通胀、回购及市场波动的观点�?
        },
        url: 'https://www.berkshirehathaway.com/meetings/2022/2022meetingtranscript.pdf'
      }
    ]
  }
}

export default buffettData
