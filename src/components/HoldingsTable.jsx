import { useMemo } from 'react'
import { formatNumber, formatPercent, getChangeColor } from '../hooks/useHoldingsData'
import { useLanguage } from '../context/LanguageContext.jsx'

const HoldingsTable = ({ holdings, quarters = [] }) => {
  const { t, formatQuarterLabel } = useLanguage()

  const displayQuarters = useMemo(() => {
    if (quarters.length > 0) {
      return quarters
    }

    const quarterSet = new Set()
    holdings.forEach((holding) => {
      Object.keys(holding.quarters || {}).forEach((quarter) => {
        quarterSet.add(quarter)
      })
    })

    return Array.from(quarterSet).sort((a, b) => (a < b ? 1 : -1))
  }, [quarters, holdings])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">{t('holdingsTable.title')}</h2>
        <p className="text-sm text-gray-600 mt-1">{t('holdingsTable.subtitle')}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                {t('holdingsTable.stockInfo')}
              </th>
              {displayQuarters.map((quarter) => (
                <th key={quarter} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {formatQuarterLabel(quarter)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {holdings.map((holding) => (
              <tr key={holding.symbol} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-200">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {holding.symbol}
                    </div>
                    <div className="text-sm text-gray-500">
                      {holding.companyName}
                    </div>
                  </div>
                </td>
                {displayQuarters.map((quarter) => {
                  const quarterData = holding.quarters?.[quarter]
                  if (!quarterData || quarterData.shares === 0) {
                    return (
                      <td key={quarter} className="px-6 py-4 text-center">
                        <span className="text-gray-400 text-sm">{t('holdingsTable.noHoldings')}</span>
                      </td>
                    )
                  }

                  return (
                    <td key={quarter} className="px-6 py-4 text-center">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          ${formatNumber(quarterData.value)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('holdingsTable.sharesLabel', { count: formatNumber(quarterData.shares) })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('holdingsTable.weightLabel', { weight: quarterData.weight.toFixed(1) })}
                        </div>
                        <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getChangeColor(quarterData.changeType)}`}>
                          {t(`common.changeTypes.${quarterData.changeType || 'none'}`)}
                          {quarterData.changePercent !== null && quarterData.changePercent !== 0 && (
                            <span className="ml-1">
                              {formatPercent(quarterData.changePercent)}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 rounded-full"></div>
            <span className="text-gray-600">{t('holdingsTable.legend.increase')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-100 rounded-full"></div>
            <span className="text-gray-600">{t('holdingsTable.legend.decrease')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
            <span className="text-gray-600">{t('holdingsTable.legend.new')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
            <span className="text-gray-600">{t('holdingsTable.legend.exit')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-100 rounded-full"></div>
            <span className="text-gray-600">{t('holdingsTable.legend.unchanged')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HoldingsTable
