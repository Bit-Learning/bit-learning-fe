import { createFileRoute } from "@tanstack/react-router";
import CurriculumBrowsePage from "@/feature/game/pages/CurriculumBrowsePage/CurriculumBrowsePage";

type CurriculumSearch = {
	level?: "primary" | "secondary" | "high";
	curriculum?: number;
	grade?: number;
};

export const Route = createFileRoute("/games/curriculum")({
	component: CurriculumBrowsePage,
	validateSearch: (search: Record<string, unknown>): CurriculumSearch => {
		const level = search.level as string | undefined;
		return {
			level:
				level === "primary" || level === "secondary" || level === "high"
					? level
					: undefined,
			curriculum:
				typeof search.curriculum === "number"
					? search.curriculum
					: typeof search.curriculum === "string"
						? Number(search.curriculum) || undefined
						: undefined,
			grade:
				typeof search.grade === "number"
					? search.grade
					: typeof search.grade === "string"
						? Number(search.grade) || undefined
						: undefined,
		};
	},
});
