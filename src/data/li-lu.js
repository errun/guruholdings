const liLuData = {
  id: 'li-lu',
  overview: {
    name: {
      en: 'Li Lu',
      zh: '李录'
    },
    company: {
      en: 'Himalaya Capital',
      zh: '喜马拉雅资本'
    },
    avatar: '👨‍💼',
    description: {
      en: 'Value investor focused on deep fundamental research across the US and China.',
      zh: '价值投资大师，巴菲特的中国门徒，专注于中美两地的价值投资机会。'
    },
    highlights: [
      {
        en: 'Invests across both US and Chinese markets with deep research.',
        zh: '中美两地投资，深度研究驱动'
      },
      {
        en: 'Concentrated portfolio with relatively few positions.',
        zh: '集中投资，持仓数量相对较少'
      },
      {
        en: 'Heavy exposure to leading Chinese consumer and tech franchises.',
        zh: '重仓比亚迪等中国优质企业'
      }
    ]
  },
  lastUpdate: '2024Q3',
  totalValue: 4000000000,
  insights: {
    summary: {
      en: 'Li Lu materially added to BYD in Q3 2024 while trimming US bank exposure and introducing Alibaba to the portfolio.',
      zh: 'Q3季度李录大幅增持比亚迪，同时减持了部分银行股。整体投资风格依然集中，重点关注中国优质企业的美股ADR。'
    },
    keyChanges: [
      {
        en: 'BYD position expanded by 25%, now 45% of assets.',
        zh: '比亚迪持仓增加25%，占总持仓的45%'
      },
      {
        en: 'Reduced Wells Fargo holdings by 12%.',
        zh: '减持富国银行，持仓下降12%'
      },
      {
        en: 'Opened a $300M position in Alibaba.',
        zh: '新增阿里巴巴持仓，价值约3亿美元'
      }
    ],
    riskLevel: 'elevated',
    diversification: {
      en: 'Highly concentrated with the top three holdings at 78% of assets.',
      zh: '高度集中，前3大持仓占比78%'
    }
  },
  valueHistory: [
    { quarter: '2023Q4', value: 3200000000 },
    { quarter: '2024Q1', value: 3500000000 },
    { quarter: '2024Q2', value: 3800000000 },
    { quarter: '2024Q3', value: 4000000000 }
  ],
  holdings: [
    {
      symbol: 'BYDDY',
      companyName: {
        en: 'BYD Company',
        zh: '比亚迪'
      },
      currentShares: 45000000,
      currentValue: 1800000000,
      currentWeight: 45,
      quarters: {
        '2024Q3': {
          shares: 45000000,
          value: 1800000000,
          weight: 45,
          changeType: 'increase',
          changePercent: 25
        },
        '2024Q2': {
          shares: 36000000,
          value: 1368000000,
          weight: 36,
          changeType: 'increase',
          changePercent: 12.5
        },
        '2024Q1': {
          shares: 32000000,
          value: 1120000000,
          weight: 32,
          changeType: 'increase',
          changePercent: 6.7
        },
        '2023Q4': {
          shares: 30000000,
          value: 1050000000,
          weight: 30,
          changeType: 'increase',
          changePercent: 5
        }
      }
    },
    {
      symbol: 'WFC',
      companyName: {
        en: 'Wells Fargo',
        zh: '富国银行'
      },
      currentShares: 25000000,
      currentValue: 1000000000,
      currentWeight: 25,
      quarters: {
        '2024Q3': {
          shares: 25000000,
          value: 1000000000,
          weight: 25,
          changeType: 'decrease',
          changePercent: -12
        },
        '2024Q2': {
          shares: 28400000,
          value: 1136000000,
          weight: 29.89,
          changeType: 'unchanged',
          changePercent: 0
        },
        '2024Q1': {
          shares: 28400000,
          value: 994000000,
          weight: 28.4,
          changeType: 'unchanged',
          changePercent: 0
        },
        '2023Q4': {
          shares: 28400000,
          value: 980000000,
          weight: 30.6,
          changeType: 'unchanged',
          changePercent: 0
        }
      }
    },
    {
      symbol: 'BABA',
      companyName: {
        en: 'Alibaba Group',
        zh: '阿里巴巴'
      },
      currentShares: 4000000,
      currentValue: 320000000,
      currentWeight: 8,
      quarters: {
        '2024Q3': {
          shares: 4000000,
          value: 320000000,
          weight: 8,
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
    },
    {
      symbol: 'JD',
      companyName: {
        en: 'JD.com',
        zh: '京东'
      },
      currentShares: 8000000,
      currentValue: 240000000,
      currentWeight: 6,
      quarters: {
        '2024Q3': {
          shares: 8000000,
          value: 240000000,
          weight: 6,
          changeType: 'unchanged',
          changePercent: 0
        },
        '2024Q2': {
          shares: 8000000,
          value: 228000000,
          weight: 6,
          changeType: 'increase',
          changePercent: 14.3
        },
        '2024Q1': {
          shares: 7000000,
          value: 175000000,
          weight: 5,
          changeType: 'unchanged',
          changePercent: 0
        },
        '2023Q4': {
          shares: 7000000,
          value: 168000000,
          weight: 4.9,
          changeType: 'unchanged',
          changePercent: 0
        }
      }
    },
    {
      symbol: 'PDD',
      companyName: {
        en: 'PDD Holdings',
        zh: '拼多多'
      },
      currentShares: 2000000,
      currentValue: 200000000,
      currentWeight: 5,
      quarters: {
        '2024Q3': {
          shares: 2000000,
          value: 200000000,
          weight: 5,
          changeType: 'unchanged',
          changePercent: 0
        },
        '2024Q2': {
          shares: 2000000,
          value: 190000000,
          weight: 5,
          changeType: 'unchanged',
          changePercent: 0
        },
        '2024Q1': {
          shares: 2000000,
          value: 175000000,
          weight: 5,
          changeType: 'decrease',
          changePercent: -9.1
        },
        '2023Q4': {
          shares: 2200000,
          value: 182000000,
          weight: 5.6,
          changeType: 'increase',
          changePercent: 4.5
        }
      }
    }
  ]
}

export default liLuData
