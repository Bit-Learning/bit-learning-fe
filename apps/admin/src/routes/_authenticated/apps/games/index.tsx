import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GamesCrudManager } from "@/features/games/components/GameListPage";
import { MatchingGameManager } from "@/features/games/components/MatchingGameListPage";
import { Header } from "@/layout/header";
import { Main } from "@/layout/main";
import { createFileRoute } from "@tanstack/react-router";
import { Gamepad2, LayoutGrid } from "lucide-react";

export const Route = createFileRoute("/_authenticated/apps/games/")({
	component: GamesRoute,
});

function GamesRoute() {
	return (
		<>
			<Header />

			<div className="flex flex-1 flex-col gap-2 sm:gap-6 p-6">
				<h1 className="text-2xl font-bold tracking-tight">Quản lý trò chơi</h1>

				<Tabs defaultValue="general">
					<TabsList>
						<TabsTrigger value="general" className="gap-2">
							<Gamepad2 size={15} /> Game thông thường
						</TabsTrigger>
						<TabsTrigger value="matching" className="gap-2">
							<LayoutGrid size={15} /> Game nối khái niệm
						</TabsTrigger>
					</TabsList>

					<TabsContent value="general" className="mt-4">
						<GamesCrudManager />
					</TabsContent>

					<TabsContent value="matching" className="mt-4">
						<MatchingGameManager />
					</TabsContent>
				</Tabs>
			</div>
		</>
	);
}
