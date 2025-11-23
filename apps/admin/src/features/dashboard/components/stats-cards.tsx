import {
  DollarSign,
  Users,
  ShoppingCart,
  Activity,
  TrendingUp,
  CreditCard,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardStats } from '../types/dashboard.types'

interface StatsCardsProps {
  data?: DashboardStats
  isLoading: boolean
}

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 7 }).map((_, i) => (
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
    )
  }

  if (!data) {
    return (
      <div className='text-muted-foreground text-center'>
        Không thể tải dữ liệu thống kê
      </div>
    )
  }

  const stats = [
    {
      title: 'Tổng đơn hàng',
      value: data.orders.totalOrders.toLocaleString('vi-VN'),
      description: `Doanh thu: ${formatCurrency(data.orders.totalRevenue)}`,
      icon: ShoppingCart,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
    },
    {
      title: 'Doanh thu tháng này',
      value: formatCurrency(data.orders.revenueThisMonth),
      description: `Từ ${data.orders.totalOrders.toLocaleString('vi-VN')} đơn hàng`,
      icon: DollarSign,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-950',
    },
    {
      title: 'Tổng người dùng',
      value: data.users.totalUsers.toLocaleString('vi-VN'),
      description: `Hoạt động: ${data.users.activeUsers.toLocaleString('vi-VN')}`,
      icon: Users,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
    },
    {
      title: 'Người dùng mới (tháng)',
      value: `+${data.users.newUsersThisMonth.toLocaleString('vi-VN')}`,
      description: `Tuần này: ${data.users.newUsersThisWeek.toLocaleString('vi-VN')}`,
      icon: TrendingUp,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-950',
    },
    {
      title: 'Tổng giao dịch',
      value: data.payments.totalTransactions.toLocaleString('vi-VN'),
      description: `Thành công: ${data.payments.successfulTransactions.toLocaleString('vi-VN')} | Thất bại: ${data.payments.failedTransactions.toLocaleString('vi-VN')}`,
      icon: CreditCard,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-950',
    },
    {
      title: 'Doanh thu thanh toán',
      value: formatCurrency(data.payments.totalRevenue),
      description: `Tháng này: ${formatCurrency(data.payments.revenueThisMonth)}`,
      icon: Activity,
      iconColor: 'text-pink-600',
      bgColor: 'bg-pink-100 dark:bg-pink-950',
    },
    {
      title: 'Nạp tiền',
      value: data.payments.depositTransactions.toLocaleString('vi-VN'),
      description: `AI: ${data.payments.aiRequestTransactions.toLocaleString('vi-VN')} | Mua hàng: ${data.payments.purchaseTransactions.toLocaleString('vi-VN')}`,
      icon: DollarSign,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-950',
    },
  ]

  return (
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
  )
}

/**
 * Format currency to Vietnamese Dong
 */
function formatCurrency(amount: number): string {
  return amount.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  })
}
