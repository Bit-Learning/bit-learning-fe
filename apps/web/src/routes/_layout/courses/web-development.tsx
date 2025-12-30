import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/courses/web-development')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/courses/web-development"!</div>
}
