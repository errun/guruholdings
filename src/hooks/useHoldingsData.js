import { useState, useEffect } from 'react'

export const useHoldingsData = (guruId) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 根据guruId加载对应的数据文件
        let dataModule
        if (guruId === 'buffett') {
          dataModule = await import('../data/buffett.json')
        } else if (guruId === 'li-lu') {
          dataModule = await import('../data/li-lu.json')
        } else {
          throw new Error('未找到对应的大师数据')
        }
        
        setData(dataModule.default)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (guruId) {
      fetchData()
    }
  }, [guruId])

  return { data, loading, error }
}

// 格式化数字的工具函数
export const formatNumber = (num) => {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B'
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M'
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K'
  }
  return num.toString()
}

// 格式化百分比的工具函数
export const formatPercent = (num) => {
  if (num === null || num === undefined) return 'N/A'
  return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`
}

// 获取变化类型的颜色
export const getChangeColor = (change) => {
  switch (change) {
    case '增持':
      return 'text-green-600 bg-green-50'
    case '减持':
      return 'text-red-600 bg-red-50'
    case '新增':
      return 'text-blue-600 bg-blue-50'
    case '清仓':
      return 'text-gray-600 bg-gray-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}
