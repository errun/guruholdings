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
        zh: '偏爱消费品、金融、科技龙头股'
      },
      {
        en: 'Long-term owner of Apple, Coca-Cola and other blue-chip names.',
        zh: '长期持有苹果、可口可乐等经典股票'
      }
    ]
  },
  lastUpdate: '2024Q3',
  totalValue: 350000000000,
  insights: {
    summary: {
      en: 'Buffett increased his Apple stake again in Q3 2024 and initiated a new position in TSMC, keeping the portfolio concentrated in mega-cap tech and consumer franchises.',
      zh: 'Q3季度巴菲特继续增持苹果公司，同时新增了台积电的持仓。整体持仓更加集中于科技和消费龙头股。'
    },
    keyChanges: [
      {
        en: 'Apple position grew 15%, remaining the top holding.',
        zh: '苹果公司持仓增加15%，仍为第一大重仓股'
      },
      {
        en: 'Initiated a $4B stake in Taiwan Semiconductor.',
        zh: '新增台积电持仓，价值约40亿美元'
      },
      {
        en: 'Trimmed bank exposure with Bank of America down 8%.',
        zh: '减持银行股，美国银行持仓下降8%'
      }
    ],
    riskLevel: 'moderate',
    diversification: {
      en: 'High concentration: top five holdings represent 68% of the portfolio.',
      zh: '集中度较高，前5大持仓占比68%'
    }
  },
  valueHistory: [
    { quarter: '2023Q4', value: 310000000000 },
    { quarter: '2024Q1', value: 325000000000 },
    { quarter: '2024Q2', value: 340000000000 },
    { quarter: '2024Q3', value: 350000000000 }
  ],
  holdings: [
    {
      symbol: 'AAPL',
      companyName: {
        en: 'Apple Inc.',
        zh: '苹果公司'
      },
      currentShares: 915560000,
      currentValue: 174500000000,
      currentWeight: 49.86,
      quarters: {
        '2024Q3': {
          shares: 915560000,
          value: 174500000000,
          weight: 49.86,
          changeType: 'increase',
          changePercent: 15.2
        },
        '2024Q2': {
          shares: 795000000,
          value: 149800000000,
          weight: 44.06,
          changeType: 'increase',
          changePercent: 8.5
        },
        '2024Q1': {
          shares: 732500000,
          value: 125600000000,
          weight: 38.65,
          changeType: 'unchanged',
          changePercent: 0
        },
        '2023Q4': {
          shares: 732500000,
          value: 122300000000,
          weight: 38.10,
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
        '2024Q3': {
          shares: 1032852000,
          value: 41314080000,
          weight: 11.8,
          changeType: 'decrease',
          changePercent: -8.2
        },
        '2024Q2': {
          shares: 1125000000,
          value: 42750000000,
          weight: 12.57,
          changeType: 'decrease',
          changePercent: -5.1
        },
        '2024Q1': {
          shares: 1185000000,
          value: 40740000000,
          weight: 12.54,
          changeType: 'unchanged',
          changePercent: 0
        },
        '2023Q4': {
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
        '2024Q3': {
          shares: 400000000,
          value: 24800000000,
          weight: 7.09,
          changeType: 'unchanged',
          changePercent: 0
        },
        '2024Q2': {
          shares: 400000000,
          value: 24000000000,
          weight: 7.06,
          changeType: 'unchanged',
          changePercent: 0
        },
        '2024Q1': {
          shares: 400000000,
          value: 23600000000,
          weight: 7.26,
          changeType: 'unchanged',
          changePercent: 0
        },
        '2023Q4': {
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
        zh: '雪佛龙'
      },
      currentShares: 123100000,
      currentValue: 18465000000,
      currentWeight: 5.28,
      quarters: {
        '2024Q3': {
          shares: 123100000,
          value: 18465000000,
          weight: 5.28,
          changeType: 'unchanged',
          changePercent: 0
        },
        '2024Q2': {
          shares: 123100000,
          value: 18930000000,
          weight: 5.57,
          changeType: 'increase',
          changePercent: 2.1
        },
        '2024Q1': {
          shares: 120500000,
          value: 18315000000,
          weight: 5.64,
          changeType: 'unchanged',
          changePercent: 0
        },
        '2023Q4': {
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
        zh: '台积电'
      },
      currentShares: 60000000,
      currentValue: 6000000000,
      currentWeight: 1.71,
      quarters: {
        '2024Q3': {
          shares: 60000000,
          value: 6000000000,
          weight: 1.71,
          changeType: 'new',
          changePercent: null
        },
        '2024Q2': {
          shares: 0,
          value: 0,
          weight: 0,
          changeType: 'none',
          changePercent: null
        },
        '2024Q1': {
          shares: 0,
          value: 0,
          weight: 0,
          changeType: 'none',
          changePercent: null
        },
        '2023Q4': {
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
          zh: '2023年致股东信'
        },
        description: {
          en: 'Buffett reflects on Berkshire’s performance and capital allocation during 2023.',
          zh: '巴菲特回顾伯克希尔在2023年的经营表现与资本配置策略。'
        },
        url: 'https://www.berkshirehathaway.com/letters/2023ltr.pdf'
      },
      {
        year: 2022,
        title: {
          en: '2022 Shareholder Letter',
          zh: '2022年致股东信'
        },
        description: {
          en: 'Highlights the resilience of Berkshire’s operating companies and investment discipline.',
          zh: '强调伯克希尔旗下运营公司与投资策略在2022年的韧性。'
        },
        url: 'https://www.berkshirehathaway.com/letters/2022ltr.pdf'
      },
      {
        year: 2021,
        title: {
          en: '2021 Shareholder Letter',
          zh: '2021年致股东信'
        },
        description: {
          en: 'Discusses Berkshire’s buyback program and long-term investment philosophy.',
          zh: '讨论伯克希尔的股份回购计划与长期投资理念。'
        },
        url: 'https://www.berkshirehathaway.com/letters/2021ltr.pdf'
      }
    ],
    meetingTranscripts: [
      {
        year: 2024,
        title: {
          en: '2024 Annual Meeting Transcript',
          zh: '2024年股东大会问答实录'
        },
        description: {
          en: 'Full Q&A from the 2024 Berkshire Hathaway annual meeting in Omaha.',
          zh: '2024年伯克希尔股东大会完整问答实录，来自奥马哈现场。'
        },
        url: 'https://www.berkshirehathaway.com/meetings/2024/2024meetingtranscript.pdf'
      },
      {
        year: 2023,
        title: {
          en: '2023 Annual Meeting Transcript',
          zh: '2023年股东大会问答实录'
        },
        description: {
          en: 'Detailed discussion of Berkshire’s holdings, insurance operations, and market outlook.',
          zh: '详尽记录伯克希尔在持仓、保险业务及市场展望方面的讨论。'
        },
        url: 'https://www.berkshirehathaway.com/meetings/2023/2023meetingtranscript.pdf'
      },
      {
        year: 2022,
        title: {
          en: '2022 Annual Meeting Transcript',
          zh: '2022年股东大会问答实录'
        },
        description: {
          en: 'Covers Buffett and Munger’s commentary on inflation, buybacks, and market volatility.',
          zh: '涵盖巴菲特与芒格对通胀、回购及市场波动的观点。'
        },
        url: 'https://www.berkshirehathaway.com/meetings/2022/2022meetingtranscript.pdf'
      }
    ]
  }
}

export default buffettData
