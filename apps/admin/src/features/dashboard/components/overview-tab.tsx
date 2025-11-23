import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardStats } from '../types/dashboard.types'
import { PaymentRevenueChart } from './payment-revenue-chart'
import { RecentSales } from './recent-sales'
import { StatsCards } from './stats-cards'

interface OverviewTabProps {
  data?: DashboardStats
  isLoading: boolean
}

export function OverviewTab({ data, isLoading }: OverviewTabProps) {
  if (isLoading) {
    return (
      <div className='space-y-4'>
        {/* Stats Cards Skeleton */}
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
        {/* Chart Skeleton */}
        <Skeleton className='h-[400px] w-full' />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Stats Cards - Summary from all 3 services */}
      <StatsCards data={data} isLoading={false} />

      {/* Charts Grid */}
      <div className='grid gap-4 lg:grid-cols-7'>
        {/* Monthly Revenue Chart */}
        <Card className='col-span-4'>
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
            <CardDescription>
              Biểu đồ doanh thu từ thanh toán trong năm
            </CardDescription>
          </CardHeader>
          <CardContent className='ps-2'>
            {data?.payments?.monthlyRevenue &&
            data.payments.monthlyRevenue.length > 0 ? (
              <PaymentRevenueChart data={data.payments.monthlyRevenue} />
            ) : (
              <div className='text-muted-foreground flex h-[350px] items-center justify-center'>
                Không có dữ liệu doanh thu theo tháng
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats Summary */}
        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle>Tóm tắt nhanh</CardTitle>
            <CardDescription>
              Các chỉ số quan trọng trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data ? (
              <div className='space-y-6'>
                {/* Orders Summary */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Đơn hàng</span>
                    <span className='text-2xl font-bold'>
                      {data.orders.totalOrders.toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    Doanh thu: {formatCurrency(data.orders.totalRevenue)}
                  </div>
                  <div className='bg-muted h-2 w-full rounded-full'>
                    <div
                      className='h-full rounded-full bg-blue-500'
                      style={{
                        width: `${(data.orders.revenueThisMonth / data.orders.totalRevenue) * 100}%`,
                      }}
                    />
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    Tháng này: {formatCurrency(data.orders.revenueThisMonth)} (
                    {(
                      (data.orders.revenueThisMonth /
                        data.orders.totalRevenue) *
                      100
                    ).toFixed(1)}
                    %)
                  </div>
                </div>

                {/* Users Summary */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Người dùng</span>
                    <span className='text-2xl font-bold'>
                      {data.users.totalUsers.toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    Hoạt động: {data.users.activeUsers.toLocaleString('vi-VN')}
                  </div>
                  <div className='bg-muted h-2 w-full rounded-full'>
                    <div
                      className='h-full rounded-full bg-green-500'
                      style={{
                        width: `${(data.users.activeUsers / data.users.totalUsers) * 100}%`,
                      }}
                    />
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    Mới tháng này: +
                    {data.users.newUsersThisMonth.toLocaleString('vi-VN')}
                  </div>
                </div>

                {/* Payments Summary */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Giao dịch</span>
                    <span className='text-2xl font-bold'>
                      {data.payments.totalTransactions.toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    Tổng: {formatCurrency(data.payments.totalRevenue)}
                  </div>
                  <div className='bg-muted h-2 w-full rounded-full'>
                    <div
                      className='h-full rounded-full bg-emerald-500'
                      style={{
                        width: `${(data.payments.successfulTransactions / data.payments.totalTransactions) * 100}%`,
                      }}
                    />
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    Thành công:{' '}
                    {data.payments.successfulTransactions.toLocaleString(
                      'vi-VN'
                    )}{' '}
                    (
                    {(
                      (data.payments.successfulTransactions /
                        data.payments.totalTransactions) *
                      100
                    ).toFixed(1)}
                    %)
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-muted-foreground text-center'>
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng gần đây</CardTitle>
          <CardDescription>
            {data?.orders
              ? `Bạn đã có ${data.orders.totalOrders.toLocaleString('vi-VN')} đơn hàng.`
              : 'Danh sách đơn hàng mới nhất'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentSales />
        </CardContent>
      </Card>
    </div>
  )
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  })
}
