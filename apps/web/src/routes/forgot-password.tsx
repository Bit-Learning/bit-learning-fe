import ForgotPasswordPage from '@/feature/auth/page/ForgotPassword'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/forgot-password')({
    component: ForgotPasswordPage,
})
