import UserProfilePage from '@/feature/userprofile/page/UserProfilePage'
import { requireAuth } from '@/shared/lib/auth-utils'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user-profile')({
    beforeLoad: async ({ location }) => {
        requireAuth(location)
    },
    component: UserProfilePage,
})
