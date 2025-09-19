import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import HoldingsTable from '../components/HoldingsTable'
import HoldingsChart from '../components/HoldingsChart'
import AIInsights from '../components/AIInsights'
import { useHoldingsData } from '../hooks/useHoldingsData'
import { useSeo } from '../hooks/useSeo'

const HoldingsPage = () => {
  const { guru } = useParams()
  const { data, loading, error } = useHoldingsData(guru)

  const seoConfig = useMemo(() => {
    if (error) {
      return {
        title: '数据加载失败｜大师持仓追踪',
        description: '抱歉，暂时无法获取该投资大师的持仓数据，请稍后重试。'
      }
    }

    if (loading || !data) {
      return {
        title: '加载持仓数据中｜大师持仓追踪',
        description: '正在为您加载投资大师的最新13F持仓数据，敬请稍候。'
      }
    }

    const topHoldings = data.holdings?.slice(0, 3).map((holding) => holding.companyName).join('、')
    const description = topHoldings
      ? `${data.name}（${data.company}）在${data.lastUpdate}披露的美股13F持仓，核心仓位覆盖${topHoldings}等重点资产。`
      : `${data.name}（${data.company}）在${data.lastUpdate}披露的美股13F持仓分析。`

    return {
      title: `${data.name}最新13F持仓分析｜大师持仓追踪`,
      description,
      keywords: `${data.name}持仓,${data.name} 13F,${data.company} 投资组合,美股大师持仓`,
      openGraph: {
        type: 'article',
        title: `${data.name}持仓变化解读`,
        description
      },
      structuredData: ({ canonicalUrl }) => ({
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        name: `${data.name}持仓分析`,
        url: canonicalUrl,
        about: {
          '@type': 'Person',
          name: data.name,
          affiliation: data.company,
          description
        },
        mainEntity: {
          '@type': 'ItemList',
          name: `${data.name}的主要持仓`,
          numberOfItems: data.holdings?.length || 0,
          itemListElement: (data.holdings || []).map((holding, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: holding.companyName,
            alternateName: holding.symbol,
            additionalProperty: [
              {
                '@type': 'PropertyValue',
                name: 'Ticker',
                value: holding.symbol
              },
              {
                '@type': 'PropertyValue',
                name: '持仓市值(USD)',
                value: holding.currentValue
              },
              {
                '@type': 'PropertyValue',
                name: '组合占比(%)',
                value: holding.currentWeight
              }
            ]
          }))
        }
      })
    }
  }, [data, loading, error])

  useSeo(seoConfig)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载持仓数据中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-red-600">加载数据时出错：{error}</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-600">未找到相关数据</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            返回首页
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
          返回首页
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {data.name} 持仓分析
            </h1>
            <p className="text-gray-600">
              {data.company} | 最新更新：{data.lastUpdate}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">总持仓市值</p>
            <p className="text-2xl font-bold text-blue-600">
              ${data.totalValue}
            </p>
          </div>
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
          title="当前持仓分布"
        />
        <HoldingsChart 
          data={data.valueHistory} 
          type="line" 
          title="总市值趋势"
        />
      </div>

      {/* Holdings Table */}
      <div className="mb-8">
        <HoldingsTable holdings={data.holdings} />
      </div>

      {/* Data Source Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">数据说明</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 数据来源：SEC EDGAR 13F 季度报告</li>
          <li>• 数据延迟：约45天，非实时持仓</li>
          <li>• 仅包含价值超过$200,000且持股超过10,000股的美股持仓</li>
          <li>• 本数据仅供参考，不构成投资建议</li>
        </ul>
      </div>
    </div>
  )
}

export default HoldingsPage
