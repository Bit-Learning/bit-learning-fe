import SignInPage from '@/feature/auth/page/Login'
import { redirectIfAuthenticated } from '@/shared/lib/auth-utils'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/signin')({
    beforeLoad: async () => {
        redirectIfAuthenticated()
    },
    component: SignInPage,
})
