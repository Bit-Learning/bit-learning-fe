import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import type { MonthlyRevenue } from '../types/dashboard.types'

interface PaymentRevenueChartProps {
  data: MonthlyRevenue[]
}

export function PaymentRevenueChart({ data }: PaymentRevenueChartProps) {
  // Transform data for chart
  const chartData = data.map((item) => ({
    name: getMonthName(item.month),
    revenue: item.revenue,
    revenueFormatted: formatCurrency(item.revenue),
  }))

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatCurrencyShort(value)}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className='rounded-lg border bg-background p-2 shadow-sm'>
                  <div className='grid grid-cols-2 gap-2'>
                    <div className='flex flex-col'>
                      <span className='text-[0.70rem] uppercase text-muted-foreground'>
                        Tháng
                      </span>
                      <span className='font-bold text-muted-foreground'>
                        {payload[0].payload.name}
                      </span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-[0.70rem] uppercase text-muted-foreground'>
                        Doanh thu
                      </span>
                      <span className='font-bold'>
                        {payload[0].payload.revenueFormatted}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Bar
          dataKey='revenue'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

function getMonthName(month: number): string {
  const months = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ]
  return months[month - 1] || `Tháng ${month}`
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  })
}

function formatCurrencyShort(value: number): string {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}
