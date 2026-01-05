import { createFileRoute } from "@tanstack/react-router";
import PresentationViewer from "@/feature/presentations/components/PresentationViewer";

export const Route = createFileRoute("/_layout/presentations/$id")({
	component: function PresentationViewerRoute() {
		const { id } = Route.useParams();
		// If mode is also a param, extract it similarly; otherwise, set a default or get from elsewhere
		const mode = "view"; // Replace with actual logic if needed
		return <PresentationViewer id={id} mode={mode} />;
	},
});
