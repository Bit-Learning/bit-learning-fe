import HomePage from "@/feature/game/pages/HomePage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/matching/")({
	component: () => <HomePage />,
});
