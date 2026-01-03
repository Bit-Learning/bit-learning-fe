import { createFileRoute } from "@tanstack/react-router";
import ActivatePage from "@/feature/auth/page/ActivatePage";

export const Route = createFileRoute("/api/auth/activate")({
	component: ActivatePage,
});
