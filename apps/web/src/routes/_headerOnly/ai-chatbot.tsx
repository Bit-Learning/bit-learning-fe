import AIChatbotPage from '@/feature/aichat/pages/AIChatbotPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_headerOnly/ai-chatbot')({
    component: AIChatbotPage,
})
