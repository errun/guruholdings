import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const translationResources = {
  en: {
    common: {
      brand: 'Guru Holdings Tracker',
      navigation: {
        home: 'Home',
        subscribe: 'Subscribe'
      },
      footer: {
        dataSource: 'Data source: SEC EDGAR 13F filings | Delay: approximately 45 days | Not real-time positions',
        disclaimer: '© 2024 Guru Holdings Tracker. For informational purposes only; not investment advice.'
      },
      changeTypes: {
        increase: 'Added',
        decrease: 'Trimmed',
        new: 'New position',
        exit: 'Closed',
        unchanged: 'No change',
        none: 'No position'
      },
      riskLevels: {
        low: 'Low',
        moderate: 'Moderate',
        elevated: 'Elevated',
        high: 'High'
      },
      others: 'Others',
      languageSelectorLabel: 'Language',

      languageNames: {
        en: 'English',
        zh: '中文'
      }
    },
    messages: {
      loading: 'Loading holdings data…',
      noData: 'No data found.',
      backToHome: 'Back to home',
      errors: {
        data_not_found: 'No guru data found.',
        unknown_error: 'An unexpected error occurred.'
      }
    },
    home: {
      hero: {
        title: 'Track guru portfolios over the last four quarters',
        subtitle: 'Focused coverage of Warren Buffett and Li Lu with quarterly holdings, charts, and AI summaries to make 13F filings easier to follow.'
      },
      features: {
        secData: 'SEC 13F data',
        visualCharts: 'Interactive charts',
        aiSummary: 'AI-powered summaries'
      },
      cards: {
        totalValue: 'Total value',
        latestUpdate: 'Latest update',
        investmentHighlights: 'Investment highlights',
        viewHoldings: 'View holdings details'
      }
    },
    subscribe: {
      title: 'Subscribe for holdings updates',
      description: 'Receive quarterly breakdowns of guru portfolio changes delivered straight to your inbox once new 13F filings are released.',
      placeholder: 'Enter your email address',
      button: 'Subscribe',
      buttonLoading: 'Subscribing…',
      messages: {
        required: 'Please enter an email address.',
        invalid: 'Please enter a valid email address.',
        exists: 'This email is already subscribed.',
        success: 'Subscription successful! We will email you after each quarterly update.',
        failure: 'Subscription failed. Please try again later.'
      },
      promise: 'We respect your inbox and you can unsubscribe at any time.',
      subscriberCount: '{{count}} investors have subscribed.'
    },
    holdingsPage: {
      back: 'Back to home',
      title: '{{name}} Portfolio Analysis',
      subtitle: '{{company}} | Last update: {{update}}',
      totalValueLabel: 'Total portfolio value',
      quarterChange: {
        title: 'Quarter-over-quarter change',
        description: 'Compared with {{previousQuarter}}',
        increase: 'Up {{amount}} ({{percent}})',
        decrease: 'Down {{amount}} ({{percent}})',
        noChange: 'No change from {{previousQuarter}}',
        noPrevious: 'No prior quarter available for comparison.'
      },
      charts: {
        currentAllocation: 'Current allocation',
        totalValueTrend: 'Total value trend'
      },
      dataNotice: {
        title: 'Data notes',
        items: [
          'Source: SEC EDGAR 13F quarterly filings',
          'Reported positions typically lag by about 45 days and are not real-time',
          'Only US equity positions above $200,000 and 10,000 shares are included',
          'Information is for reference only and does not constitute investment advice'
        ]
      }
    },
    holdingsTable: {
      title: 'Holdings comparison',
      subtitle: 'Changes over the last four quarters',
      stockInfo: 'Stock information',
      noHoldings: 'No position',
      sharesLabel: '{{count}} shares',
      weightLabel: '{{weight}}% of portfolio',
      legend: {
        increase: 'Added',
        decrease: 'Trimmed',
        new: 'New position',
        exit: 'Closed position',
        unchanged: 'No change'
      }
    },
    aiInsights: {
      title: 'AI insights',
      summaryTitle: 'Highlights this quarter',
      keyChangesTitle: 'Key changes',
      riskLevel: 'Risk level',
      diversification: 'Diversification',
      disclaimer: '* AI commentary is generated from public 13F data for reference only and is not investment advice.'
    },
    charts: {
      pie: {
        tooltipValue: 'Market value',
        tooltipWeight: 'Portfolio weight'
      },
      line: {
        tooltipValue: 'Total value'
      }
    }
  },
  zh: {
    common: {
      brand: '大师持仓追踪',
      navigation: {
        home: '首页',
        subscribe: '订阅'
      },
      footer: {
        dataSource: '数据来源：SEC EDGAR 13F 报告 | 数据延迟：约45天 | 非实时持仓',
        disclaimer: '© 2024 大师持仓追踪。仅供参考，不构成投资建议。'
      },
      changeTypes: {
        increase: '增持',
        decrease: '减持',
        new: '新增',
        exit: '清仓',
        unchanged: '不变',
        none: '无持仓'
      },
      riskLevels: {
        low: '低',
        moderate: '中等',
        elevated: '较高',
        high: '高'
      },
      others: '其他',
      languageSelectorLabel: '语言',
      languageNames: {
        en: 'English',
        zh: '中文'
      }
    },
    messages: {
      loading: '加载持仓数据中…',
      noData: '未找到相关数据',
      backToHome: '返回首页',
      errors: {
        data_not_found: '未找到对应的大师数据。',
        unknown_error: '加载数据时发生未知错误。'
      }
    },
    home: {
      hero: {
        title: '追踪大师最近四个季度的持仓变化',
        subtitle: '聚焦巴菲特与李录的季度持仓、图表与AI摘要，让13F信息更易理解。'
      },
      features: {
        secData: 'SEC 13F 数据',
        visualCharts: '可视化图表',
        aiSummary: 'AI 智能摘要'
      },
      cards: {
        totalValue: '总市值',
        latestUpdate: '最新更新',
        investmentHighlights: '投资亮点',
        viewHoldings: '查看持仓详情'
      }
    },
    subscribe: {
      title: '订阅持仓更新',
      description: '13F 季度报告发布后，我们会第一时间为您梳理持仓变化，并通过邮件发送详细简报。',
      placeholder: '输入您的邮箱地址',
      button: '订阅',
      buttonLoading: '订阅中…',
      messages: {
        required: '请输入邮箱地址。',
        invalid: '请输入有效的邮箱地址。',
        exists: '该邮箱已经订阅过了。',
        success: '订阅成功！每次季度更新后我们都会通知您。',
        failure: '订阅失败，请稍后重试。'
      },
      promise: '我们承诺不会发送垃圾邮件，您可以随时取消订阅。',
      subscriberCount: '已有 {{count}} 位投资者订阅。'
    },
    holdingsPage: {
      back: '返回首页',
      title: '{{name}} 持仓分析',
      subtitle: '{{company}}｜最新更新：{{update}}',
      totalValueLabel: '总持仓市值',
      quarterChange: {
        title: '季度环比变化',
        description: '与 {{previousQuarter}} 比较',
        increase: '上涨 {{amount}}（{{percent}}）',
        decrease: '下降 {{amount}}（{{percent}}）',
        noChange: '与 {{previousQuarter}} 持平',
        noPrevious: '暂无上一季度可供比较。'
      },
      charts: {
        currentAllocation: '当前持仓分布',
        totalValueTrend: '总市值趋势'
      },
      dataNotice: {
        title: '数据说明',
        items: [
          '数据来源：SEC EDGAR 13F 季度报告',
          '13F 数据通常滞后约45天，非实时持仓',
          '仅统计价值超过20万美元且持股超过1万股的美股仓位',
          '以上信息仅供参考，不构成投资建议'
        ]
      }
    },
    holdingsTable: {
      title: '持仓详情对比',
      subtitle: '最近四个季度持仓变化',
      stockInfo: '股票信息',
      noHoldings: '无持仓',
      sharesLabel: '{{count}} 股',
      weightLabel: '仓位占比 {{weight}}%',
      legend: {
        increase: '增持',
        decrease: '减持',
        new: '新增',
        exit: '清仓',
        unchanged: '不变'
      }
    },
    aiInsights: {
      title: 'AI 智能分析',
      summaryTitle: '本季度亮点',
      keyChangesTitle: '关键变化',
      riskLevel: '风险水平',
      diversification: '分散化程度',
      disclaimer: '* AI 分析基于公开的 13F 数据，仅供参考，不构成投资建议。'
    },
    charts: {
      pie: {
        tooltipValue: '市值',
        tooltipWeight: '仓位占比'
      },
      line: {
        tooltipValue: '总市值'
      }
    }
  }
}

