import UserProfilePage from '@/pages/UserProfilePage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user-profile')({
    component: UserProfilePage,
})
