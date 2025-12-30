import PresentationViewer from '@/feature/presentations/components/PresentationViewer'
import { createFileRoute, useParams } from '@tanstack/react-router'

// This creates the route: /presentation/:id/overview
export const Route = createFileRoute('/_layout/presentations/$id/overview')({
    component: OverviewPage,
})

function OverviewPage() {
    const { id } = useParams({ from: '/_layout/presentations/$id/overview' })
    return <PresentationViewer id={id} mode="overview" />
}
