import { SidebarMentor } from '@/shared/components/mentor/sidebar-mentor'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/Avatar'
import { Button } from '@workspace/ui/components/Button'
import { cn } from '@workspace/ui/lib/utils'
import { Bell, Menu, X } from 'lucide-react'
import React, { useState } from 'react'

interface MentorLayoutProps {
    children: React.ReactNode
}

export default function MentorLayout({ children }: MentorLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [activeMenu, setActiveMenu] = useState('dashboard')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

                                    <Button variant="ghost" className="flex h-auto items-center space-x-2 py-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src="" />
                                            <AvatarFallback className="bg-linear-to-br from-blue-400 to-indigo-500 text-white">
                                                B
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="hidden text-sm font-medium sm:block">Bình</span>
                                    </Button>
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
