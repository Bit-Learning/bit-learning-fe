import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/contests/$id/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/contests/$id/edit"!</div>;
}
