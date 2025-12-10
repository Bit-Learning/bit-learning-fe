import GoogleCallbackPage from '@/feature/auth/page/GoogleCallBackPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/google/callback')({
    component: GoogleCallbackPage,
})
