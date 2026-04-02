import DashboardPage from "@/feature/game/pages/DashboardPage/DashboardPage";
import { createFileRoute } from "@tanstack/react-router";

type DashboardSearch = {
	correct?: number;
	total?: number;
	time?: number;
	title?: string;
};

export const Route = createFileRoute("/matching/dashboard")({
	component: DashboardPage,
	validateSearch: (search: Record<string, unknown>): DashboardSearch => ({
		correct:
			typeof search.correct === "number"
				? search.correct
				: typeof search.correct === "string"
					? Number(search.correct)
					: 0,
		total:
			typeof search.total === "number"
				? search.total
				: typeof search.total === "string"
					? Number(search.total)
					: 0,
		time:
			typeof search.time === "number"
				? search.time
				: typeof search.time === "string"
					? Number(search.time)
					: 0,
		title: typeof search.title === "string" ? search.title : undefined,
	}),
});
