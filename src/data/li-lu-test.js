const liLuData = {
  id: 'li-lu',
  overview: {
    name: {
      en: 'Li Lu',
      zh: 'Li Lu'
    },
    company: {
      en: 'Himalaya Capital',
      zh: 'Himalaya Capital'
    },
    avatar: '👨‍💼',
    description: {
      en: 'Value investor focused on deep fundamental research across the US and China.',
      zh: 'Value investor focused on deep fundamental research across the US and China.'
    },
    highlights: [
      {
        en: 'Invests across both US and Chinese markets with deep research.',
        zh: 'Invests across both US and Chinese markets with deep research.'
      },
      {
        en: 'Concentrated portfolio with relatively few positions.',
        zh: 'Concentrated portfolio with relatively few positions.'
      },
      {
        en: 'Heavy exposure to leading Chinese consumer and tech franchises.',
        zh: 'Heavy exposure to leading Chinese consumer and tech franchises.'
      }
    ]
  },
  lastUpdate: '2025Q2',
  totalValue: 4500000000,
  insights: {
    summary: {
      en: 'Li Lu continued strategic positioning in Q2 2025, maintaining BYD as core holding while expanding technology exposure amid Chinese market recovery.',
      zh: 'Li Lu continued strategic positioning in Q2 2025, maintaining BYD as core holding while expanding technology exposure amid Chinese market recovery.'
    },
    keyChanges: [
      {
        en: 'BYD remains core holding at 40% of portfolio, benefiting from EV market expansion.',
        zh: 'BYD remains core holding at 40% of portfolio, benefiting from EV market expansion.'
      },
      {
        en: 'Expanded Xiaomi position to $250M, capitalizing on smartphone and EV synergies.',
        zh: 'Expanded Xiaomi position to $250M, capitalizing on smartphone and EV synergies.'
      },
      {
        en: 'Portfolio value increased to $4.5B in Q2 2025, driven by Chinese tech recovery.',
        zh: 'Portfolio value increased to $4.5B in Q2 2025, driven by Chinese tech recovery.'
      }
    ],
    riskLevel: 'elevated',
    diversification: {
      en: 'Highly concentrated with the top three holdings at 78% of assets.',
      zh: 'Highly concentrated with the top three holdings at 78% of assets.'
    }
  },
  valueHistory: [
    { quarter: '2024Q3', value: 3800000000 },
    { quarter: '2024Q4', value: 4000000000 },
    { quarter: '2025Q1', value: 4200000000 },
    { quarter: '2025Q2', value: 4500000000 }
  ],
  holdings: [
    {
      symbol: 'BYDDY',
      companyName: {
        en: 'BYD Company',
        zh: 'BYD Company'
      },
      currentShares: 45000000,
      currentValue: 1800000000,
      currentWeight: 40.0,
      quarters: {
        '2025Q2': {
          shares: 45000000,
          value: 1800000000,
          weight: 40.0,
          changeType: 'unchanged',
          changePercent: 0
        },
        '2025Q1': {
          shares: 45000000,
          value: 1800000000,
          weight: 42.86,
          changeType: 'decrease',
          changePercent: -2.5
        },
        '2024Q4': {
          shares: 46000000,
          value: 1840000000,
          weight: 46,
          changeType: 'increase',
          changePercent: 5.0
        },
        '2024Q3': {
          shares: 44000000,
          value: 1760000000,
          weight: 46.3,
          changeType: 'increase',
          changePercent: 10.0
        }
      }
    }
  ],
  resources: {
    shareholderLetters: [],
    meetingTranscripts: []
  }
}

export default liLuData
