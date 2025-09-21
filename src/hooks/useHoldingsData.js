import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'

const parseQuarter = (quarter) => {
  const match = /^(\d{4})Q([1-4])$/.exec(quarter)
  if (!match) {
    return { year: 0, quarter: 0 }
  }
  return { year: Number(match[1]), quarter: Number(match[2]) }
}

const compareQuarters = (a, b) => {
  const parsedA = parseQuarter(a)
  const parsedB = parseQuarter(b)

  if (parsedA.year !== parsedB.year) {
    return parsedA.year - parsedB.year
  }

  return parsedA.quarter - parsedB.quarter
}

const transformGuruData = (rawData, { localizeText, formatQuarterLabel, t }) => {
  if (!rawData) {
    return null
  }

  const quarterSet = new Set()

  rawData.valueHistory.forEach((entry) => {
    quarterSet.add(entry.quarter)
  })

  rawData.holdings.forEach((holding) => {
    Object.keys(holding.quarters).forEach((quarter) => {
      quarterSet.add(quarter)
    })
  })

  const sortedQuartersAsc = Array.from(quarterSet).sort(compareQuarters)
  const lastFourQuartersAsc = sortedQuartersAsc.slice(-4)
  const lastFourQuartersDesc = [...lastFourQuartersAsc].reverse()

  const overview = rawData.overview || {}

  const valueHistory = lastFourQuartersAsc.map((quarter) => {
    const match = rawData.valueHistory.find((item) => item.quarter === quarter)
    return {
      quarter,
      label: formatQuarterLabel(quarter),
      value: match ? match.value : 0
    }
  })

  const holdings = rawData.holdings.map((holding) => {
    const quarters = {}
    lastFourQuartersDesc.forEach((quarter) => {
      if (holding.quarters[quarter]) {
        quarters[quarter] = holding.quarters[quarter]
      }
    })

    return {
      symbol: holding.symbol,
      companyName: localizeText(holding.companyName),
      currentShares: holding.currentShares,
      currentValue: holding.currentValue,
      currentWeight: holding.currentWeight,
      quarters
    }
  })

  const insights = rawData.insights || {}
  const resources = rawData.resources || {}

  const mapResourceItems = (items = []) =>
    items.map((item) => ({
      year: item.year,
      title: localizeText(item.title) ?? '',
      description: localizeText(item.description) ?? '',
      url: item.url
    }))

  return {
    id: rawData.id,
    name: localizeText(overview.name) ?? '',
    company: localizeText(overview.company) ?? '',
    avatar: overview.avatar,
    description: localizeText(overview.description) ?? '',
    highlights: Array.isArray(overview.highlights)
      ? overview.highlights.map((item) => localizeText(item))
      : [],
    lastUpdate: rawData.lastUpdate,
    lastUpdateLabel: formatQuarterLabel(rawData.lastUpdate),
    totalValue: rawData.totalValue,
    insights: {
      summary: localizeText(insights.summary) ?? '',
      keyChanges: Array.isArray(insights.keyChanges)
        ? insights.keyChanges.map((item) => localizeText(item))
        : [],
      riskLevel: insights.riskLevel,
      riskLabel: insights.riskLevel ? t(`common.riskLevels.${insights.riskLevel}`) : '',
      diversification: localizeText(insights.diversification) ?? ''
    },
    valueHistory,
    holdings,
    quarters: lastFourQuartersDesc,
    resources: {
      shareholderLetters: Array.isArray(resources.shareholderLetters)
        ? mapResourceItems(resources.shareholderLetters)
        : [],
      meetingTranscripts: Array.isArray(resources.meetingTranscripts)
        ? mapResourceItems(resources.meetingTranscripts)
        : []
    }
  }
}

export const useHoldingsData = (guruId) => {
  const { localizeText, formatQuarterLabel, t } = useLanguage()
  const [rawData, setRawData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        let dataModule
        if (guruId === 'buffett') {
          dataModule = await import('../data/buffett.js')
        } else if (guruId === 'li-lu') {
          dataModule = await import('../data/li-lu.js')
        } else {
          throw new Error('data_not_found')
        }

        setRawData(dataModule.default)
      } catch (err) {
        if (err.message === 'data_not_found') {
          setError('data_not_found')
        } else {
          setError('unknown_error')
        }
        setRawData(null)
      } finally {
        setLoading(false)
      }
    }

    if (guruId) {
      fetchData()
    }
  }, [guruId])

  const data = useMemo(
    () => transformGuruData(rawData, { localizeText, formatQuarterLabel, t }),
    [rawData, localizeText, formatQuarterLabel, t]
  )

  return { data, loading, error }
}

export const formatNumber = (num) => {
  if (typeof num !== 'number') {
    const parsed = Number(num)
    if (Number.isNaN(parsed)) {
      return '0'
    }
    num = parsed
  }

  if (Math.abs(num) >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B'
  }
  if (Math.abs(num) >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M'
  }
  if (Math.abs(num) >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K'
  }
  return num.toString()
}

export const formatPercent = (num) => {
  if (num === null || num === undefined || Number.isNaN(Number(num))) {
    return 'N/A'
  }
  const value = Number(num)
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(1)}%`
}

export const getChangeColor = (changeType) => {
  switch (changeType) {
    case 'increase':
      return 'text-green-600 bg-green-50'
    case 'decrease':
      return 'text-red-600 bg-red-50'
    case 'new':
      return 'text-blue-600 bg-blue-50'
    case 'exit':
      return 'text-gray-600 bg-gray-100'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}
