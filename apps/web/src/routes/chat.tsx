import ChatPromptPage from '@/feature/aichat/pages/ChatPromptPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/chat')({
    component: ChatPromptPage,
})
