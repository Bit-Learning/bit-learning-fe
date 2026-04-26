import KidsBlocklyPage from "@/feature/kids-blockly/pages/KidsBlocklyPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/kids-blockly/")({
	component: KidsBlocklyPage,
});
