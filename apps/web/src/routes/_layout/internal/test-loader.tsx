import { createFileRoute } from '@tanstack/react-router'
import Loader from '@workspace/ui/components/loader/TerminalLoader'

export const Route = createFileRoute('/_layout/internal/test-loader')({
    component: RouteComponent,
})

function RouteComponent() {
    return <Loader />
}
