import { createFileRoute } from "@tanstack/react-router";
import { GamesExcelManager } from "@/features/games/components/GamesExcelManager";

export const Route = createFileRoute("/_authenticated/apps/games/")({
	component: GamesExcelRoute,
});

function GamesExcelRoute() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">
					Quản lý game (Excel)
				</h1>
				<p className="text-sm text-muted-foreground">
					Admin có thể tải template, export toàn bộ game và import/preview game
					từ file Excel với kiểm tra lỗi.
				</p>
			</div>
			<GamesExcelManager />
		</div>
	);
}
