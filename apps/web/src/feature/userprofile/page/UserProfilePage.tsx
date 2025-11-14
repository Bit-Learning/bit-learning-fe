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
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/Card'
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
    CheckCircle,
    Clock,
    CreditCard,
    Filter,
    Home,
    Key,
    LogOut,
    MapPin,
    Package,
    Presentation,
    Settings,
    Shield,
    TrendingDown,
    TrendingUp,
    User,
    Wallet,
    XCircle,
} from 'lucide-react'
import * as React from 'react'
import { useSelector } from 'react-redux'
import { AddFundsDialog } from '../components/AddFundsDialog'
import { ChangePasswordDialog } from '../components/ChangePasswordDialog'
import '../styles/button.css'
import '../styles/present.button.css'

function UserProfilePage() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { userInfo, isLoading } = useSelector(selectAuthStateInfo)
    const [activeSection, setActiveSection] = React.useState('overview')
    const [openAddFunds, setOpenAddFunds] = React.useState(false)
    const [openChangePassword, setOpenChangePassword] = React.useState(false)
    const [transactionTypeFilter, setTransactionTypeFilter] = React.useState<string>('ALL')
    const [transactionStatusFilter, setTransactionStatusFilter] = React.useState<string>('ALL')
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

    // Filter transactions based on selected filters
    const filteredTransactions = React.useMemo(() => {
        if (!userTransactions) return []

        return userTransactions.filter(transaction => {
            const typeMatch = transactionTypeFilter === 'ALL' || transaction.type === transactionTypeFilter
            const statusMatch = transactionStatusFilter === 'ALL' || transaction.status === transactionStatusFilter
            return typeMatch && statusMatch
        })
    }, [userTransactions, transactionTypeFilter, transactionStatusFilter])

    // Calculate transaction statistics
    const transactionStats = React.useMemo(() => {
        if (!userTransactions || userTransactions.length === 0) {
            return {
                totalDeposit: 0,
                totalSpent: 0,
                totalTransactions: 0,
                completedCount: 0,
                pendingCount: 0,
                failedCount: 0,
            }
        }

        return userTransactions.reduce(
            (acc, transaction) => {
                if (transaction.type === 'DEPOSIT' && transaction.status === 'COMPLETED') {
                    acc.totalDeposit += transaction.amount
                }
                if (
                    (transaction.type === 'PURCHASE' || transaction.type === 'AI_REQUEST') &&
                    transaction.status === 'COMPLETED'
                ) {
                    acc.totalSpent += transaction.amount
                }
                if (transaction.status === 'COMPLETED') acc.completedCount++
                if (transaction.status === 'PENDING') acc.pendingCount++
                if (transaction.status === 'FAILED') acc.failedCount++
                acc.totalTransactions++
                return acc
            },
            {
                totalDeposit: 0,
                totalSpent: 0,
                totalTransactions: 0,
                completedCount: 0,
                pendingCount: 0,
                failedCount: 0,
            },
        )
    }, [userTransactions])

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
                                                {userInfo.lastLoginAttempt && formatDateTime(userInfo.lastLoginAttempt)}
                                            </div>
                                        </div>
                                        <button className="button-deposit" onClick={() => setOpenAddFunds(true)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24">
                                                <path d="m18 0 8 12 10-8-4 20H4L0 4l10 8 8-12z"></path>
                                            </svg>
                                            Nạp tiền
                                        </button>
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
                                                                    <button className="button">
                                                                        <span className="text"> Trình chiếu</span>
                                                                        <span className="svg">
                                                                            <svg
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                width="50"
                                                                                height="20"
                                                                                viewBox="0 0 38 15"
                                                                                fill="none"
                                                                            >
                                                                                <path
                                                                                    fill="white"
                                                                                    d="M10 7.519l-.939-.344h0l.939.344zm14.386-1.205l-.981-.192.981.192zm1.276 5.509l.537.843.148-.094.107-.139-.792-.611zm4.819-4.304l-.385-.923h0l.385.923zm7.227.707a1 1 0 0 0 0-1.414L31.343.448a1 1 0 0 0-1.414 0 1 1 0 0 0 0 1.414l5.657 5.657-5.657 5.657a1 1 0 0 0 1.414 1.414l6.364-6.364zM1 7.519l.554.833.029-.019.094-.061.361-.23 1.277-.77c1.054-.609 2.397-1.32 3.629-1.787.617-.234 1.17-.392 1.623-.455.477-.066.707-.008.788.034.025.013.031.021.039.034a.56.56 0 0 1 .058.235c.029.327-.047.906-.39 1.842l1.878.689c.383-1.044.571-1.949.505-2.705-.072-.815-.45-1.493-1.16-1.865-.627-.329-1.358-.332-1.993-.244-.659.092-1.367.305-2.056.566-1.381.523-2.833 1.297-3.921 1.925l-1.341.808-.385.245-.104.068-.028.018c-.011.007-.011.007.543.84zm8.061-.344c-.198.54-.328 1.038-.36 1.484-.032.441.024.94.325 1.364.319.45.786.64 1.21.697.403.054.824-.001 1.21-.09.775-.179 1.694-.566 2.633-1.014l3.023-1.554c2.115-1.122 4.107-2.168 5.476-2.524.329-.086.573-.117.742-.115s.195.038.161.014c-.15-.105.085-.139-.076.685l1.963.384c.192-.98.152-2.083-.74-2.707-.405-.283-.868-.37-1.28-.376s-.849.069-1.274.179c-1.65.43-3.888 1.621-5.909 2.693l-2.948 1.517c-.92.439-1.673.743-2.221.87-.276.064-.429.065-.492.057-.043-.006.066.003.155.127.07.099.024.131.038-.063.014-.187.078-.49.243-.94l-1.878-.689zm14.343-1.053c-.361 1.844-.474 3.185-.413 4.161.059.95.294 1.72.811 2.215.567.544 1.242.546 1.664.459a2.34 2.34 0 0 0 .502-.167l.15-.076.049-.028.018-.011c.013-.008.013-.008-.524-.852l-.536-.844.019-.012c-.038.018-.064.027-.084.032-.037.008.053-.013.125.056.021.02-.151-.135-.198-.895-.046-.734.034-1.887.38-3.652l-1.963-.384zm2.257 5.701l.791.611.024-.031.08-.101.311-.377 1.093-1.213c.922-.954 2.005-1.894 2.904-2.27l-.771-1.846c-1.31.547-2.637 1.758-3.572 2.725l-1.184 1.314-.341.414-.093.117-.025.032c-.01.013-.01.013.781.624zm5.204-3.381c.989-.413 1.791-.42 2.697-.307.871.108 2.083.385 3.437.385v-2c-1.197 0-2.041-.226-3.19-.369-1.114-.139-2.297-.146-3.715.447l.771 1.846z"
                                                                                ></path>
                                                                            </svg>
                                                                        </span>
                                                                    </button>
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
                                <>
                                    {/* Summary Cards */}
                                    <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <Card className="border-l-4 border-l-green-500">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="flex items-center justify-between text-sm font-medium">
                                                    <span className="text-muted-foreground">Tổng nạp</span>
                                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-green-600">
                                                    {transactionStats.totalDeposit.toLocaleString('vi-VN')} ₫
                                                </div>
                                                <p className="text-muted-foreground mt-1 text-xs">
                                                    Tổng tiền đã nạp vào ví
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-l-4 border-l-red-500">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="flex items-center justify-between text-sm font-medium">
                                                    <span className="text-muted-foreground">Tổng chi</span>
                                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-red-600">
                                                    {transactionStats.totalSpent.toLocaleString('vi-VN')} ₫
                                                </div>
                                                <p className="text-muted-foreground mt-1 text-xs">
                                                    Tổng chi tiêu & sử dụng
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-l-4 border-l-blue-500">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="flex items-center justify-between text-sm font-medium">
                                                    <span className="text-muted-foreground">Số dư hiện tại</span>
                                                    <Wallet className="h-4 w-4 text-blue-600" />
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {userInfo.wallet?.balance?.toLocaleString('vi-VN') || 0} ₫
                                                </div>
                                                <p className="text-muted-foreground mt-1 text-xs">
                                                    Số dư khả dụng trong ví
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-l-4 border-l-purple-500">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="flex items-center justify-between text-sm font-medium">
                                                    <span className="text-muted-foreground">Giao dịch</span>
                                                    <Activity className="h-4 w-4 text-purple-600" />
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-purple-600">
                                                    {transactionStats.totalTransactions}
                                                </div>
                                                <div className="mt-1 flex gap-2 text-xs">
                                                    <span className="flex items-center gap-1 text-green-600">
                                                        <CheckCircle className="h-3 w-3" />
                                                        {transactionStats.completedCount}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-yellow-600">
                                                        <Clock className="h-3 w-3" />
                                                        {transactionStats.pendingCount}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-red-600">
                                                        <XCircle className="h-3 w-3" />
                                                        {transactionStats.failedCount}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Transaction History */}
                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="mb-6 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-semibold">Lịch sử giao dịch</h3>
                                                    <Badge variant="outline" className="text-sm">
                                                        {filteredTransactions.length} / {userTransactions?.length || 0}{' '}
                                                        giao dịch
                                                    </Badge>
                                                </div>

                                                {/* Filters */}
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <Filter className="text-muted-foreground h-4 w-4" />
                                                        <span className="text-muted-foreground text-sm font-medium">
                                                            Loại giao dịch:
                                                        </span>
                                                        <div className="flex flex-wrap gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant={
                                                                    transactionTypeFilter === 'ALL'
                                                                        ? 'default'
                                                                        : 'outline'
                                                                }
                                                                onClick={() => setTransactionTypeFilter('ALL')}
                                                            >
                                                                Tất cả
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant={
                                                                    transactionTypeFilter === 'DEPOSIT'
                                                                        ? 'default'
                                                                        : 'outline'
                                                                }
                                                                onClick={() => setTransactionTypeFilter('DEPOSIT')}
                                                                className="gap-1"
                                                            >
                                                                <ArrowDownLeft className="h-3 w-3" />
                                                                Nạp tiền
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                variant={
                                                                    transactionTypeFilter === 'PURCHASE'
                                                                        ? 'default'
                                                                        : 'outline'
                                                                }
                                                                onClick={() => setTransactionTypeFilter('PURCHASE')}
                                                                className="gap-1"
                                                            >
                                                                <CreditCard className="h-3 w-3" />
                                                                Mua hàng
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant={
                                                                    transactionTypeFilter === 'AI_REQUEST'
                                                                        ? 'default'
                                                                        : 'outline'
                                                                }
                                                                onClick={() => setTransactionTypeFilter('AI_REQUEST')}
                                                                className="gap-1"
                                                            >
                                                                <ArrowUpRight className="h-3 w-3" />
                                                                Sử dụng AI
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Filter className="text-muted-foreground h-4 w-4" />
                                                        <span className="text-muted-foreground text-sm font-medium">
                                                            Trạng thái:
                                                        </span>
                                                        <div className="flex flex-wrap gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant={
                                                                    transactionStatusFilter === 'ALL'
                                                                        ? 'default'
                                                                        : 'outline'
                                                                }
                                                                onClick={() => setTransactionStatusFilter('ALL')}
                                                            >
                                                                Tất cả
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant={
                                                                    transactionStatusFilter === 'COMPLETED'
                                                                        ? 'default'
                                                                        : 'outline'
                                                                }
                                                                onClick={() => setTransactionStatusFilter('COMPLETED')}
                                                                className="gap-1"
                                                            >
                                                                <CheckCircle className="h-3 w-3" />
                                                                Hoàn thành
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant={
                                                                    transactionStatusFilter === 'PENDING'
                                                                        ? 'default'
                                                                        : 'outline'
                                                                }
                                                                onClick={() => setTransactionStatusFilter('PENDING')}
                                                                className="gap-1"
                                                            >
                                                                <Clock className="h-3 w-3" />
                                                                Đang xử lý
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant={
                                                                    transactionStatusFilter === 'FAILED'
                                                                        ? 'default'
                                                                        : 'outline'
                                                                }
                                                                onClick={() => setTransactionStatusFilter('FAILED')}
                                                                className="gap-1"
                                                            >
                                                                <XCircle className="h-3 w-3" />
                                                                Thất bại
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {transactionsLoading ? (
                                                <div className="flex justify-center py-8">
                                                    <SpinnerLoader />
                                                </div>
                                            ) : filteredTransactions && filteredTransactions.length > 0 ? (
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
                                                            {filteredTransactions.map(transaction => (
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
                                                                            {Math.abs(
                                                                                transaction.amount,
                                                                            ).toLocaleString('vi-VN')}{' '}
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
                                                    <p className="mb-2 text-lg font-medium">
                                                        {userTransactions && userTransactions.length > 0
                                                            ? 'Không tìm thấy giao dịch phù hợp'
                                                            : 'Chưa có giao dịch'}
                                                    </p>
                                                    <p className="text-sm">
                                                        {userTransactions && userTransactions.length > 0
                                                            ? 'Thử thay đổi bộ lọc để xem các giao dịch khác'
                                                            : 'Lịch sử giao dịch của bạn sẽ xuất hiện ở đây sau khi bạn thực hiện giao dịch đầu tiên.'}
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </>
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
