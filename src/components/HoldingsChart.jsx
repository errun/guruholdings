import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { formatNumber } from '../hooks/useHoldingsData'
import { useLanguage } from '../context/LanguageContext.jsx'

const COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#EC4899',
  '#6B7280'
]

const HoldingsChart = ({ data, type, title }) => {
  const { t } = useLanguage()

  if (type === 'pie') {
    const pieData = data
      .slice(0, 5)
      .map((holding, index) => ({
        name: holding.symbol,
        value: holding.currentValue,
        weight: holding.currentWeight,
        color: COLORS[index % COLORS.length]
      }))

    const othersValue = data
      .slice(5)
      .reduce((sum, holding) => sum + holding.currentValue, 0)

    if (othersValue > 0) {
      pieData.push({
        name: t('common.others'),
        value: othersValue,
        weight: data.slice(5).reduce((sum, holding) => sum + holding.currentWeight, 0),
        color: COLORS[5 % COLORS.length]
      })
    }

    const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
        const item = payload[0].payload
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
            <p className="font-medium text-gray-900">{item.name}</p>
            <p className="text-sm text-gray-600">
              {t('charts.pie.tooltipValue')}: ${formatNumber(item.value)}
            </p>
            <p className="text-sm text-gray-600">
              {t('charts.pie.tooltipWeight')}: {item.weight.toFixed(1)}%
            </p>
          </div>
        )
      }
      return null
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>
                    {value} ({entry.payload.weight.toFixed(1)}%)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  if (type === 'line') {
    const lineData = data.map((item) => ({
      quarter: item.label,
      value: item.value / 1e9,
      displayValue: formatNumber(item.value)
    }))

    const CustomLineTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
            <p className="font-medium text-gray-900">{label}</p>
            <p className="text-sm text-gray-600">
              {t('charts.line.tooltipValue')}: ${payload[0].payload.displayValue}
            </p>
          </div>
        )
      }
      return null
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="quarter"
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `$${value.toFixed(0)}B`}
              />
              <Tooltip content={<CustomLineTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  return null
}

export default HoldingsChart
