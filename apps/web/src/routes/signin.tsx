import SignInPage from '@/feature/auth/page/Login'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/signin')({
    component: SignInPage,
})
