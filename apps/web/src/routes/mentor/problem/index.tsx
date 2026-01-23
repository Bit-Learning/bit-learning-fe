import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/mentor/problem/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/mentor/problem/"!</div>
}
