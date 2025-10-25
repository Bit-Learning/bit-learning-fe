import ResetPasswordPage from '@/feature/auth/page/ResetPassword'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/reset-password')({
    component: ResetPasswordPage,
})
