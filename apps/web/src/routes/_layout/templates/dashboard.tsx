import TemplateDashboardPage from '@/feature/templates/pages/TemplateDashboardPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/templates/dashboard')({
    component: TemplateDashboardPage,
})
