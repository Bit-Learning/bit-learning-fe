import DashboardPage from "@/feature/game/pages/DashboardPage/DashboardPage";
import type { TopicCode } from "@/feature/game/data";
import { createFileRoute } from "@tanstack/react-router";

type DashboardSearch = {
	correct?: number;
	total?: number;
	time?: number;
	title?: string;
	gameId?: number;
	grade?: number;
	topic?: TopicCode;
};

export const Route = createFileRoute("/matching/dashboard")({
	component: DashboardPage,
	validateSearch: (search: Record<string, unknown>): DashboardSearch => {
		const rawGameId =
			typeof search.gameId === "number"
				? search.gameId
				: typeof search.gameId === "string"
					? Number(search.gameId)
					: undefined;
		const rawGrade =
			typeof search.grade === "number"
				? search.grade
				: typeof search.grade === "string"
					? Number(search.grade)
					: undefined;
		const rawTopic =
			typeof search.topic === "string"
				? (search.topic.toUpperCase() as TopicCode)
				: undefined;
		const allowedTopics: TopicCode[] = ["A", "B", "C", "D", "E", "F"];

		return {
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
			gameId:
				Number.isInteger(rawGameId) && (rawGameId as number) > 0
					? (rawGameId as number)
					: undefined,
			grade:
				Number.isInteger(rawGrade) &&
				(rawGrade as number) >= 3 &&
				(rawGrade as number) <= 12
					? (rawGrade as number)
					: undefined,
			topic:
				rawTopic && allowedTopics.includes(rawTopic) ? rawTopic : undefined,
		};
	},
});
