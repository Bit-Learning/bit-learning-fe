import SignUpPage from '@/feature/auth/page/Register'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/signup')({
    component: SignUpPage,
})
