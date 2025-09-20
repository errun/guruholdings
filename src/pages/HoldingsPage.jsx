import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import HoldingsTable from '../components/HoldingsTable'
import HoldingsChart from '../components/HoldingsChart'
import AIInsights from '../components/AIInsights'
import { useHoldingsData, formatNumber } from '../hooks/useHoldingsData'
import { useLanguage } from '../context/LanguageContext.jsx'

const HoldingsPage = () => {
  const { guru } = useParams()
  const { data, loading, error } = useHoldingsData(guru)
  const { t } = useLanguage()

  const quarterSummary = useMemo(() => {
    if (!data || !data.valueHistory || data.valueHistory.length === 0) {
      return { description: t('holdingsPage.quarterChange.noPrevious') }
    }

    const history = data.valueHistory
    const latest = history[history.length - 1]
    const previous = history.length > 1 ? history[history.length - 2] : null

    if (!previous) {
      return { description: t('holdingsPage.quarterChange.noPrevious') }
    }

    const changeValue = latest.value - previous.value
    const directionKey = changeValue >= 0 ? 'increase' : 'decrease'
    const absoluteChange = Math.abs(changeValue)
    const percentChange = previous.value === 0 ? 0 : (absoluteChange / previous.value) * 100

    return {
      description: t('holdingsPage.quarterChange.description', { previousQuarter: previous.label }),
      changeLabel: t(`holdingsPage.quarterChange.${directionKey}`, {
        amount: `$${formatNumber(absoluteChange)}`,
        percent: `${percentChange.toFixed(1)}%`
      }),
      direction: directionKey
    }
  }, [data, t])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('messages.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-4">
          <p className="text-red-600">{t(`messages.errors.${error}`)}</p>
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            {t('messages.backToHome')}
          </Link>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-4">
          <p className="text-gray-600">{t('messages.noData')}</p>
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            {t('messages.backToHome')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          {t('messages.backToHome')}
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('holdingsPage.title', { name: data.name })}
            </h1>
            <p className="text-gray-600">
              {t('holdingsPage.subtitle', { company: data.company, update: data.lastUpdateLabel })}
            </p>
          </div>

          <div className="text-left lg:text-right">
            <p className="text-sm text-gray-500">{t('holdingsPage.totalValueLabel')}</p>
            <p className="text-2xl font-bold text-blue-600">${formatNumber(data.totalValue)}</p>
          </div>
        </div>
      </div>

      {/* Quarter Summary */}
      <div className="mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('holdingsPage.quarterChange.title')}</h3>
            <p className="text-sm text-gray-600 mt-1">{quarterSummary.description}</p>
          </div>
          {quarterSummary.changeLabel && (
            <div
              className={`mt-3 sm:mt-0 inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                quarterSummary.direction === 'increase'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {quarterSummary.changeLabel}
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="mb-8">
        <AIInsights insights={data.insights} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <HoldingsChart
          data={data.holdings}
          type="pie"
          title={t('holdingsPage.charts.currentAllocation')}
        />
        <HoldingsChart
          data={data.valueHistory}
          type="line"
          title={t('holdingsPage.charts.totalValueTrend')}
        />
      </div>

      {/* Holdings Table */}
      <div className="mb-8">
        <HoldingsTable holdings={data.holdings} quarters={data.quarters} />
      </div>

      {/* Data Source Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">{t('holdingsPage.dataNotice.title')}</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          {t('holdingsPage.dataNotice.items').map((item, index) => (
            <li key={index}>• {item}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default HoldingsPage
