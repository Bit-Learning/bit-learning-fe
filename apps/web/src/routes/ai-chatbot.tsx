import { createFileRoute } from '@tanstack/react-router'
import AIChatbotPage from '../feature/aichat/pages/AIChatbotPage'

export const Route = createFileRoute('/ai-chatbot')({
    component: AIChatbotPage,
})
