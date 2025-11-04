import { setIsAuthenticatedAction, setUserInfoAction } from '@/feature/auth/store'
import { requestUserProfile } from '@/feature/auth/store/auth.actions'
import { selectAuthStateInfo } from '@/feature/auth/store/auth.selectors'
import { CreatePaymentURL } from '@/feature/payment/service/paymentService'
import { useUserPresentations } from '@/feature/presentations/hooks/usePresentations'
import ProfileContent from '@/shared/components/profile-page/profile-content'
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
    Bell,
    Calendar,
    Camera,
    Home,
    Key,
    LogOut,
    Mail,
    MapPin,
    Presentation,
    Settings,
    Shield,
    User,
} from 'lucide-react'
import * as React from 'react'
import { useSelector } from 'react-redux'
import { AddFundsDialog } from '../components/AddFundsDialog'

function UserProfilePage() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { userInfo, isLoading } = useSelector(selectAuthStateInfo)
    const [activeSection, setActiveSection] = React.useState('overview')
    const [openAddFunds, setOpenAddFunds] = React.useState(false)
    const { data: userPresentations, isLoading: presentationsLoading } = useUserPresentations(userInfo?.id || 0)

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
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'presentations', label: 'My Presentations', icon: Presentation },
        { id: 'activity', label: 'Activity', icon: Activity },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'settings', label: 'Settings', icon: Settings },
    ]

    const handleAddFunds = async (amount: number) => {
        const res = await CreatePaymentURL({
            amount: amount,
            description: 'Add funds to wallet',
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
                            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild tooltip="Home">
                                            <Link to="/">
                                                <Home />
                                                <span>Home</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarGroup>
                            <SidebarGroupLabel>Profile</SidebarGroupLabel>
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
                            <SidebarGroupLabel>Account</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton tooltip="Password">
                                            <Key />
                                            <span>Change Password</span>
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
                                    <span>Logout</span>
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
                            <h1 className="text-xl font-semibold">User Profile</h1>
                        </div>
                    </header>

                    <main className="flex-1 space-y-6 p-6">
                        {/* Profile Header Card */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                                    <div className="relative">
                                        <Avatar className="h-24 w-24">
                                            {userInfo.avatar && (
                                                <AvatarImage src={userInfo.avatar} alt={userInfo.username} />
                                            )}
                                            <AvatarFallback className="bg-blue-600 text-2xl text-white">
                                                {userInfo.username?.slice(0, 2).toUpperCase() || '??'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <p className="text-base">{userInfo.firstName + ' ' + userInfo.lastName}</p>

                                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                                            <h2 className="text-2xl font-bold">{userInfo.username}</h2>
                                            {/* <Badge variant={userInfo.role === 'ADMIN' ? 'default' : 'secondary'}>
                                                {userInfo.role}
                                            </Badge> */}
                                            <Badge variant={userInfo.activated ? 'default' : 'destructive'}>
                                                {userInfo.activated ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground">
                                            Thành viên kể từ
                                            {' ' + userInfo.createdAt.slice(0, 10) || 'N/A'}
                                        </p>
                                        <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Mail className="size-4" />
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
                                        <Button onClick={() => setOpenAddFunds(true)}>Add Funds to Wallet</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dynamic Content Based on Active Section */}
                        <div className="space-y-4">
                            {activeSection === 'overview' && (
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="mb-4 text-lg font-semibold">Account Overview</h3>
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
                                            <h3 className="text-lg font-semibold">My Presentations</h3>
                                            <Link to="/presentations">
                                                <Button variant="outline" size="sm">
                                                    View All
                                                </Button>
                                            </Link>
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
                                                                {pres.processing ? 'Processing' : ''}
                                                            </Badge>
                                                        </div>
                                                        {!pres.processing && (
                                                            <div className="mt-3 flex gap-2">
                                                                <Link
                                                                    to="/presentations/$id/presenter"
                                                                    params={{ id: pres.id.toString() }}
                                                                >
                                                                    <Button size="sm" variant="default">
                                                                        Present
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        )}
                                                        {pres.processing && (
                                                            <p className="text-muted-foreground mt-2 text-xs">
                                                                Your presentation is being generated. This may take a
                                                                few moments...
                                                            </p>
                                                        )}
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-muted-foreground py-8 text-center">
                                                <p>You haven&apos;t created any presentations yet.</p>
                                                <Link to="/presentations">
                                                    <Button variant="outline" className="mt-4">
                                                        Browse Templates
                                                    </Button>
                                                </Link>
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
                        <ProfileContent />
                    </main>
                    <AddFundsDialog
                        open={openAddFunds}
                        onOpenChange={setOpenAddFunds}
                        onConfirm={amount => handleAddFunds(amount)}
                    />
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}

export default UserProfilePage
