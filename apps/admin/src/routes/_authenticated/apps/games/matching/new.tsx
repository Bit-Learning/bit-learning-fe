import { MatchingGameEditorPage } from "@/features/games/pages/MatchingGameEditorPage";
import { Header } from "@/layout/header";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/apps/games/matching/new")(
	{
		component: NewMatchingGameRoute,
	},
);

function NewMatchingGameRoute() {
	return (
		<>
			<Header />
			<div className="flex flex-1 flex-col gap-2 p-6 sm:gap-6">
				<MatchingGameEditorPage mode="create" />
			</div>
		</>
	);
}
