import { useLogout } from '@/feature/auth/queries/useAuth'
import { selectAuthStateInfo } from '@/feature/auth/store/auth.selectors'
import { SidebarMentor } from '@/shared/components/mentor/sidebar-mentor'
import { mergeName } from '@/shared/lib/string-utils'
import { useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/Avatar'
import { Button } from '@workspace/ui/components/Button'
import { Menu as DropdownMenu, MenuItem, MenuPopover, MenuSeparator, MenuTrigger } from '@workspace/ui/components/Menu'
import { cn } from '@workspace/ui/lib/utils'
import { Bell, Home, LogOut, Menu, X } from 'lucide-react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'

interface MentorLayoutProps {
    children: React.ReactNode
}

export default function MentorLayout({ children }: MentorLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [activeMenu, setActiveMenu] = useState('dashboard')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { userInfo } = useSelector(selectAuthStateInfo)
    const logout = useLogout()
    const navigate = useNavigate()

    const handleGoHome = () => {
        navigate({ to: '/' })
    }

    const handleLogout = () => {
        logout()
        navigate({ to: '/signin' })
    }

    return (
        <div className="relative z-10 bg-white p-6 sm:p-0 dark:bg-gray-900">
            <div className="bg-linear-to-br relative min-h-screen from-slate-50 via-blue-50 to-indigo-50 dark:bg-gray-900">
                <SidebarMentor
                    isOpen={sidebarOpen}
                    isMobileOpen={mobileMenuOpen}
                    activeMenu={activeMenu}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                    onMobileClose={() => setMobileMenuOpen(false)}
                    onMenuClick={setActiveMenu}
                />

                <div className={cn('transition-all duration-300', sidebarOpen ? 'lg:ml-72' : 'lg:ml-20')}>
                    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="lg:hidden"
                                >
                                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                                </Button>

                                <div className="relative hidden md:block"></div>

                                <div className="flex items-center space-x-3">
                                    <Button variant="ghost" size="icon" className="relative">
                                        <Bell className="h-5 w-5 text-slate-600 dark:text-gray-400" />
                                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
                                    </Button>

                                    <MenuTrigger>
                                        <Button variant="ghost" className="flex h-auto items-center space-x-2 py-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={userInfo?.avatar} alt={userInfo?.username} />
                                                <AvatarFallback>
                                                    {userInfo?.avatar?.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col items-start">
                                                <span className="text-md font-medium">
                                                    {mergeName(userInfo?.firstName ?? '', userInfo?.lastName ?? '')}
                                                </span>
                                            </div>
                                        </Button>
                                        <MenuPopover className="min-w-[180px]">
                                            <DropdownMenu>
                                                <MenuItem onAction={handleGoHome} className="cursor-pointer">
                                                    <Home className="mr-2 h-4 w-4" />
                                                    Về trang chủ
                                                </MenuItem>
                                                <MenuSeparator />
                                                <MenuItem
                                                    onAction={handleLogout}
                                                    className="cursor-pointer text-red-600"
                                                >
                                                    <LogOut className="mr-2 h-4 w-4" />
                                                    Đăng xuất
                                                </MenuItem>
                                            </DropdownMenu>
                                        </MenuPopover>
                                    </MenuTrigger>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="p-6">{children}</main>
                </div>
            </div>
        </div>
    )
}
