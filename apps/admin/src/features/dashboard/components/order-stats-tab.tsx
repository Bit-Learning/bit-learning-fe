import { ShoppingCart, DollarSign, TrendingUp } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { OrderDashboardStats } from '../types/dashboard.types'
import { Overview } from './overview'

interface OrderStatsTabProps {
  data?: OrderDashboardStats
  isLoading: boolean
}

export function OrderStatsTab({ data, isLoading }: OrderStatsTabProps) {
  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, i) => (
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
        <Skeleton className='h-[400px] w-full' />
      </div>
    )
  }

  if (!data) {
    return (
      <div className='text-muted-foreground text-center'>
        Không thể tải dữ liệu đơn hàng
      </div>
    )
  }

  const stats = [
    {
      title: 'Tổng đơn hàng',
      value: data.totalOrders.toLocaleString('vi-VN'),
      description: `Tổng giá trị đơn hàng`,
      icon: ShoppingCart,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
    },
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(data.totalRevenue),
      description: `Từ ${data.totalOrders.toLocaleString('vi-VN')} đơn hàng`,
      icon: DollarSign,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-950',
    },
    {
      title: 'Doanh thu tháng này',
      value: formatCurrency(data.revenueThisMonth),
      description: `${((data.revenueThisMonth / data.totalRevenue) * 100).toFixed(1)}% tổng doanh thu`,
      icon: TrendingUp,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-950',
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

      {/* Charts */}
      <div className='grid gap-4 lg:grid-cols-7'>
        <Card className='col-span-4'>
          <CardHeader>
            <CardTitle>Tổng quan doanh thu</CardTitle>
            <CardDescription>Biểu đồ doanh thu theo thời gian</CardDescription>
          </CardHeader>
          <CardContent className='ps-2'>
            <Overview />
          </CardContent>
        </Card>

        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle>Trạng thái đơn hàng</CardTitle>
            <CardDescription>Phân bổ theo trạng thái</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {Object.entries(data.statusBreakdown).map(([status, count]) => (
                <div key={status} className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='bg-primary h-2 w-2 rounded-full' />
                    <span className='text-sm capitalize'>
                      {translateStatus(status)}
                    </span>
                  </div>
                  <span className='text-sm font-medium'>
                    {count.toLocaleString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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

function translateStatus(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: 'Chờ xử lý',
    PROCESSING: 'Đang xử lý',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    REFUNDED: 'Đã hoàn tiền',
  }
  return statusMap[status] || status
}
