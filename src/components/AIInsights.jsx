import {
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../context/LanguageContext.jsx'

const getRiskColor = (riskLevel) => {
  switch (riskLevel) {
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'moderate':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'elevated':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

const AIInsights = ({ insights }) => {
  const { t } = useLanguage()

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
      <div className="flex items-center space-x-2 mb-4">
        <LightBulbIcon className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">{t('aiInsights.title')}</h2>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">{t('aiInsights.summaryTitle')}</h3>
        <p className="text-gray-800 leading-relaxed bg-white/60 rounded-lg p-4">
          {insights.summary}
        </p>
      </div>

      {/* Key changes */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
          {t('aiInsights.keyChangesTitle')}
        </h3>
        <div className="space-y-2">
          {insights.keyChanges.map((change, index) => (
            <div key={index} className="flex items-start space-x-3 bg-white/60 rounded-lg p-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-700 text-sm">{change}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk and diversification */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white/60 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-gray-600" />
            <h4 className="text-sm font-medium text-gray-700">{t('aiInsights.riskLevel')}</h4>
          </div>
          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(insights.riskLevel)}`}>
            {insights.riskLabel}
          </div>
        </div>

        <div className="bg-white/60 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <ChartBarIcon className="w-4 h-4 text-gray-600" />
            <h4 className="text-sm font-medium text-gray-700">{t('aiInsights.diversification')}</h4>
          </div>
          <p className="text-sm text-gray-700">{insights.diversification}</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 pt-4 border-t border-blue-200">
        <p className="text-xs text-gray-500">
          {t('aiInsights.disclaimer')}
        </p>
      </div>
    </div>
  )
}

export default AIInsights
