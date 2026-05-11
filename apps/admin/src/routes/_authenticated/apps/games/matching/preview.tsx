import { MatchingGamePreviewPage } from "@/features/games/pages/MatchingGamePreviewPage";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

const matchingPreviewSearchSchema = z.object({
	gameId: z.coerce.number().optional().catch(undefined),
	grade: z.coerce.number().optional().catch(undefined),
	topic: z.string().optional().catch(undefined),
});

export const Route = createFileRoute(
	"/_authenticated/apps/games/matching/preview",
)({
	validateSearch: matchingPreviewSearchSchema,
	component: MatchingGamePreviewRoute,
});

function MatchingGamePreviewRoute() {
	const search = Route.useSearch();

	return (
		<MatchingGamePreviewPage
			gameId={search.gameId}
			grade={search.grade}
			topicCode={search.topic}
		/>
	);
}
