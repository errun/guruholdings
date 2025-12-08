import { GuruData } from '@/lib/types';

const liLuData: GuruData = {
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
	  lastUpdate: '2025Q3',
	  totalValue: 4800000000,
  insights: {
    summary: {
	      en: 'Li Lu continued strategic positioning in Q3 2025, maintaining BYD as core holding while expanding technology exposure amid Chinese market recovery.',
	      zh: 'Li Lu continued strategic positioning in Q3 2025, maintaining BYD as core holding while expanding technology exposure amid Chinese market recovery.'
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
	        en: 'Portfolio value increased to $4.8B in Q3 2025, up from $4.5B in Q2 2025, driven by Chinese tech recovery.',
	        zh: 'Portfolio value increased to $4.8B in Q3 2025, up from $4.5B in Q2 2025, driven by Chinese tech recovery.'
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
	    { quarter: '2025Q2', value: 4500000000 },
	    { quarter: '2025Q3', value: 4800000000 }
	  ],
	  holdings: [
	    {
	      symbol: 'BYDDY',
	      companyName: {
	        en: 'BYD Company',
	        zh: 'BYD Company'
	      },
	      currentShares: 46000000,
	      currentValue: 2000000000,
	      currentWeight: 41.7,
	      quarters: {
	        '2025Q3': {
	          shares: 46000000,
	          value: 2000000000,
	          weight: 41.7,
	          changeType: 'increase',
	          changePercent: 5.0
	        },
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
	          weight: 42.9,
	          changeType: 'decrease',
	          changePercent: -2.5
	        },
	        '2024Q4': {
	          shares: 46000000,
	          value: 1840000000,
	          weight: 46.0,
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
	    },
	    {
	      symbol: 'BABA',
	      companyName: {
	        en: 'Alibaba Group Holding',
	        zh: 'Alibaba Group Holding'
	      },
	      currentShares: 15000000,
	      currentValue: 1000000000,
	      currentWeight: 20.8,
	      quarters: {
	        '2025Q3': {
	          shares: 15000000,
	          value: 1000000000,
	          weight: 20.8,
	          changeType: 'increase',
	          changePercent: 5.3
	        },
	        '2025Q2': {
	          shares: 14500000,
	          value: 950000000,
	          weight: 21.1,
	          changeType: 'increase',
	          changePercent: 5.6
	        },
	        '2025Q1': {
	          shares: 13700000,
	          value: 900000000,
	          weight: 21.4,
	          changeType: 'increase',
	          changePercent: 2.9
	        },
	        '2024Q4': {
	          shares: 13300000,
	          value: 875000000,
	          weight: 21.9,
	          changeType: 'increase',
	          changePercent: 1.2
	        },
	        '2024Q3': {
	          shares: 13000000,
	          value: 865000000,
	          weight: 22.8,
	          changeType: 'new',
	          changePercent: 100.0
	        }
	      }
	    },
	    {
	      symbol: 'TCEHY',
	      companyName: {
	        en: 'Tencent Holdings',
	        zh: 'Tencent Holdings'
	      },
	      currentShares: 20000000,
	      currentValue: 800000000,
	      currentWeight: 16.7,
	      quarters: {
	        '2025Q3': {
	          shares: 20000000,
	          value: 800000000,
	          weight: 16.7,
	          changeType: 'increase',
	          changePercent: 4.0
	        },
	        '2025Q2': {
	          shares: 19500000,
	          value: 770000000,
	          weight: 17.1,
	          changeType: 'increase',
	          changePercent: 3.2
	        },
	        '2025Q1': {
	          shares: 19000000,
	          value: 740000000,
	          weight: 17.6,
	          changeType: 'increase',
	          changePercent: 2.8
	        },
	        '2024Q4': {
	          shares: 18500000,
	          value: 720000000,
	          weight: 18.0,
	          changeType: 'increase',
	          changePercent: 2.9
	        },
	        '2024Q3': {
	          shares: 18000000,
	          value: 700000000,
	          weight: 18.4,
	          changeType: 'new',
	          changePercent: 100.0
	        }
	      }
	    },
	    {
	      symbol: 'JD',
	      companyName: {
	        en: 'JD.com Inc.',
	        zh: 'JD.com Inc.'
	      },
	      currentShares: 20000000,
	      currentValue: 500000000,
	      currentWeight: 10.4,
	      quarters: {
	        '2025Q3': {
	          shares: 20000000,
	          value: 500000000,
	          weight: 10.4,
	          changeType: 'increase',
	          changePercent: 6.4
	        },
	        '2025Q2': {
	          shares: 19000000,
	          value: 470000000,
	          weight: 10.4,
	          changeType: 'increase',
	          changePercent: 4.4
	        },
	        '2025Q1': {
	          shares: 18000000,
	          value: 440000000,
	          weight: 10.5,
	          changeType: 'increase',
	          changePercent: 2.3
	        },
	        '2024Q4': {
	          shares: 17500000,
	          value: 420000000,
	          weight: 10.5,
	          changeType: 'increase',
	          changePercent: 1.9
	        },
	        '2024Q3': {
	          shares: 17000000,
	          value: 400000000,
	          weight: 10.5,
	          changeType: 'new',
	          changePercent: 100.0
	        }
	      }
	    }
	  ],
  resources: {
    shareholderLetters: [],
    meetingTranscripts: []
  }
};

export default liLuData;

