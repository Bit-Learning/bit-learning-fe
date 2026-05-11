import Privacy from "@/feature/app/pages/Privacy";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/privacy")({
	component: Privacy,
});
