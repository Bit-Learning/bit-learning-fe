import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/mentorship')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/mentorship"!</div>
}
