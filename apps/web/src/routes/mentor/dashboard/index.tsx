import DashboardPage from '@/feature/mentor-dashboard/page'
import { useLayout } from '@/shared/context/layout-context'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

const DashboardPageWrapper = () => {
    const { setLayoutConfig } = useLayout()

    useEffect(() => {
        setLayoutConfig({ showHeader: false, showFooter: false })

        return () => {
            setLayoutConfig({ showHeader: true, showFooter: true })
        }
    }, [setLayoutConfig])

    return <DashboardPage />
}

export const Route = createFileRoute('/mentor/dashboard/')({
    component: DashboardPageWrapper,
})
