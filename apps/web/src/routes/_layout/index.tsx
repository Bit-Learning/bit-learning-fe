import { createFileRoute } from "@tanstack/react-router";
import HomePage from "@/feature/app/page/Home";

export const Route = createFileRoute("/_layout/")({
	component: HomePage,
});
