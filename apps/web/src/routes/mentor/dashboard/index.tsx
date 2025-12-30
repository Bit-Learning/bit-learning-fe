import DashboardPage from '@/feature/mentor-dashboard/page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/mentor/dashboard/')({
    component: DashboardPage,
})
