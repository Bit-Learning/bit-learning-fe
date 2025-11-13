import { setIsAuthenticatedAction, setUserInfoAction } from '@/feature/auth/store'
import { selectAuthStateInfo } from '@/feature/auth/store/auth.selectors'
import { clearAuthTokens } from '@/shared/lib/cookies'
import { useAppDispatch } from '@/shared/redux/store'
import { Link, useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/Avatar'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { TabPanel, Tabs } from '@workspace/ui/components/Tabs'
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
    BookImage,
    ClipboardPlus,
    FileText,
    Home,
    LogOut,
    MessageSquare,
    Network,
    Presentation,
    Search,
    SquarePen,
} from 'lucide-react'
import * as React from 'react'
import { useSelector } from 'react-redux'
import { ChatTab } from '../components/ChatTab'
import { ConversationsTab } from '../components/ConversationsTab'
import { MindmapTab } from '../components/MindmapTab'
import { SlideTab } from '../components/SlideTab'

const AIChatbotPage = () => {
    const [activeTab, setActiveTab] = React.useState('chat')
    const [currentConversationId, setCurrentConversationId] = React.useState<string | undefined>(undefined)
    const [activeSection, setActiveSection] = React.useState('newChat')

    const { userInfo, isLoading } = useSelector(selectAuthStateInfo)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const menuItems = [
        { id: 'newChat', label: 'Đoạn hội thoại mới', icon: SquarePen },
        { id: 'search', label: 'Tìm kiếm đoạn hội thoại', icon: Search },
        { id: 'library', label: 'Thư viện', icon: BookImage },
        { id: 'project', label: 'Dự án', icon: ClipboardPlus },
    ]

    const handleSelectConversation = (id: string) => {
        setCurrentConversationId(id)
        setActiveTab('chat')
    }

    const handleConversationCreated = (id: string) => {
        setCurrentConversationId(id)
    }

    if (isLoading || !userInfo) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        )
    }

    const handleLogout = () => {
        clearAuthTokens()
        dispatch(setIsAuthenticatedAction(false))
        dispatch(setUserInfoAction(null))
        navigate({ to: '/signin' })
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
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild tooltip="Presentations">
                                            <Link to="/presentations">
                                                <FileText />
                                                <span>Bài thuyết trình</span>
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
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            onClick={() => setActiveTab('chat')}
                                            isActive={activeTab === 'chat'}
                                            tooltip="Chat với AI"
                                        >
                                            <MessageSquare />
                                            <span>Chat</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            onClick={() => setActiveTab('conversations')}
                                            isActive={activeTab === 'conversations'}
                                            tooltip="Danh sách conversations"
                                        >
                                            <SquarePen />
                                            <span>Conversations</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            onClick={() => setActiveTab('slides')}
                                            isActive={activeTab === 'slides'}
                                            tooltip="Tạo slide AI"
                                        >
                                            <Presentation />
                                            <span>Tạo Slide</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            onClick={() => setActiveTab('mindmap')}
                                            isActive={activeTab === 'mindmap'}
                                            tooltip="Tạo mind map AI"
                                        >
                                            <Network />
                                            <span>Tạo Mind Map</span>
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

                <SidebarInset className="flex flex-col">
                    {/* Header */}
                    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-white px-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <SidebarTrigger className="-ml-1" />
                            <div className="flex items-center gap-2">
                                <div>
                                    <h1 className="text-sm font-bold text-gray-900">AI Chatbot</h1>
                                    <p className="text-xs text-gray-500">
                                        {activeTab === 'chat' && 'Trò chuyện với AI'}
                                        {activeTab === 'conversations' && 'Danh sách hội thoại'}
                                        {activeTab === 'slides' && 'Tạo slide AI'}
                                        {activeTab === 'mindmap' && 'Tạo mind map AI'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
                            <Button
                                variant={activeTab === 'chat' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTab('chat')}
                                className="h-8 gap-2"
                            >
                                <MessageSquare size={14} />
                                Chat
                            </Button>
                            <Button
                                variant={activeTab === 'conversations' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTab('conversations')}
                                className="h-8 gap-2"
                            >
                                <SquarePen size={14} />
                                Conversations
                            </Button>
                            <Button
                                variant={activeTab === 'slides' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTab('slides')}
                                className="h-8 gap-2"
                            >
                                <Presentation size={14} />
                                Slides
                            </Button>
                            <Button
                                variant={activeTab === 'mindmap' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTab('mindmap')}
                                className="h-8 gap-2"
                            >
                                <Network size={14} />
                                Mind Map
                            </Button>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex flex-1 overflow-hidden">
                        <Tabs
                            selectedKey={activeTab}
                            onSelectionChange={key => setActiveTab(key as string)}
                            className="flex h-full w-full flex-col"
                        >
                            <TabPanel id="chat" className="m-0 h-full flex-1">
                                <ChatTab
                                    conversationId={currentConversationId}
                                    onConversationCreated={handleConversationCreated}
                                />
                            </TabPanel>

                            <TabPanel id="conversations" className="m-0 h-full flex-1">
                                <ConversationsTab
                                    onSelectConversation={handleSelectConversation}
                                    currentConversationId={currentConversationId}
                                />
                            </TabPanel>

                            <TabPanel id="slides" className="m-0 h-full flex-1">
                                <SlideTab chatContext={currentConversationId} />
                            </TabPanel>

                            <TabPanel id="mindmap" className="m-0 h-full flex-1">
                                <MindmapTab chatContext={currentConversationId} />
                            </TabPanel>
                        </Tabs>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}

export default AIChatbotPage
