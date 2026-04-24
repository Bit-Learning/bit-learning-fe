import { MatchingGameEditorPage } from "@/features/games/pages/MatchingGameEditorPage";
import { Header } from "@/layout/header";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

const matchingSearchSchema = z.object({
	gameId: z.coerce.number().optional().catch(undefined),
	grade: z.coerce.number().optional().catch(undefined),
	topic: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_authenticated/apps/games/matching/")({
	validateSearch: matchingSearchSchema,
	component: MatchingGameRoute,
});

function MatchingGameRoute() {
	const search = Route.useSearch();

	return (
		<>
			<Header />
			<div className="flex flex-1 flex-col gap-2 p-6 sm:gap-6">
				<MatchingGameEditorPage
					mode="edit"
					gameId={search.gameId}
					grade={search.grade}
					topicCode={search.topic}
				/>
			</div>
		</>
	);
}
