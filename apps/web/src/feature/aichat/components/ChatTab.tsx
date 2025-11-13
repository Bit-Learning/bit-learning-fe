import { useSendMessage, useConversationMessages } from '../hooks'
import { Button } from '@workspace/ui/components/Button'
import { Input } from '@workspace/ui/components/update/input'
import { ArrowUp, Sparkles, FileText, Presentation, BookImage, Loader2 } from 'lucide-react'
import * as React from 'react'
import { PrismCodeBlock } from '@/shared/components/PrismCodeBlock'

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

interface ChatTabProps {
    conversationId?: string
    onConversationCreated?: (id: string) => void
}

export const ChatTab = ({ conversationId, onConversationCreated }: ChatTabProps) => {
    const [message, setMessage] = React.useState('')
    const [messages, setMessages] = React.useState<Message[]>([])
    const messagesEndRef = React.useRef<HTMLDivElement>(null)

    const { sendMessage, isPending, data: chatResponse } = useSendMessage()
    const { data: conversationData } = useConversationMessages(conversationId || '', undefined)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    React.useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Load messages from conversation
    React.useEffect(() => {
        if (conversationData?.messages) {
            const formattedMessages: Message[] = conversationData.messages.map(msg => ({
                id: msg.id,
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
                timestamp: new Date(msg.created_at).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            }))
            setMessages(formattedMessages)
        }
    }, [conversationData])

    // Update messages when chat response arrives
    React.useEffect(() => {
        if (chatResponse) {
            const userMsg: Message = {
                id: chatResponse.user_message.id,
                role: 'user',
                content: chatResponse.user_message.content,
                timestamp: new Date(chatResponse.user_message.created_at).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            }

            const aiMsg: Message = {
                id: chatResponse.assistant_message.id,
                role: 'assistant',
                content: chatResponse.assistant_message.content,
                timestamp: new Date(chatResponse.assistant_message.created_at).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            }

            setMessages(prev => [...prev, userMsg, aiMsg])

            // Notify parent if new conversation created
            if (!conversationId && onConversationCreated) {
                onConversationCreated(chatResponse.conversation_id)
            }
        }
    }, [chatResponse])

    const handleSubmit = () => {
        if (!message.trim() || isPending) return

        sendMessage({
            conversation_id: conversationId,
            message: message,
            return_sources: true,
            max_history: 10,
        })

        setMessage('')
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <div className="flex h-full flex-col bg-gradient-to-b from-gray-50 to-white">
            {/* Messages Area - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                {messages.length === 0 ? (
                    /* Empty State - Welcome Screen */
                    <div className="flex h-full items-center justify-center px-4">
                        <div className="max-w-2xl text-center">
                            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                                <Sparkles className="h-10 w-10 text-white" />
                            </div>
                            <h2 className="mb-3 text-3xl font-bold text-gray-900">Xin chào! Tôi là AI Chatbot</h2>
                            <p className="mb-8 text-lg text-gray-600">Tôi có thể giúp bạn với nhiều tác vụ khác nhau</p>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:shadow-md">
                                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <h3 className="mb-1 font-semibold text-gray-900">Trả lời câu hỏi</h3>
                                    <p className="text-sm text-gray-600">Hỏi tôi bất cứ điều gì về lập trình, học tập</p>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:shadow-md">
                                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                        <Presentation className="h-5 w-5 text-green-600" />
                                    </div>
                                    <h3 className="mb-1 font-semibold text-gray-900">Tạo slide AI</h3>
                                    <p className="text-sm text-gray-600">Tạo bài thuyết trình từ nội dung chat</p>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:shadow-md">
                                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                                        <BookImage className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <h3 className="mb-1 font-semibold text-gray-900">Giải thích code</h3>
                                    <p className="text-sm text-gray-600">Phân tích và giải thích thuật toán</p>
                                </div>
                            </div>

                            <p className="mt-8 text-sm text-gray-500">Bắt đầu bằng cách nhập câu hỏi của bạn bên dưới</p>
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

                        {/* Typing Indicator */}
                        {isPending && (
                            <div className="flex gap-3 justify-start">
                                <div className="max-w-[85%] rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                                    <div className="flex items-center gap-1">
                                        <div className="flex gap-1">
                                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></span>
                                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></span>
                                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>
                                        </div>
                                        <span className="ml-2 text-xs text-gray-500">AI đang trả lời...</span>
                                    </div>
                                </div>
                            </div>
                        )}

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
                            disabled={isPending}
                            className="flex-1 border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        />

                        <Button
                            type="button"
                            size="icon"
                            onClick={handleSubmit}
                            isDisabled={!message.trim() || isPending}
                            className="h-9 w-9 shrink-0 rounded-full bg-[#9EC6F3] text-gray-900 transition-all hover:bg-[#7DB4EC] disabled:opacity-40"
                        >
                            {isPending ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <ArrowUp size={20} strokeWidth={2.5} />
                            )}
                        </Button>
                    </div>
                    <p className="mt-2 text-center text-xs text-gray-500">
                        Nhấn Enter để gửi, Shift + Enter để xuống dòng
                    </p>
                </div>
            </div>
        </div>
    )
}
