const buffettData = {
  id: 'buffett',
  overview: {
    name: {
      en: 'Warren Buffett',
      zh: 'Warren Buffett'
    },
    company: {
      en: 'Berkshire Hathaway',
      zh: 'Berkshire Hathaway'
    },
    avatar: '🧙‍♂️',
    description: {
      en: 'Legendary value investor known for holding high-quality companies for decades.',
      zh: 'Legendary value investor known for holding high-quality companies for decades.'
    },
    highlights: [
      {
        en: 'High portfolio concentration with over 80% in the top ten holdings.',
        zh: 'High portfolio concentration with over 80% in the top ten holdings.'
      },
      {
        en: 'Focuses on consumer staples, financials, and mega-cap technology leaders.',
        zh: 'Focuses on consumer staples, financials, and mega-cap technology leaders.'
      },
      {
        en: 'Long-term owner of Apple, Coca-Cola and other blue-chip names.',
        zh: 'Long-term owner of Apple, Coca-Cola and other blue-chip names.'
      }
    ]
  },
  lastUpdate: '2025Q1',
  totalValue: 365000000000,
  insights: {
    summary: {
      en: 'Buffett started 2025 with strategic positioning, maintaining high cash reserves while selectively adding to energy and utility positions amid market uncertainty.',
      zh: 'Buffett started 2025 with strategic positioning, maintaining high cash reserves while selectively adding to energy and utility positions amid market uncertainty.'
    },
    keyChanges: [
      {
        en: 'Portfolio value increased to $365B in Q1 2025, up from $350B in Q4 2024.',
        zh: 'Portfolio value increased to $365B in Q1 2025, up from $350B in Q4 2024.'
      },
      {
        en: 'Cash reserves remain elevated at $320B, providing flexibility for opportunities.',
        zh: 'Cash reserves remain elevated at $320B, providing flexibility for opportunities.'
      },
      {
        en: 'Added to Chevron position by 8% amid energy sector strength.',
        zh: 'Added to Chevron position by 8% amid energy sector strength.'
      }
    ],
    riskLevel: 'moderate',
    diversification: {
      en: 'High concentration: top five holdings represent 68% of the portfolio.',
      zh: 'High concentration: top five holdings represent 68% of the portfolio.'
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
        zh: 'Apple Inc.'
      },
      currentShares: 915560000,
      currentValue: 174500000000,
      currentWeight: 49.86,
      quarters: {
        '2025Q1': {
          shares: 915560000,
          value: 174500000000,
          weight: 49.86,
          changeType: 'increase',
          changePercent: 15.2
        },
        '2024Q4': {
          shares: 795000000,
          value: 149800000000,
          weight: 44.06,
          changeType: 'increase',
          changePercent: 8.5
        },
        '2024Q3': {
          shares: 732500000,
          value: 125600000000,
          weight: 38.65,
          changeType: 'unchanged',
          changePercent: 0
        },
        '2024Q2': {
          shares: 732500000,
          value: 122300000000,
          weight: 38.1,
          changeType: 'unchanged',
          changePercent: 0
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
          zh: '2023 Shareholder Letter'
        },
        description: {
          en: 'Buffett reflects on Berkshire performance and capital allocation during 2023.',
          zh: 'Buffett reflects on Berkshire performance and capital allocation during 2023.'
        },
        url: 'https://www.berkshirehathaway.com/letters/2023ltr.pdf'
      }
    ],
    meetingTranscripts: [
      {
        year: 2024,
        title: {
          en: '2024 Annual Meeting Transcript',
          zh: '2024 Annual Meeting Transcript'
        },
        description: {
          en: 'Full Q&A from the 2024 Berkshire Hathaway annual meeting in Omaha.',
          zh: 'Full Q&A from the 2024 Berkshire Hathaway annual meeting in Omaha.'
        },
        url: 'https://www.berkshirehathaway.com/meetings/2024/2024meetingtranscript.pdf'
      }
    ]
  }
}

export default buffettData
