import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/courses/backend-development')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/courses/backend-development"!</div>
}
