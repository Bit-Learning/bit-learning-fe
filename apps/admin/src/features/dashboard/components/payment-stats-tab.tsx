import {
  CreditCard,
  DollarSign,
  Activity,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { PaymentDashboardStats } from '../types/dashboard.types'
import { PaymentRevenueChart } from './payment-revenue-chart'

interface PaymentStatsTabProps {
  data?: PaymentDashboardStats
  isLoading: boolean
}

export function PaymentStatsTab({ data, isLoading }: PaymentStatsTabProps) {
  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-4 w-4' />
              </CardHeader>
              <CardContent>
                <Skeleton className='mb-2 h-8 w-32' />
                <Skeleton className='h-3 w-40' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className='text-muted-foreground text-center'>
        Không thể tải dữ liệu thanh toán
      </div>
    )
  }

  const successRate = (
    (data.successfulTransactions / data.totalTransactions) *
    100
  ).toFixed(1)

  const stats = [
    {
      title: 'Tổng giao dịch',
      value: data.totalTransactions.toLocaleString('vi-VN'),
      description: `Tỷ lệ thành công: ${successRate}%`,
      icon: CreditCard,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-950',
    },
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(data.totalRevenue),
      description: 'Tổng giá trị giao dịch',
      icon: DollarSign,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-950',
    },
    {
      title: 'Doanh thu tháng này',
      value: formatCurrency(data.revenueThisMonth),
      description: `${((data.revenueThisMonth / data.totalRevenue) * 100).toFixed(1)}% tổng doanh thu`,
      icon: TrendingUp,
      iconColor: 'text-pink-600',
      bgColor: 'bg-pink-100 dark:bg-pink-950',
    },
    {
      title: 'Giao dịch thành công',
      value: data.successfulTransactions.toLocaleString('vi-VN'),
      description: `${successRate}% tổng giao dịch`,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-950',
    },
    {
      title: 'Giao dịch thất bại',
      value: data.failedTransactions.toLocaleString('vi-VN'),
      description: `${((data.failedTransactions / data.totalTransactions) * 100).toFixed(1)}% tổng giao dịch`,
      icon: XCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-950',
    },
    {
      title: 'Nạp tiền',
      value: data.depositTransactions.toLocaleString('vi-VN'),
      description: 'Giao dịch nạp tiền vào hệ thống',
      icon: Activity,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
    },
  ]

  return (
    <div className='space-y-4'>
      {/* Stats Cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stat.value}</div>
                <p className='text-muted-foreground text-xs'>
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Monthly Revenue Chart */}
      {data.monthlyRevenue && data.monthlyRevenue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
            <CardDescription>
              Biểu đồ doanh thu từ giao dịch thanh toán trong năm
            </CardDescription>
          </CardHeader>
          <CardContent className='ps-2'>
            <PaymentRevenueChart data={data.monthlyRevenue} />
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className='grid gap-4 lg:grid-cols-2'>
        {/* Transaction Types */}
        <Card>
          <CardHeader>
            <CardTitle>Loại giao dịch</CardTitle>
            <CardDescription>Phân bổ theo loại giao dịch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <TransactionTypeBar
                label='Nạp tiền'
                value={data.depositTransactions}
                total={data.totalTransactions}
                color='bg-blue-500'
              />
              <TransactionTypeBar
                label='AI Request'
                value={data.aiRequestTransactions}
                total={data.totalTransactions}
                color='bg-purple-500'
              />
              <TransactionTypeBar
                label='Mua hàng'
                value={data.purchaseTransactions}
                total={data.totalTransactions}
                color='bg-orange-500'
              />
            </div>

            {/* Type Breakdown Details */}
            <div className='mt-6 space-y-2 rounded-lg border p-4'>
              <h4 className='text-sm font-medium'>Chi tiết theo loại</h4>
              {Object.entries(data.typeBreakdown).map(([type, count]) => (
                <div
                  key={type}
                  className='flex items-center justify-between text-sm'
                >
                  <span className='text-muted-foreground capitalize'>
                    {translateType(type)}
                  </span>
                  <span className='font-medium'>
                    {count.toLocaleString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transaction Status */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái giao dịch</CardTitle>
            <CardDescription>Phân bổ theo trạng thái</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='space-y-2'>
                {Object.entries(data.statusBreakdown).map(([status, count]) => (
                  <div
                    key={status}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center gap-2'>
                      <div
                        className={`h-2 w-2 rounded-full ${getStatusColor(status)}`}
                      />
                      <span className='text-sm'>
                        {translatePaymentStatus(status)}
                      </span>
                    </div>
                    <span className='text-sm font-medium'>
                      {count.toLocaleString('vi-VN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Success Rate Card */}
              <div className='rounded-lg border p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-muted-foreground text-sm'>
                      Tỷ lệ thành công
                    </p>
                    <p className='text-2xl font-bold text-green-600'>
                      {successRate}%
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-muted-foreground text-sm'>
                      Thành công / Tổng
                    </p>
                    <p className='text-sm font-medium'>
                      {data.successfulTransactions.toLocaleString('vi-VN')} /{' '}
                      {data.totalTransactions.toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TransactionTypeBar({
  label,
  value,
  total,
  color,
}: {
  label: string
  value: number
  total: number
  color: string
}) {
  const percentage = ((value / total) * 100).toFixed(1)
  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between text-sm'>
        <span className='text-muted-foreground'>{label}</span>
        <span className='font-medium'>
          {value.toLocaleString('vi-VN')} ({percentage}%)
        </span>
      </div>
      <div className='bg-muted h-2 w-full rounded-full'>
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  })
}

function translateType(type: string): string {
  const typeMap: Record<string, string> = {
    DEPOSIT: 'Nạp tiền',
    AI_REQUEST: 'AI Request',
    PURCHASE: 'Mua hàng',
  }
  return typeMap[type] || type
}

function translatePaymentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: 'Chờ xử lý',
    PROCESSING: 'Đang xử lý',
    COMPLETED: 'Hoàn thành',
    SUCCESS: 'Thành công',
    FAILED: 'Thất bại',
    CANCELLED: 'Đã hủy',
    REFUNDED: 'Đã hoàn tiền',
  }
  return statusMap[status] || status
}

function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    PENDING: 'bg-yellow-500',
    PROCESSING: 'bg-blue-500',
    COMPLETED: 'bg-green-500',
    SUCCESS: 'bg-green-500',
    FAILED: 'bg-red-500',
    CANCELLED: 'bg-gray-500',
    REFUNDED: 'bg-orange-500',
  }
  return colorMap[status] || 'bg-gray-500'
}
