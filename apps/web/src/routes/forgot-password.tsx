import ForgotPasswordPage from '@/feature/auth/page/ForgotPassword'
import { useLayout } from '@/shared/context/layout-context'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

const ForgotPasswordPageWrapper = () => {
    const { setLayoutConfig } = useLayout()

    useEffect(() => {
        // Set layout config for this page: hide header hide footer
        setLayoutConfig({ showHeader: false, showFooter: false })

        // Reset to default when leaving the page
        return () => {
            setLayoutConfig({ showHeader: true, showFooter: true })
        }
    }, [setLayoutConfig])

    return <ForgotPasswordPage />
}

export const Route = createFileRoute('/forgot-password')({
    component: ForgotPasswordPageWrapper,
})
