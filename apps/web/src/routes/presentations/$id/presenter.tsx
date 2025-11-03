import PresentationViewer from '@/feature/presentations/components/PresentationViewer'
import { createFileRoute, useParams } from '@tanstack/react-router'

// This creates the route: /presentation/:id/presenter
export const Route = createFileRoute('/presentations/$id/presenter')({
    component: PresenterPage,
})

function PresenterPage() {
    const { id } = useParams({ from: '/presentations/$id/presenter' })
    return <PresentationViewer id={id} mode="presenter" />
}
