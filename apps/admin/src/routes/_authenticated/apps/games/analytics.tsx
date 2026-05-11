import { createFileRoute } from "@tanstack/react-router";
import { GameAnalyticsDashboardPage } from "@/features/games/pages/GameAnalyticsDashboardPage";
import { Header } from "@/layout/header";

export const Route = createFileRoute("/_authenticated/apps/games/analytics")({
	component: AnalyticsRoute,
});

function AnalyticsRoute() {
	return (
		<>
			<Header />
			<div className="flex flex-1 flex-col gap-6 p-6">
				<GameAnalyticsDashboardPage />
			</div>
		</>
	);
}
