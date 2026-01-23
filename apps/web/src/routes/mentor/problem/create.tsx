import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/mentor/problem/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/mentor/problem/create"!</div>
}
