import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/corporate-training')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/corporate-training"!</div>
}
