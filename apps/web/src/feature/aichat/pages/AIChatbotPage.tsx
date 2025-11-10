import { setIsAuthenticatedAction, setUserInfoAction } from '@/feature/auth/store'
import { selectAuthStateInfo } from '@/feature/auth/store/auth.selectors'
import { clearAuthTokens } from '@/shared/lib/cookies'
import { useAppDispatch } from '@/shared/redux/store'
import { Link, useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/Avatar'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Input } from '@workspace/ui/components/update/input'
import { X } from 'lucide-react'
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
    ArrowUp,
    BookImage,
    ChevronLeft,
    ChevronRight,
    ClipboardPlus,
    FileText,
    Home,
    LogOut,
    Presentation,
    Search,
    SquarePen,
} from 'lucide-react'
import * as React from 'react'
import { useSelector } from 'react-redux'
import { PrismCodeBlock } from '../../../shared/components/PrismCodeBlock'
import { mockConversations } from '../../../shared/data/chat-data'
import { SlideGenerationPanel } from '../components/SlideGenerationPanel'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: string
}

// Parse message content to handle code blocks and markdown
const parseMessageContent = (content: string) => {
    const parts = []
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: content.slice(lastIndex, match.index),
            })
        }

        parts.push({
            type: 'code',
            language: match[1] || 'text',
            content: match[2]?.trim() || '',
        })

        lastIndex = match.index + match[0].length
    }

    if (lastIndex < content.length) {
        parts.push({
            type: 'text',
            content: content.slice(lastIndex),
        })
    }

    return parts.length > 0 ? parts : [{ type: 'text', content }]
}

const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/)
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>
        }
        return part
    })
}

const MessageContent = ({ content }: { content: string }) => {
    const parts = parseMessageContent(content)

    return (
        <div>
            {parts.map((part, index) => {
                if (part.type === 'code') {
                    return <PrismCodeBlock key={index} code={part.content} language={part.language || 'text'} />
                }
                return (
                    <p key={index} className="whitespace-pre-wrap text-sm leading-relaxed">
                        {formatText(part.content)}
                    </p>
                )
            })}
        </div>
    )
}

const AIChatbotPage = () => {
    const [activeSection, setActiveSection] = React.useState('newChat')
    const [currentConversationIndex, setCurrentConversationIndex] = React.useState(0)
    const [showSlidePanel, setShowSlidePanel] = React.useState(false)
    const [message, setMessage] = React.useState('')
    const [messages, setMessages] = React.useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Xin chào! Tôi là AI chatbot. Tôi có thể giúp bạn:\n\n**1. Trả lời câu hỏi** về các chủ đề khác nhau\n**2. Tạo slide** từ cuộc trò chuyện của chúng ta\n**3. Giải thích code** và thuật toán\n\nBạn cần giúp đỡ gì hôm nay?',
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
    ])

    const { userInfo, isLoading } = useSelector(selectAuthStateInfo)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const messagesEndRef = React.useRef<HTMLDivElement>(null)

    const menuItems = [
        { id: 'newChat', label: 'Đoạn hội thoại mới', icon: SquarePen },
        { id: 'search', label: 'Tìm kiếm đoạn hội thoại', icon: Search },
        { id: 'library', label: 'Thư viện', icon: BookImage },
        { id: 'project', label: 'Dự án', icon: ClipboardPlus },
    ]

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    React.useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handlePrevConversation = () => {
        setCurrentConversationIndex(prev => (prev > 0 ? prev - 1 : mockConversations.length - 1))
    }

    const handleNextConversation = () => {
        setCurrentConversationIndex(prev => (prev < mockConversations.length - 1 ? prev + 1 : 0))
    }

    const handleSubmit = () => {
        if (!message.trim()) return

        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: message,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        }

        setMessages([...messages, newMessage])
        setMessage('')

        // Simulate AI response (replace with actual API call)
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Đây là câu trả lời mẫu. Trong phiên bản thực tế, đây sẽ là phản hồi từ AI.',
                timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            }
            setMessages(prev => [...prev, aiResponse])
        }, 1000)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
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

    const chatContext = messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join('\n')

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
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            onClick={() => setShowSlidePanel(!showSlidePanel)}
                                            isActive={showSlidePanel}
                                            tooltip="Tạo slide"
                                        >
                                            <Presentation />
                                            <span>Tạo slide</span>
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
                    <header className="bg-background sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={handlePrevConversation} className="h-8 w-8">
                                <ChevronLeft size={16} />
                            </Button>

                            <div className="min-w-[200px] text-center">
                                <p className="truncate text-sm font-semibold">
                                    {mockConversations[currentConversationIndex]?.title ?? 'AI Chatbot'}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    {mockConversations[currentConversationIndex]?.date ??
                                        new Date().toLocaleDateString('vi-VN')}
                                </p>
                            </div>

                            <Button variant="ghost" size="icon" onClick={handleNextConversation} className="h-8 w-8">
                                <ChevronRight size={16} />
                            </Button>
                        </div>

                        <div className="w-10" />
                    </header>

                    {/* Main Content */}
                    <main className="relative flex flex-1 overflow-hidden">
                        {/* Chat Panel */}
                        <div className={`flex h-full flex-col transition-all ${showSlidePanel ? 'w-3/5' : 'w-full'}`}>
                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto pb-32">
                                <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
                                    {messages.map(msg => (
                                        <div
                                            key={msg.id}
                                            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`rounded-2xl px-4 py-3 ${
                                                    msg.role === 'user'
                                                        ? 'text-accent-foreground max-w-[80%] bg-[#9EC6F3]'
                                                        : 'bg-muted max-w-[85%]'
                                                }`}
                                            >
                                                {msg.role === 'assistant' ? (
                                                    <MessageContent content={msg.content} />
                                                ) : (
                                                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                                                )}
                                                <span className="mt-2 block text-xs opacity-70">{msg.timestamp}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="bg-background fixed bottom-0 border-t py-3 transition-all" style={{ width: showSlidePanel ? '60%' : 'calc(100% - var(--sidebar-width, 0px))' }}>
                                <div className="bg-muted/50 mx-auto flex max-w-3xl items-center gap-2 rounded-2xl border px-4 py-2 shadow-sm">
                                    <Input
                                        type="text"
                                        placeholder="Nhập tin nhắn..."
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="flex-1 border-0 bg-transparent focus-visible:ring-0"
                                    />

                                    <Button
                                        type="button"
                                        size="icon"
                                        onClick={handleSubmit}
                                        disabled={!message.trim()}
                                        className="text-primary-foreground h-8 w-8 shrink-0 rounded-full bg-[#9EC6F3] hover:bg-[#CBE1F9] disabled:opacity-50"
                                    >
                                        <ArrowUp color="black" size={18} />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Slide Generation Panel */}
                        {showSlidePanel && (
                            <div className="h-full w-2/5 border-l bg-background">
                                <div className="flex items-center justify-between border-b p-2">
                                    <h3 className="font-semibold">Tạo Slide</h3>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowSlidePanel(false)}
                                        className="h-8 w-8"
                                    >
                                        <X size={16} />
                                    </Button>
                                </div>
                                <SlideGenerationPanel chatContext={chatContext} />
                            </div>
                        )}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}

export default AIChatbotPage
