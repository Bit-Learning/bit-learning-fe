import { ChatPrompt } from '@/shared/components/ChatPrompt'
import { useAuth } from '@/shared/context/AuthContext'
import { mockConversations } from '@/shared/data/chat-data'
import { Link, Navigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/Avatar'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
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
import { BookImage, ChevronLeft, ChevronRight, ClipboardPlus, Home, LogOut, Search, SquarePen } from 'lucide-react'
import * as React from 'react'

const ChatPromptPage = () => {
    const { user, isAuthenticated, logout } = useAuth()
    const [activeSection, setActiveSection] = React.useState('newChat')
    const [currentConversationIndex, setCurrentConversationIndex] = React.useState(0)

    if (!isAuthenticated || !user) {
        return <Navigate to="/sign-in" />
    }

    const handleLogout = () => {
        logout()
        window.location.href = '/sign-in'
    }

    const menuItems = [
        { id: 'newChat', label: 'Đoạn hội thoại mới', icon: SquarePen },
        { id: 'search', label: 'Tìm kiếm đoạn hội thoại', icon: Search },
        { id: 'library', label: 'Thư viện', icon: BookImage },
        { id: 'project', label: 'Dự án', icon: ClipboardPlus },
    ]

    const handlePrevConversation = () => {
        setCurrentConversationIndex(prev => (prev > 0 ? prev - 1 : mockConversations.length - 1))
    }

    const handleNextConversation = () => {
        setCurrentConversationIndex(prev => (prev < mockConversations.length - 1 ? prev + 1 : 0))
    }

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
                            <SidebarGroupLabel>Công cụ</SidebarGroupLabel>
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

                <SidebarInset className="flex flex-col">
                    {/* Header with Conversation Slider */}
                    <header className="bg-background sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                        </div>

                        {/* Conversation Slider */}
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={handlePrevConversation} className="h-8 w-8">
                                <ChevronLeft size={16} />
                            </Button>

                            <div className="min-w-[200px] text-center">
                                <p className="truncate text-sm font-semibold">
                                    {mockConversations[currentConversationIndex]?.title ?? 'No conversation'}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    {mockConversations[currentConversationIndex]?.date ?? ''}
                                </p>
                            </div>

                            <Button variant="ghost" size="icon" onClick={handleNextConversation} className="h-8 w-8">
                                <ChevronRight size={16} />
                            </Button>
                        </div>

                        <div className="w-10" />
                    </header>

                    {/* Main Content Area */}
                    <main className="relative flex-1">
                        <ChatPrompt />
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}

export default ChatPromptPage
