import { GuruData } from '@/lib/types';

const buffettData: GuruData = {
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
	  lastUpdate: '2025Q3',
	  totalValue: 395000000000,
  insights: {
    summary: {
	      en: 'Buffett continued strategic positioning in Q3 2025, with selective additions to technology and financial positions while maintaining substantial cash reserves for future opportunities.',
	      zh: 'Buffett continued strategic positioning in Q3 2025, with selective additions to technology and financial positions while maintaining substantial cash reserves for future opportunities.'
    },
    keyChanges: [
      {
	        en: 'Portfolio value increased to $395B in Q3 2025, up from $380B in Q2 2025.',
	        zh: 'Portfolio value increased to $395B in Q3 2025, up from $380B in Q2 2025.'
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
	    { quarter: '2025Q2', value: 380000000000 },
	    { quarter: '2025Q3', value: 395000000000 }
	  ],
	  holdings: [
	    {
	      symbol: 'AAPL',
	      companyName: {
	        en: 'Apple Inc.',
	        zh: 'Apple Inc.'
	      },
	      currentShares: 980000000,
	      currentValue: 190000000000,
	      currentWeight: 48.1,
	      quarters: {
	        '2025Q3': {
	          shares: 980000000,
	          value: 190000000000,
	          weight: 48.1,
	          changeType: 'increase',
	          changePercent: 5.0
	        },
	        '2025Q2': {
	          shares: 961340000,
	          value: 183200000000,
	          weight: 48.2,
	          changeType: 'increase',
	          changePercent: 3.9
	        },
	        '2025Q1': {
	          shares: 915560000,
	          value: 174500000000,
	          weight: 47.8,
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
	          weight: 36.9,
	          changeType: 'unchanged',
	          changePercent: 0
	        }
	      }
	    },
	    {
	      symbol: 'BAC',
	      companyName: {
	        en: 'Bank of America Corp.',
	        zh: 'Bank of America Corp.'
	      },
	      currentShares: 1000000000,
	      currentValue: 45000000000,
	      currentWeight: 11.4,
	      quarters: {
	        '2025Q3': {
	          shares: 1000000000,
	          value: 45000000000,
	          weight: 11.4,
	          changeType: 'increase',
	          changePercent: 4.7
	        },
	        '2025Q2': {
	          shares: 970000000,
	          value: 43000000000,
	          weight: 11.3,
	          changeType: 'increase',
	          changePercent: 3.6
	        },
	        '2025Q1': {
	          shares: 940000000,
	          value: 41500000000,
	          weight: 11.4,
	          changeType: 'unchanged',
	          changePercent: 0
	        },
	        '2024Q4': {
	          shares: 940000000,
	          value: 40000000000,
	          weight: 11.4,
	          changeType: 'increase',
	          changePercent: 5.3
	        },
	        '2024Q3': {
	          shares: 910000000,
	          value: 38000000000,
	          weight: 11.2,
	          changeType: 'increase',
	          changePercent: 4.1
	        }
	      }
	    },
	    {
	      symbol: 'KO',
	      companyName: {
	        en: 'The Coca-Cola Company',
	        zh: 'The Coca-Cola Company'
	      },
	      currentShares: 400000000,
	      currentValue: 28000000000,
	      currentWeight: 7.1,
	      quarters: {
	        '2025Q3': {
	          shares: 400000000,
	          value: 28000000000,
	          weight: 7.1,
	          changeType: 'unchanged',
	          changePercent: 0
	        },
	        '2025Q2': {
	          shares: 400000000,
	          value: 27600000000,
	          weight: 7.3,
	          changeType: 'unchanged',
	          changePercent: 0
	        },
	        '2025Q1': {
	          shares: 400000000,
	          value: 27000000000,
	          weight: 7.4,
	          changeType: 'unchanged',
	          changePercent: 0
	        },
	        '2024Q4': {
	          shares: 400000000,
	          value: 26000000000,
	          weight: 7.4,
	          changeType: 'unchanged',
	          changePercent: 0
	        },
	        '2024Q3': {
	          shares: 400000000,
	          value: 25500000000,
	          weight: 7.5,
	          changeType: 'unchanged',
	          changePercent: 0
	        }
	      }
	    },
	    {
	      symbol: 'AXP',
	      companyName: {
	        en: 'American Express Company',
	        zh: 'American Express Company'
	      },
	      currentShares: 150000000,
	      currentValue: 32000000000,
	      currentWeight: 8.1,
	      quarters: {
	        '2025Q3': {
	          shares: 150000000,
	          value: 32000000000,
	          weight: 8.1,
	          changeType: 'increase',
	          changePercent: 4.2
	        },
	        '2025Q2': {
	          shares: 145000000,
	          value: 30700000000,
	          weight: 8.1,
	          changeType: 'increase',
	          changePercent: 3.7
	        },
	        '2025Q1': {
	          shares: 140000000,
	          value: 29600000000,
	          weight: 8.1,
	          changeType: 'increase',
	          changePercent: 2.1
	        },
	        '2024Q4': {
	          shares: 138000000,
	          value: 29000000000,
	          weight: 8.3,
	          changeType: 'increase',
	          changePercent: 1.4
	        },
	        '2024Q3': {
	          shares: 136000000,
	          value: 28600000000,
	          weight: 8.4,
	          changeType: 'unchanged',
	          changePercent: 0
	        }
	      }
	    },
	    {
	      symbol: 'OXY',
	      companyName: {
	        en: 'Occidental Petroleum Corp.',
	        zh: 'Occidental Petroleum Corp.'
	      },
	      currentShares: 250000000,
	      currentValue: 25000000000,
	      currentWeight: 6.3,
	      quarters: {
	        '2025Q3': {
	          shares: 250000000,
	          value: 25000000000,
	          weight: 6.3,
	          changeType: 'increase',
	          changePercent: 5.0
	        },
	        '2025Q2': {
	          shares: 238000000,
	          value: 23800000000,
	          weight: 6.3,
	          changeType: 'increase',
	          changePercent: 4.4
	        },
	        '2025Q1': {
	          shares: 228000000,
	          value: 22500000000,
	          weight: 6.2,
	          changeType: 'increase',
	          changePercent: 3.2
	        },
	        '2024Q4': {
	          shares: 220000000,
	          value: 21000000000,
	          weight: 6.0,
	          changeType: 'increase',
	          changePercent: 4.5
	        },
	        '2024Q3': {
	          shares: 200000000,
	          value: 19000000000,
	          weight: 5.6,
	          changeType: 'new',
	          changePercent: 100.0
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
};

export default buffettData;

