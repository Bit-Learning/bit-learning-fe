import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/web-design')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/web-design"!</div>
}
