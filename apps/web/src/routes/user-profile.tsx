import UserProfilePage from '@/feature/user/page/UserProfilePage'
import { useLayout } from '@/shared/context/layout-context'
import { requireAuth } from '@/shared/lib/auth-utils'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

function UserProfileWrapper() {
    const { setLayoutConfig } = useLayout()

    useEffect(() => {
        // Set layout config for this page: show header but hide footer
        setLayoutConfig({ showHeader: true, showFooter: false })

        // Reset to default when leaving the page
        return () => {
            setLayoutConfig({ showHeader: true, showFooter: true })
        }
    }, [setLayoutConfig])

    return <UserProfilePage />
}

export const Route = createFileRoute('/user-profile')({
    beforeLoad: async ({ location }) => {
        requireAuth(location)
    },
    component: UserProfileWrapper,
})
