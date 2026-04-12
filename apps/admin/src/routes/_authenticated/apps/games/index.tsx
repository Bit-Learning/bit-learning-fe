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

			<Main className="flex flex-1 flex-col gap-6 p-8">
				<div className="mb-6">
					<h1 className="text-2xl font-bold tracking-tight">
						Quản lý trò chơi
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Xem danh sách, tạo/cập nhật và lưu trữ trò chơi trực tiếp trong hệ
						thống.
					</p>
				</div>

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
			</Main>
		</>
	);
}
