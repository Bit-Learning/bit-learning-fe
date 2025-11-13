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
    Sparkles
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
    const [messages, setMessages] = React.useState<Message[]>([])

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
                    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-white px-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <SidebarTrigger className="-ml-1" />
                            <div className="flex items-center gap-2">
                                <div>
                                    <h1 className="text-sm font-bold text-gray-900">AI Chatbot</h1>
                                    <p className="text-xs text-gray-500">Trợ lý ảo thông minh</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePrevConversation}
                                className="h-7 w-7 rounded-md hover:bg-white"
                            >
                                <ChevronLeft size={16} />
                            </Button>

                            <div className="min-w-[180px] text-center">
                                <p className="truncate text-xs font-semibold text-gray-900">
                                    {mockConversations[currentConversationIndex]?.title ?? 'Cuộc trò chuyện mới'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {mockConversations[currentConversationIndex]?.date ??
                                        new Date().toLocaleDateString('vi-VN')}
                                </p>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNextConversation}
                                className="h-7 w-7 rounded-md hover:bg-white"
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>

                        <Button
                            variant={showSlidePanel ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setShowSlidePanel(!showSlidePanel)}
                            className="gap-2"
                        >
                            <Presentation size={16} />
                            {showSlidePanel ? 'Ẩn panel' : 'Tạo slide'}
                        </Button>
                    </header>

                    {/* Main Content */}
                    <main className="flex flex-1 overflow-hidden">
                        {/* Chat Panel */}
                        <div className={`flex h-full flex-col bg-gradient-to-b from-gray-50 to-white transition-all duration-300 ${showSlidePanel ? 'w-3/5' : 'w-full'}`}>
                            {/* Messages Area - Scrollable */}
                            <div className="flex-1 overflow-y-auto">
                                {messages.length === 0 ? (
                                    /* Empty State - Welcome Screen */
                                    <div className="flex h-full items-center justify-center px-4">
                                        <div className="max-w-2xl text-center">
                                            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                                                <Sparkles className="h-10 w-10 text-white" />
                                            </div>
                                            <h2 className="mb-3 text-3xl font-bold text-gray-900">
                                                Xin chào! Tôi là AI Chatbot
                                            </h2>
                                            <p className="mb-8 text-lg text-gray-600">
                                                Tôi có thể giúp bạn với nhiều tác vụ khác nhau
                                            </p>

                                            <div className="grid gap-4 sm:grid-cols-3">
                                                <div className="rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:shadow-md">
                                                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                                        <FileText className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <h3 className="mb-1 font-semibold text-gray-900">Trả lời câu hỏi</h3>
                                                    <p className="text-sm text-gray-600">
                                                        Hỏi tôi bất cứ điều gì về lập trình, học tập
                                                    </p>
                                                </div>

                                                <div className="rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:shadow-md">
                                                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                                        <Presentation className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <h3 className="mb-1 font-semibold text-gray-900">Tạo slide AI</h3>
                                                    <p className="text-sm text-gray-600">
                                                        Tạo bài thuyết trình từ nội dung chat
                                                    </p>
                                                </div>

                                                <div className="rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:shadow-md">
                                                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                                                        <BookImage className="h-5 w-5 text-purple-600" />
                                                    </div>
                                                    <h3 className="mb-1 font-semibold text-gray-900">Giải thích code</h3>
                                                    <p className="text-sm text-gray-600">
                                                        Phân tích và giải thích thuật toán
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="mt-8 text-sm text-gray-500">
                                                Bắt đầu bằng cách nhập câu hỏi của bạn bên dưới
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    /* Messages List */
                                    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 pb-4">
                                        {messages.map(msg => (
                                            <div
                                                key={msg.id}
                                                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`rounded-2xl px-4 py-3 shadow-sm transition-all hover:shadow-md ${
                                                        msg.role === 'user'
                                                            ? 'max-w-[80%] bg-[#9EC6F3] text-gray-900'
                                                            : 'max-w-[85%] border border-gray-200 bg-white'
                                                    }`}
                                                >
                                                    {msg.role === 'assistant' ? (
                                                        <MessageContent content={msg.content} />
                                                    ) : (
                                                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                                                    )}
                                                    <span className="mt-2 block text-xs opacity-60">{msg.timestamp}</span>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Input Area - Sticky Bottom */}
                            <div className="border-t bg-white px-4 py-4 shadow-lg">
                                <div className="mx-auto max-w-3xl">
                                    <div className="flex items-end gap-3 rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 transition-all focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                                        <Input
                                            type="text"
                                            placeholder="Nhập tin nhắn của bạn..."
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            className="flex-1 border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                                        />

                                        <Button
                                            type="button"
                                            size="icon"
                                            onClick={handleSubmit}
                                            // disabled={!message.trim()}
                                            className="h-9 w-9 shrink-0 rounded-full bg-[#9EC6F3] text-gray-900 transition-all hover:bg-[#7DB4EC] disabled:opacity-40"
                                        >
                                            <ArrowUp size={20} strokeWidth={2.5} />
                                        </Button>
                                    </div>
                                    <p className="mt-2 text-center text-xs text-gray-500">
                                        Nhấn Enter để gửi, Shift + Enter để xuống dòng
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Slide Generation Panel */}
                        {showSlidePanel && (
                            <div className="flex h-full w-2/5 flex-col border-l bg-gray-50 shadow-xl transition-all duration-300">
                                <div className="flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <Presentation className="h-5 w-5 text-blue-600" />
                                        <h3 className="font-semibold text-gray-900">Tạo Slide AI</h3>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowSlidePanel(false)}
                                        className="h-8 w-8 rounded-full hover:bg-gray-100"
                                    >
                                        <X size={18} />
                                    </Button>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <SlideGenerationPanel chatContext={chatContext} />
                                </div>
                            </div>
                        )}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}

export default AIChatbotPage
