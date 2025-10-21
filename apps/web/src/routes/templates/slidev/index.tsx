import { SlidevPresentationsPage } from '@/feature/templates/pages/SlidevPresentationsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/templates/slidev/')({
    component: SlidevPresentationsPage,
})
