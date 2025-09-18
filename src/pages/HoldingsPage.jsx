import { useParams, Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import HoldingsTable from '../components/HoldingsTable'
import HoldingsChart from '../components/HoldingsChart'
import AIInsights from '../components/AIInsights'
import { useHoldingsData } from '../hooks/useHoldingsData'

const HoldingsPage = () => {
  const { guru } = useParams()
  const { data, loading, error } = useHoldingsData(guru)

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
