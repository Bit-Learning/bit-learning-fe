import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/matrices/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/matrices/$id"!</div>
}
