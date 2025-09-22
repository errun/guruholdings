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
  lastUpdate: '2025Q2',
  totalValue: 380000000000,
  insights: {
    summary: {
      en: 'Buffett continued strategic positioning in Q2 2025, with selective additions to technology and financial positions while maintaining substantial cash reserves for future opportunities.',
      zh: 'Buffett continued strategic positioning in Q2 2025, with selective additions to technology and financial positions while maintaining substantial cash reserves for future opportunities.'
    },
    keyChanges: [
      {
        en: 'Portfolio value increased to $380B in Q2 2025, up from $365B in Q1 2025.',
        zh: 'Portfolio value increased to $380B in Q2 2025, up from $365B in Q1 2025.'
      },
      {
        en: 'Cash reserves remain elevated at $310B, providing flexibility for strategic acquisitions.',
        zh: 'Cash reserves remain elevated at $310B, providing flexibility for strategic acquisitions.'
      },
      {
        en: 'Increased Apple position by 5% as technology valuations became more attractive.',
        zh: 'Increased Apple position by 5% as technology valuations became more attractive.'
      }
    ],
    riskLevel: 'moderate',
    diversification: {
      en: 'High concentration: top five holdings represent 68% of the portfolio.',
      zh: 'High concentration: top five holdings represent 68% of the portfolio.'
    }
  },
  valueHistory: [
    { quarter: '2024Q3', value: 340000000000 },
    { quarter: '2024Q4', value: 350000000000 },
    { quarter: '2025Q1', value: 365000000000 },
    { quarter: '2025Q2', value: 380000000000 }
  ],
  holdings: [
    {
      symbol: 'AAPL',
      companyName: {
        en: 'Apple Inc.',
        zh: 'Apple Inc.'
      },
      currentShares: 961340000,
      currentValue: 183200000000,
      currentWeight: 48.21,
      quarters: {
        '2025Q2': {
          shares: 961340000,
          value: 183200000000,
          weight: 48.21,
          changeType: 'increase',
          changePercent: 5.0
        },
        '2025Q1': {
          shares: 915560000,
          value: 174500000000,
          weight: 47.81,
          changeType: 'increase',
          changePercent: 15.2
        },
        '2024Q4': {
          shares: 795000000,
          value: 149800000000,
          weight: 42.8,
          changeType: 'increase',
          changePercent: 8.5
        },
        '2024Q3': {
          shares: 732500000,
          value: 125600000000,
          weight: 36.94,
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
