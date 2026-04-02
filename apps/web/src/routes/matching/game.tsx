import { TopicCode } from "@/feature/game/data";
import GamePage from "@/feature/game/pages/MatchingGamePage";
import { GameSearch } from "@/feature/game/types";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/matching/game")({
	component: GamePage,
	validateSearch: (search): GameSearch => {
		const rawGrade =
			typeof search.grade === "number"
				? search.grade
				: typeof search.grade === "string"
					? Number.parseInt(search.grade, 10)
					: undefined;

		const safeGrade = Number.isFinite(rawGrade as number)
			? (rawGrade as number)
			: 3;

		const rawTopic =
			typeof search.topic === "string"
				? (search.topic.toUpperCase() as TopicCode)
				: undefined;

		const allowedTopics: TopicCode[] = ["A", "B", "C", "D", "E", "F"];
		const safeTopic: TopicCode =
			rawTopic && allowedTopics.includes(rawTopic) ? rawTopic : "A";

		return { grade: safeGrade, topic: safeTopic };
	},
});
