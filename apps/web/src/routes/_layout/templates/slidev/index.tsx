import { SlidevPresentationsPage } from '@/feature/templates/pages/SlidevPresentationsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/templates/slidev/')({
    component: SlidevPresentationsPage,
})
