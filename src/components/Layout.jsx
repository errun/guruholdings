import { Link } from 'react-router-dom'

const Layout = ({ children }) => {
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GH</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">大师持仓追踪</span>
            </Link>
            
            <nav className="flex space-x-8">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                首页
              </Link>
              <a 
                href="#subscribe" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                订阅
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p className="mb-2">
              数据来源：SEC EDGAR 13F 报告 | 数据延迟：约45天 | 非实时持仓
            </p>
            <p>
              © {currentYear} 大师持仓追踪. 仅供参考，不构成投资建议。
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
