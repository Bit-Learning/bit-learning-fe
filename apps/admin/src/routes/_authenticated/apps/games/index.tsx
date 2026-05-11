import { GamesCrudManager } from "@/features/games/components/GameListPage";
import { Header } from "@/layout/header";
import { TopNav } from "@/layout/top-nav";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const gamesSearchSchema = z.object({
	status: z.string().optional(),
	rowType: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/apps/games/")({
	validateSearch: gamesSearchSchema,
	component: GamesRoute,
});

function GamesRoute() {
	return (
		<>
			<Header />
			<div className="border-b px-6 py-2">
				<TopNav
					links={[
						{
							title: "Trang chủ",
							href: "/apps/games",
							isActive: true,
						},
						{
							title: "Theo chương trình học",
							href: "/apps/games/curriculum",
							isActive: false,
						},
					]}
				/>
			</div>
			<div className="flex flex-1 flex-col gap-2 p-6 sm:gap-6">
				<GamesCrudManager />
			</div>
		</>
	);
}
