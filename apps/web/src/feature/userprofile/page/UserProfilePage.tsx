import ProfileContent from '@/shared/components/profile-page/profile-content'
import { useAuth } from '@/shared/context/AuthContext'
import { Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/Avatar'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent } from '@workspace/ui/components/Card'
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
import { Activity, Bell, Calendar, Camera, Home, Key, LogOut, Mail, MapPin, Settings, Shield, User } from 'lucide-react'
import * as React from 'react'

function UserProfilePage() {
    const { user, logout } = useAuth()
    const [activeSection, setActiveSection] = React.useState('overview')

    // User is guaranteed to exist here because of route-level protection
    if (!user) {
        return null // This should never happen due to beforeLoad
    }

    const handleLogout = () => {
        logout()
        window.location.href = '/signin'
    }

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'activity', label: 'Activity', icon: Activity },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'settings', label: 'Settings', icon: Settings },
    ]

    return (
        <SidebarProvider defaultOpen>
            <div className="flex min-h-screen w-full">
                <Sidebar collapsible="icon">
                    <SidebarHeader>
                        <div className="flex items-center gap-3 px-2 py-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage
                                    src="https://bundui-images.netlify.app/avatars/08.png"
                                    alt={user.username || 'Profile'}
                                />
                                <AvatarFallback>{user.username?.slice(0, 2).toUpperCase() || '??'}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">{user.username}</span>
                                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="w-fit">
                                    {user.role}
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
                                            <AvatarImage
                                                src="https://bundui-images.netlify.app/avatars/08.png"
                                                alt={user.username || 'Profile'}
                                            />
                                            <AvatarFallback className="text-2xl">
                                                {user.username?.slice(0, 2).toUpperCase() || '??'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                                            <h2 className="text-2xl font-bold">{user.username}</h2>
                                            <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                                                {user.role}
                                            </Badge>
                                            <Badge variant={user.activated ? 'default' : 'destructive'}>
                                                {user.activated ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground">Member since March 2023</p>
                                        <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Mail className="size-4" />
                                                {user.email}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="size-4" />
                                                {user.langKey?.toUpperCase() || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="size-4" />
                                                Last login:{' '}
                                                {user.lastLoginAttempt
                                                    ? new Date(user.lastLoginAttempt * 1000).toLocaleString()
                                                    : 'N/A'}
                                            </div>
                                        </div>
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
                                                    User ID
                                                </label>
                                                <p className="text-base">{user.id}</p>
                                            </div>
                                            <div>
                                                <label className="text-muted-foreground text-sm font-medium">
                                                    Activation Key
                                                </label>
                                                <p className="font-mono text-xs break-all">{user.activationKey}</p>
                                            </div>
                                        </div>
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
                                                <p className="text-base">{user.langKey?.toUpperCase() || 'EN'}</p>
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
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}

export default UserProfilePage
