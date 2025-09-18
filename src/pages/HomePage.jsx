import { Link } from 'react-router-dom'
import { ChartBarIcon, ArrowTrendingUpIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import SubscribeForm from '../components/SubscribeForm'

const HomePage = () => {
  const gurus = [
    {
      id: 'buffett',
      name: '沃伦·巴菲特',
      company: 'Berkshire Hathaway',
      description: '股神巴菲特，价值投资的代表人物，以长期持有优质公司股票而闻名。',
      avatar: '🧙‍♂️',
      totalValue: '$3,500亿',
      lastUpdate: '2024年Q3',
      highlights: [
        '持仓集中度高，前十大持仓占比超过80%',
        '偏爱消费品、金融、科技龙头股',
        '长期持有苹果、可口可乐等经典股票'
      ]
    },
    {
      id: 'li-lu',
      name: '李录',
      company: 'Himalaya Capital',
      description: '价值投资大师，巴菲特的中国门徒，专注于中美两地的价值投资机会。',
      avatar: '👨‍💼',
      totalValue: '$40亿',
      lastUpdate: '2024年Q3',
      highlights: [
        '中美两地投资，深度研究驱动',
        '集中投资，持仓数量相对较少',
        '重仓比亚迪等中国优质企业'
      ]
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          追踪投资大师的持仓变化
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          聚焦巴菲特和李录，展示最近3个季度的美股持仓变化，
          以简报 + 图表 + AI摘要的方式，降低普通投资者获取和理解难度。
        </p>
        
        <div className="flex justify-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <DocumentTextIcon className="w-5 h-5" />
            <span>SEC 13F 数据</span>
          </div>
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="w-5 h-5" />
            <span>可视化图表</span>
          </div>
          <div className="flex items-center space-x-2">
            <ArrowTrendingUpIcon className="w-5 h-5" />
            <span>AI 智能摘要</span>
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
                  <span className="text-gray-500">总市值</span>
                  <p className="font-semibold text-lg text-blue-600">{guru.totalValue}</p>
                </div>
                <div>
                  <span className="text-gray-500">最新更新</span>
                  <p className="font-semibold text-lg">{guru.lastUpdate}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">投资亮点</h4>
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
                查看持仓详情
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
