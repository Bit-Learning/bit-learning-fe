import { createFileRoute } from "@tanstack/react-router";
import CurriculumBrowsePage from "@/feature/game/pages/CurriculumBrowsePage/CurriculumBrowsePage";

export const Route = createFileRoute("/games/curriculum")({
	component: CurriculumBrowsePage,
});
