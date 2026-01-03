import { createFileRoute, useParams } from "@tanstack/react-router";
import PresentationViewer from "@/feature/presentations/components/PresentationViewer";

// This creates the route: /presentation/:id/presenter
export const Route = createFileRoute("/_layout/presentations/$id/presenter")({
	component: PresenterPage,
});

function PresenterPage() {
	const { id } = useParams({ from: "/_layout/presentations/$id/presenter" });
	return <PresentationViewer id={id} mode="presenter" />;
}
