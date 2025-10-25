import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/courses/data-science')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/courses/data-science"!</div>
}
