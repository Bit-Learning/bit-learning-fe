import ChatPromptPage from '@/pages/ChatPromptPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/chat')({
    component: ChatPromptPage,
})
