import PresentationViewer from '@/feature/presentations/components/PresentationViewer'
import { createFileRoute, useParams } from '@tanstack/react-router'

// This creates the route: /presentation/:id/view
export const Route = createFileRoute('/presentations/$id/view')({
    component: ViewPage,
})

function ViewPage() {
    // Get the 'id' parameter from the URL
    const { id } = useParams({ from: '/presentations/$id/view' })

    // Render the shared component with the correct mode
    return <PresentationViewer id={id} mode="view" />
}
