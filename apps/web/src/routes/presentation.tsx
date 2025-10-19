import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/presentation')({
    component: PresentationRoute,
})

function PresentationRoute() {
    return <div>Hello "/presentation"!</div>
}
