import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/courses/mobile-development')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/courses/mobile-development"!</div>
}
