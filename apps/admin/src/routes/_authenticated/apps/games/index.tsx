import { createFileRoute } from "@tanstack/react-router";
import { GamesCrudManager } from "@/features/games/components/GamesCrudManager";

export const Route = createFileRoute("/_authenticated/apps/games/")({
	component: GamesRoute,
});

function GamesRoute() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Quản lý game</h1>
				<p className="text-sm text-muted-foreground">
					Xem danh sách, tạo/cập nhật và lưu trữ game trực tiếp trong hệ thống.
				</p>
			</div>
			<GamesCrudManager />
		</div>
	);
}
