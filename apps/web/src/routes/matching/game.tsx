import type { TopicCode } from "@/feature/game/data";
import GamePage from "@/feature/game/pages/MatchingGamePage";
import type { GameSearch } from "@/feature/game/types";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/matching/game")({
	component: GamePage,
	validateSearch: (search): GameSearch => {
		const rawGameId =
			typeof search.gameId === "number"
				? search.gameId
				: typeof search.gameId === "string"
					? Number.parseInt(search.gameId, 10)
					: undefined;

		const safeGameId =
			Number.isInteger(rawGameId) && (rawGameId as number) > 0
				? (rawGameId as number)
				: undefined;

		const rawGrade =
			typeof search.grade === "number"
				? search.grade
				: typeof search.grade === "string"
					? Number.parseInt(search.grade, 10)
					: undefined;

		const safeGrade =
			Number.isInteger(rawGrade) &&
			(rawGrade as number) >= 3 &&
			(rawGrade as number) <= 12
				? (rawGrade as number)
				: undefined;

		const rawTopic =
			typeof search.topic === "string"
				? (search.topic.toUpperCase() as TopicCode)
				: undefined;

		const allowedTopics: TopicCode[] = ["A", "B", "C", "D", "E", "F"];
		const safeTopic: TopicCode | undefined =
			rawTopic && allowedTopics.includes(rawTopic) ? rawTopic : undefined;

		return { gameId: safeGameId, grade: safeGrade, topic: safeTopic };
	},
});
