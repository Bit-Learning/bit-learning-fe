import { Users, TrendingUp, Activity, UserPlus } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { UserDashboardStats } from '../types/dashboard.types'

interface UserStatsTabProps {
  data?: UserDashboardStats
  isLoading: boolean
}

export function UserStatsTab({ data, isLoading }: UserStatsTabProps) {
  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 5 }).map((_, i) => (
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
        Không thể tải dữ liệu người dùng
      </div>
    )
  }

  const stats = [
    {
      title: 'Tổng người dùng',
      value: data.totalUsers.toLocaleString('vi-VN'),
      description: `Tổng số tài khoản trong hệ thống`,
      icon: Users,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
    },
    {
      title: 'Người dùng hoạt động',
      value: data.activeUsers.toLocaleString('vi-VN'),
      description: `${((data.activeUsers / data.totalUsers) * 100).toFixed(1)}% tổng người dùng`,
      icon: Activity,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-950',
    },
    {
      title: 'Mới hôm nay',
      value: `+${data.newUsersToday.toLocaleString('vi-VN')}`,
      description: 'Người dùng đăng ký mới',
      icon: UserPlus,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
    },
    {
      title: 'Mới tuần này',
      value: `+${data.newUsersThisWeek.toLocaleString('vi-VN')}`,
      description: '7 ngày gần đây',
      icon: TrendingUp,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-950',
    },
    {
      title: 'Mới tháng này',
      value: `+${data.newUsersThisMonth.toLocaleString('vi-VN')}`,
      description: '30 ngày gần đây',
      icon: TrendingUp,
      iconColor: 'text-pink-600',
      bgColor: 'bg-pink-100 dark:bg-pink-950',
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

      {/* User Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tăng trưởng người dùng</CardTitle>
          <CardDescription>
            Số lượng người dùng mới theo thời gian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground text-sm'>Hôm nay</span>
                <div className='flex items-center gap-2'>
                  <div
                    className='h-2 rounded-full bg-blue-500'
                    style={{
                      width: `${(data.newUsersToday / data.newUsersThisMonth) * 100}%`,
                      minWidth: '20px',
                    }}
                  />
                  <span className='text-sm font-medium'>
                    {data.newUsersToday.toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground text-sm'>Tuần này</span>
                <div className='flex items-center gap-2'>
                  <div
                    className='h-2 rounded-full bg-orange-500'
                    style={{
                      width: `${(data.newUsersThisWeek / data.newUsersThisMonth) * 100}%`,
                      minWidth: '40px',
                    }}
                  />
                  <span className='text-sm font-medium'>
                    {data.newUsersThisWeek.toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground text-sm'>Tháng này</span>
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-full rounded-full bg-pink-500' />
                  <span className='text-sm font-medium'>
                    {data.newUsersThisMonth.toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>

            <div className='rounded-lg border p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-muted-foreground text-sm'>
                    Tỷ lệ người dùng hoạt động
                  </p>
                  <p className='text-2xl font-bold'>
                    {((data.activeUsers / data.totalUsers) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-muted-foreground text-sm'>
                    Hoạt động / Tổng
                  </p>
                  <p className='text-sm font-medium'>
                    {data.activeUsers.toLocaleString('vi-VN')} /{' '}
                    {data.totalUsers.toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
