import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/courses/web-development')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/courses/web-development"!</div>
}
