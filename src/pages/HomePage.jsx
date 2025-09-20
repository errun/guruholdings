import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChartBarIcon, ArrowTrendingUpIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import SubscribeForm from '../components/SubscribeForm'
import { useLanguage } from '../context/LanguageContext.jsx'
import buffettData from '../data/buffett.js'
import liLuData from '../data/li-lu.js'
import { formatNumber } from '../hooks/useHoldingsData.js'

const HomePage = () => {
  const { t, localizeText, formatQuarterLabel } = useLanguage()

  const gurus = useMemo(() => {
    const sources = [buffettData, liLuData]

    return sources.map((source) => {
      const overview = source.overview || {}
      return {
        id: source.id,
        name: localizeText(overview.name) ?? '',
        company: localizeText(overview.company) ?? '',
        description: localizeText(overview.description) ?? '',
        avatar: overview.avatar,
        totalValue: `$${formatNumber(source.totalValue)}`,
        lastUpdate: formatQuarterLabel(source.lastUpdate),
        highlights: Array.isArray(overview.highlights)
          ? overview.highlights.map((item) => localizeText(item))
          : []
      }
    })
  }, [localizeText, formatQuarterLabel])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('home.hero.title')}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          {t('home.hero.subtitle')}
        </p>

        <div className="flex justify-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <DocumentTextIcon className="w-5 h-5" />
            <span>{t('home.features.secData')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="w-5 h-5" />
            <span>{t('home.features.visualCharts')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ArrowTrendingUpIcon className="w-5 h-5" />
            <span>{t('home.features.aiSummary')}</span>
          </div>
        </div>
      </div>

      {/* Guru Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {gurus.map((guru) => (
          <div key={guru.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="text-4xl mr-4">{guru.avatar}</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{guru.name}</h3>
                  <p className="text-gray-600">{guru.company}</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                {guru.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <span className="text-gray-500">{t('home.cards.totalValue')}</span>
                  <p className="font-semibold text-lg text-blue-600">{guru.totalValue}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('home.cards.latestUpdate')}</span>
                  <p className="font-semibold text-lg">{guru.lastUpdate}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">{t('home.cards.investmentHighlights')}</h4>
                <ul className="space-y-2">
                  {guru.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to={`/holdings/${guru.id}`}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-6 rounded-lg font-medium transition-colors duration-200"
              >
                {t('home.cards.viewHoldings')}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Subscribe Section */}
      <div id="subscribe">
        <SubscribeForm />
      </div>
    </div>
  )
}

export default HomePage