const LanguageContext = createContext({
  language: 'en',
  changeLanguage: () => {},
  t: (key) => key,
  localizeText: (value) => value,
  formatQuarterLabel: (quarter) => quarter
})

const getTranslationValue = (language, key) => {
  const segments = key.split('.')
  let current = translationResources[language]

  for (const segment of segments) {
    if (current === undefined || current === null) {
      return undefined
    }
    current = current[segment]
  }

  return current
}

const formatQuarter = (quarter, language) => {
  if (!quarter) return ''
  const match = /^(\d{4})Q([1-4])$/.exec(quarter)
  if (!match) return quarter
  const [, year, quarterNumber] = match
  return language === 'zh' ? `${year}年Q${quarterNumber}` : `Q${quarterNumber} ${year}`
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') {
      return 'en'
    }

    try {
      const stored = window.localStorage.getItem('app-language')
      return stored === 'zh' ? 'zh' : 'en'
    } catch (error) {
      console.warn('[language] unable to access localStorage, defaulting to English', error)
      return 'en'
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem('app-language', language)
    } catch (error) {
      console.warn('[language] unable to persist preference', error)

    }
  }, [language])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const htmlLang = language === 'zh' ? 'zh-CN' : 'en'
      document.documentElement.setAttribute('lang', htmlLang)
    }
  }, [language])

  const changeLanguage = useCallback((nextLanguage) => {
    setLanguage(nextLanguage === 'zh' ? 'zh' : 'en')
  }, [])

  const localizeText = useCallback((value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value[language] ?? value.en ?? Object.values(value)[0]
    }
    return value
  }, [language])

  const t = useCallback((key, replacements = {}) => {
    const directValue = getTranslationValue(language, key)
    const fallbackValue = directValue === undefined && language !== 'en'
      ? getTranslationValue('en', key)
      : directValue

    if (fallbackValue === undefined) {
      return key
    }

    if (typeof fallbackValue === 'string') {
      return fallbackValue.replace(/{{(.*?)}}/g, (_, token) => {
        const trimmedToken = token.trim()
        return Object.prototype.hasOwnProperty.call(replacements, trimmedToken)
          ? replacements[trimmedToken]
          : `{{${trimmedToken}}}`
      })
    }

    return fallbackValue
  }, [language])

  const formatQuarterLabel = useCallback((quarter) => formatQuarter(quarter, language), [language])

  const value = useMemo(() => ({
    language,
    changeLanguage,
    t,
    localizeText,
    formatQuarterLabel
  }), [language, changeLanguage, t, localizeText, formatQuarterLabel])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => useContext(LanguageContext)
