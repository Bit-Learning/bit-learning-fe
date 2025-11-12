import { setIsAuthenticatedAction, setUserInfoAction } from '@/feature/auth/store'
import { requestUserProfile } from '@/feature/auth/store/auth.actions'
import { selectAuthStateInfo } from '@/feature/auth/store/auth.selectors'
import { useFetchOrdersByUserId } from '@/feature/order/hook/useOrder'
import { CreatePaymentURL } from '@/feature/payment/service/paymentService'
import { useUserPresentations } from '@/feature/presentations/hooks/usePresentations'
import { useFetchTransactionsByWalletId } from '@/feature/transaction/hook/useTransaction'
import { clearAuthTokens } from '@/shared/lib/cookies'
import { formatDateTime } from '@/shared/lib/date-time-utils'
import { useAppDispatch } from '@/shared/redux/store'
import { Link, useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/Avatar'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent } from '@workspace/ui/components/Card'
import SpinnerLoader from '@workspace/ui/components/loader/SpinnerLoader'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from '@workspace/ui/components/sidebar'
import {
    Activity,
    ArrowDownLeft,
    ArrowUpRight,
    Bell,
    Calendar,
    Camera,
    CreditCard,
    Home,
    Key,
    LogOut,
    MapPin,
    Package,
    Presentation,
    Settings,
    Shield,
    User,
    Wallet,
} from 'lucide-react'
import * as React from 'react'
import { useSelector } from 'react-redux'
import { AddFundsDialog } from '../components/AddFundsDialog'
import { ChangePasswordDialog } from '../components/ChangePasswordDialog'

function UserProfilePage() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { userInfo, isLoading } = useSelector(selectAuthStateInfo)
    const [activeSection, setActiveSection] = React.useState('overview')
    const [openAddFunds, setOpenAddFunds] = React.useState(false)
    const [openChangePassword, setOpenChangePassword] = React.useState(false)
    const { data: userPresentations, isLoading: presentationsLoading } = useUserPresentations(userInfo?.id || 0)
    const { data: userOrders, isLoading: ordersLoading } = useFetchOrdersByUserId(userInfo?.id || 0)
    const { data: userTransactions, isLoading: transactionsLoading } = useFetchTransactionsByWalletId(
        userInfo?.wallet?.id || 0,
    )

    React.useEffect(() => {
        // Fetch user profile on mount if not already loaded
        if (!userInfo) {
            dispatch(requestUserProfile())
        }
    }, [dispatch, userInfo])

    // User is guaranteed to exist here because of route-level protection
    if (isLoading || !userInfo) {
        return <SpinnerLoader />
    }

    const handleLogout = () => {
        clearAuthTokens()
        dispatch(setIsAuthenticatedAction(false))
        dispatch(setUserInfoAction(null))
        navigate({ to: '/signin' })
    }

    const menuItems = [
        { id: 'overview', label: 'Tổng quan', icon: User },
        { id: 'presentations', label: 'Bài thuyết trình', icon: Presentation },
        { id: 'orders', label: 'Đơn hàng', icon: Package },
        { id: 'wallet', label: 'Ví & Giao dịch', icon: Wallet },
        { id: 'activity', label: 'Hoạt động', icon: Activity },
        { id: 'notifications', label: 'Thông báo', icon: Bell },
        { id: 'security', label: 'Bảo mật', icon: Shield },
        { id: 'settings', label: 'Cài đặt', icon: Settings },
    ]

    const handleAddFunds = async (amount: number) => {
        const res = await CreatePaymentURL({
            amount: amount,
            description: 'Nạp tiền vào ví',
            walletId: userInfo.wallet.id,
        })
        window.location.href = res.data.data.url
    }

    return (
        <SidebarProvider defaultOpen>
            <div className="flex min-h-screen w-full">
                <Sidebar collapsible="icon">
                    <SidebarHeader>
                        <div className="flex items-center gap-3 px-2 py-3">
                            <Avatar className="h-10 w-10">
                                {userInfo.avatar && <AvatarImage src={userInfo.avatar} alt={userInfo.username} />}
                                <AvatarFallback className="bg-blue-600 text-white">
                                    {userInfo.username?.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">{userInfo.username}</span>
                                <Badge variant={userInfo.role === 'ADMIN' ? 'default' : 'secondary'} className="w-fit">
                                    {userInfo.role}
                                </Badge>
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Điều hướng</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild tooltip="Home">
                                            <Link to="/">
                                                <Home />
                                                <span>Trang chủ</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarGroup>
                            <SidebarGroupLabel>Hồ sơ</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {menuItems.map(item => (
                                        <SidebarMenuItem key={item.id}>
                                            <SidebarMenuButton
                                                onClick={() => setActiveSection(item.id)}
                                                isActive={activeSection === item.id}
                                                tooltip={item.label}
                                            >
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarGroup>
                            <SidebarGroupLabel>Tài khoản</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            tooltip="Password"
                                            onClick={() => setOpenChangePassword(true)}
                                        >
                                            <Key />
                                            <span>Đổi mật khẩu</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                                    <LogOut />
                                    <span>Đăng xuất</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>

                    <SidebarRail />
                </Sidebar>

                <SidebarInset>
                    <header className="border-sidebar-border bg-background sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <div className="flex flex-1 items-center justify-between">
                            <h1 className="text-xl font-semibold">Hồ sơ người dùng</h1>
                        </div>
                    </header>

                    <main className="flex-1">
                        {/* Profile Header Card with Banner */}
                        <Card className="overflow-hidden rounded-none border-x-0 border-t-0">
                            {/* Cover Photo Banner */}
                            <div className="relative h-48 w-full md:h-64 lg:h-80">
                                <img
                                    src="https://images.unsplash.com/photo-1480796927426-f609979314bd?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop"
                                    alt="Cover"
                                    className="h-full w-full object-cover"
                                />
                                <Button size="sm" variant="secondary" className="absolute bottom-4 right-4 gap-2">
                                    <Camera className="h-4 w-4" />
                                    <span className="hidden sm:inline">Chỉnh sửa ảnh bìa</span>
                                </Button>
                            </div>

                            <CardContent className="relative bg-white p-6">
                                <div className="flex flex-col items-start gap-6 md:flex-row md:items-end">
                                    <div className="relative -mt-20 md:-mt-24">
                                        <div className="rounded-full bg-white p-1">
                                            <Avatar className="h-32 w-32 border-4 border-white shadow-xl md:h-40 md:w-40">
                                                {userInfo.avatar && (
                                                    <AvatarImage src={userInfo.avatar} alt={userInfo.username} />
                                                )}
                                                <AvatarFallback className="bg-blue-600 text-2xl text-white md:text-3xl">
                                                    {userInfo.username?.slice(0, 2).toUpperCase() || '??'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-white shadow-md hover:bg-gray-50"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                                            {/* <Badge variant={userInfo.role === 'ADMIN' ? 'default' : 'secondary'}>
                                                {userInfo.role}
                                            </Badge> */}
                                            {/* <Badge variant={userInfo.activated ? 'default' : 'destructive'}>
                                                {userInfo.activated ? 'Active' : 'Inactive'}
                                            </Badge> */}
                                            <p className="text-base">{userInfo.firstName + ' ' + userInfo.lastName}</p>
                                        </div>

                                        <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                {/* <Mail className="size-4" /> */}
                                                {userInfo.email}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="size-4" />
                                                {userInfo.langKey?.toUpperCase() || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="size-4" />
                                                Last login:{' '}
                                                {userInfo.lastLoginAttempt
                                                    ? new Date(userInfo.lastLoginAttempt * 1000).toLocaleString()
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                        <Button onClick={() => setOpenAddFunds(true)}>Nạp tiền</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dynamic Content Based on Active Section */}
                        <div className="space-y-4 p-6">
                            {activeSection === 'overview' && (
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="mb-4 text-lg font-semibold">Tổng quan tài khoản</h3>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="text-muted-foreground text-sm font-medium">
                                                    Họ và tên
                                                </label>
                                                <p className="text-base">
                                                    {userInfo.firstName + ' ' + userInfo.lastName}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-muted-foreground text-sm font-medium">
                                                    Ngày tham gia
                                                </label>
                                                <p className="break-all font-mono text-xs">
                                                    {userInfo.createdAt.slice(0, 10) || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {activeSection === 'presentations' && (
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="mb-6 flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">Bài thuyết trình</h3>
                                        </div>
                                        {presentationsLoading ? (
                                            <div className="flex justify-center py-8">
                                                <SpinnerLoader />
                                            </div>
                                        ) : userPresentations && userPresentations.length > 0 ? (
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                {userPresentations.map(pres => (
                                                    <Card key={pres.id} className="p-4">
                                                        <div className="mb-2 flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <p className="font-semibold">{pres.name}</p>
                                                                <p className="text-muted-foreground text-sm">
                                                                    {pres.type}
                                                                </p>
                                                                <p>{formatDateTime(pres.createdAt ?? '')}</p>
                                                            </div>
                                                            <Badge
                                                                variant={pres.processing ? 'secondary' : 'secondary'}
                                                            >
                                                                {pres.processing ? 'Đang xử lí, xin vui lòng đợi' : ''}
                                                            </Badge>
                                                        </div>
                                                        {!pres.processing && (
                                                            <div className="mt-3 flex gap-2">
                                                                <Link
                                                                    to="/presentations/$id/presenter"
                                                                    params={{ id: pres.id.toString() }}
                                                                >
                                                                    <Button size="sm" variant="default">
                                                                        Trình chiếu
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        )}
                                                        {pres.processing && (
                                                            <p className="text-muted-foreground mt-2 text-xs">
                                                                Bài thuyết trình của bạn đang được tạo. Quá trình này có
                                                                thể mất vài phút...
                                                            </p>
                                                        )}
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-muted-foreground py-8 text-center">
                                                <p>Không có dữ liệu</p>
                                                <Link to="/presentations">
                                                    <Button variant="outline" className="mt-4">
                                                        Xem các mẫu có sẵn
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {activeSection === 'orders' && (
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="mb-6 flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">My Orders</h3>
                                            <Badge variant="secondary">
                                                {userOrders?.length || 0}{' '}
                                                {userOrders?.length === 1 ? 'Đơn hàng' : 'Đơn hàng'}
                                            </Badge>
                                        </div>
                                        {ordersLoading ? (
                                            <div className="flex justify-center py-8">
                                                <SpinnerLoader />
                                            </div>
                                        ) : userOrders && userOrders.length > 0 ? (
                                            <div className="space-y-4">
                                                {userOrders.map(order => (
                                                    <Card key={order.id} className="border-l-4 border-l-blue-500">
                                                        <CardContent className="p-4">
                                                            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-semibold">
                                                                            Order #{order.id}
                                                                        </h4>
                                                                        <Badge
                                                                            variant={
                                                                                order.status === 'COMPLETED'
                                                                                    ? 'default'
                                                                                    : order.status === 'PENDING'
                                                                                      ? 'secondary'
                                                                                      : 'destructive'
                                                                            }
                                                                        >
                                                                            {order.status}
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-muted-foreground text-sm">
                                                                        {new Date(order.createdAt).toLocaleDateString(
                                                                            'en-US',
                                                                            {
                                                                                year: 'numeric',
                                                                                month: 'long',
                                                                                day: 'numeric',
                                                                                hour: '2-digit',
                                                                                minute: '2-digit',
                                                                            },
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm text-gray-600">
                                                                        Tổng số tiền
                                                                    </p>
                                                                    <p className="text-xl font-bold text-blue-600">
                                                                        {order.totalAmount.toLocaleString('vi-VN')} ₫
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <p className="text-sm font-medium">
                                                                    Chi tiết đơn hàng:
                                                                </p>
                                                                <div className="space-y-2">
                                                                    {order.orderDetails.map(detail => (
                                                                        <div
                                                                            key={detail.id}
                                                                            className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                                                                        >
                                                                            <div className="flex-1">
                                                                                <p className="font-medium">
                                                                                    {detail.productName}
                                                                                </p>
                                                                                <p className="text-muted-foreground text-sm">
                                                                                    Quantity: {detail.quantity} × Unit
                                                                                    Price:{' '}
                                                                                    {detail.unitPrice.toLocaleString(
                                                                                        'vi-VN',
                                                                                    )}{' '}
                                                                                    ₫
                                                                                </p>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <p className="font-semibold">
                                                                                    {detail.amount.toLocaleString(
                                                                                        'vi-VN',
                                                                                    )}{' '}
                                                                                    ₫
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="mt-4 flex items-center justify-between border-t pt-3">
                                                                <p className="text-muted-foreground text-xs">
                                                                    Cập nhật lần cuối:{' '}
                                                                    {new Date(order.updatedAt).toLocaleString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    })}
                                                                </p>
                                                                {order.status === 'COMPLETED' && (
                                                                    <Button variant="outline" size="sm">
                                                                        Xem hóa đơn
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-muted-foreground py-8 text-center">
                                                <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                <p className="mb-2 text-lg font-medium">Chưa có dữ liệu</p>
                                                <p className="text-sm">
                                                    Lịch sử đặt hàng của bạn sẽ xuất hiện ở đây sau khi bạn mua hàng.
                                                </p>
                                                <Button variant="outline" className="mt-4">
                                                    Xem các sản phẩm
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {activeSection === 'wallet' && (
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="mb-6 flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">Lịch sử giao dịch</h3>
                                            <Badge variant="secondary">{userTransactions?.length || 0} Giao dịch</Badge>
                                        </div>
                                        {transactionsLoading ? (
                                            <div className="flex justify-center py-8">
                                                <SpinnerLoader />
                                            </div>
                                        ) : userTransactions && userTransactions.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b">
                                                            <th className="pb-3 text-left text-sm font-semibold">
                                                                Mã GD
                                                            </th>
                                                            <th className="pb-3 text-left text-sm font-semibold">
                                                                Loại giao dịch
                                                            </th>
                                                            <th className="pb-3 text-right text-sm font-semibold">
                                                                Số tiền
                                                            </th>
                                                            <th className="pb-3 text-center text-sm font-semibold">
                                                                Trạng thái
                                                            </th>
                                                            <th className="pb-3 text-right text-sm font-semibold">
                                                                Thời gian
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {userTransactions.map(transaction => (
                                                            <tr key={transaction.id} className="border-b">
                                                                <td className="py-4 text-sm font-medium">
                                                                    #{transaction.id}
                                                                </td>
                                                                <td className="py-4">
                                                                    <div className="flex items-center gap-2">
                                                                        {transaction.type === 'PURCHASE' ? (
                                                                            <CreditCard className="h-4 w-4 text-blue-600" />
                                                                        ) : transaction.type === 'DEPOSIT' ? (
                                                                            <ArrowDownLeft className="h-4 w-4 text-green-600" />
                                                                        ) : (
                                                                            <ArrowUpRight className="h-4 w-4 text-purple-600" />
                                                                        )}
                                                                        <span className="text-sm">
                                                                            {transaction.type === 'PURCHASE'
                                                                                ? 'Mua hàng'
                                                                                : transaction.type === 'DEPOSIT'
                                                                                  ? 'Nạp tiền'
                                                                                  : 'Sử dụng AI'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-4 text-right font-semibold">
                                                                    <span
                                                                        className={
                                                                            transaction.type === 'DEPOSIT'
                                                                                ? 'text-green-600'
                                                                                : 'text-red-600'
                                                                        }
                                                                    >
                                                                        {transaction.type === 'DEPOSIT' ? '+' : '-'}
                                                                        {Math.abs(transaction.amount).toLocaleString(
                                                                            'vi-VN',
                                                                        )}{' '}
                                                                        ₫
                                                                    </span>
                                                                </td>
                                                                <td className="py-4 text-center">
                                                                    <Badge
                                                                        variant={
                                                                            transaction.status === 'COMPLETED'
                                                                                ? 'default'
                                                                                : transaction.status === 'PENDING'
                                                                                  ? 'secondary'
                                                                                  : 'destructive'
                                                                        }
                                                                        className={
                                                                            transaction.status === 'COMPLETED'
                                                                                ? 'bg-green-100 text-green-800'
                                                                                : transaction.status === 'PENDING'
                                                                                  ? 'bg-yellow-100 text-yellow-800'
                                                                                  : 'bg-red-100 text-red-800'
                                                                        }
                                                                    >
                                                                        {transaction.status === 'COMPLETED'
                                                                            ? 'Hoàn thành'
                                                                            : transaction.status === 'PENDING'
                                                                              ? 'Đang xử lý'
                                                                              : 'Thất bại'}
                                                                    </Badge>
                                                                </td>
                                                                <td className="text-muted-foreground py-4 text-right text-sm">
                                                                    {new Date(transaction.createdAt).toLocaleString(
                                                                        'vi-VN',
                                                                        {
                                                                            year: 'numeric',
                                                                            month: '2-digit',
                                                                            day: '2-digit',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                        },
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-muted-foreground py-8 text-center">
                                                <Wallet className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                <p className="mb-2 text-lg font-medium">Chưa có giao dịch</p>
                                                <p className="text-sm">
                                                    Lịch sử giao dịch của bạn sẽ xuất hiện ở đây sau khi bạn thực hiện
                                                    giao dịch đầu tiên.
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {activeSection === 'activity' && (
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
                                        <p className="text-muted-foreground">No recent activity to display.</p>
                                    </CardContent>
                                </Card>
                            )}

                            {activeSection === 'notifications' && (
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="mb-4 text-lg font-semibold">Notifications</h3>
                                        <p className="text-muted-foreground">You have no new notifications.</p>
                                    </CardContent>
                                </Card>
                            )}

                            {activeSection === 'security' && (
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="mb-4 text-lg font-semibold">Security Settings</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium">Two-Factor Authentication</label>
                                                <p className="text-muted-foreground text-sm">
                                                    Add an extra layer of security
                                                </p>
                                            </div>
                                            <Button variant="outline">Enable 2FA</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {activeSection === 'settings' && (
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="mb-4 text-lg font-semibold">Account Settings</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium">Language</label>
                                                <p className="text-base">{userInfo.langKey?.toUpperCase() || 'EN'}</p>
                                            </div>
                                            <Button variant="outline">Update Settings</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Profile Tabs Content */}
                        {/* <ProfileContent /> */}
                    </main>
                    <AddFundsDialog
                        open={openAddFunds}
                        onOpenChange={setOpenAddFunds}
                        onConfirm={amount => handleAddFunds(amount)}
                    />
                    <ChangePasswordDialog open={openChangePassword} onOpenChange={setOpenChangePassword} />
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}

export default UserProfilePage
