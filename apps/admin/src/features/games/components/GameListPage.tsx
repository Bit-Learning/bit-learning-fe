import { Link } from "@tanstack/react-router";
import {
	ArrowRight,
	Gamepad2,
	LayoutGrid,
	Loader2,
	Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	useDeleteGame,
	useAdminGamesList,
	useGameCategories,
} from "../queries/useAdminGamesCrud";
import { useAdminGameAnalyticsDashboard } from "../queries/useAdminGameAnalytics";
import {
	useDeleteMatchingGame,
	useMatchingGameMappings,
} from "../queries/useAdminMatchingGame";
import { GamesTable } from "./games-table";
import type { GameRow } from "./games-columns";

const getErrorMessage = (error: unknown, fallback: string) => {
	if (error instanceof Error && error.message) {
		return error.message;
	}
	if (
		typeof error === "object" &&
		error !== null &&
		"response" in error &&
		typeof error.response === "object" &&
		error.response !== null &&
		"data" in error.response &&
		typeof error.response.data === "object" &&
		error.response.data !== null &&
		"message" in error.response.data &&
		typeof error.response.data.message === "string"
	) {
		return error.response.data.message;
	}
	return fallback;
};

export const GamesCrudManager = () => {
	const { data: games = [], isLoading: isLoadingGames } = useAdminGamesList();
	const { data: categories = [] } = useGameCategories();
	const { data: analytics } = useAdminGameAnalyticsDashboard(30);
	const { data: mappings = [], isLoading: isLoadingMatching } =
		useMatchingGameMappings();
	const deleteGame = useDeleteGame();
	const deleteMatchingGame = useDeleteMatchingGame();

	const getCategoryName = (categoryId?: number | null) => {
		if (!categoryId) return "Chưa phân loại";
		return (
			categories.find((c) => c.id === categoryId)?.name ?? "Chưa phân loại"
		);
	};

	const standardRows: GameRow[] = games
		.filter((game) => game.gameType !== "MATCHING")
		.map((game) => {
			const performance = analytics?.gamePerformance.find(
				(item) => item.gameId === game.id,
			);
			return {
				id: `standard-${game.id}`,
				rowType: "standard",
				displayId: `#${game.id}`,
				title: game.title,
				status: game.status,
				categoryOrTopic: getCategoryName(game.categoryId),
				difficultyOrGrade: game.difficulty ?? "MEDIUM",
				description: game.description,
				scoringModel: performance?.scoringModel ?? game.scoringModel ?? null,
				isScored: performance?.isScored ?? game.isScored ?? null,
				likes: game.likes,
				views: game.views,
				attempts: performance?.attempts ?? 0,
				completionRate: performance?.completionRate ?? 0,
				averageAccuracy: performance?.averageAccuracy ?? 0,
				averageRawScore: performance?.averageRawScore ?? 0,
				timeoutRate: performance?.timeoutRate ?? 0,
				standardId: game.id,
			};
		});

	const matchingRows: GameRow[] = mappings.map((mapping) => {
		const performance = analytics?.gamePerformance.find(
			(item) => item.gameId === mapping.gameId,
		);
		return {
			id: `matching-${mapping.gameId}`,
			rowType: "matching",
			displayId: `#${mapping.gameId}`,
			title: mapping.gameTitle,
			status: mapping.status,
			categoryOrTopic: `Chủ đề ${mapping.topicCode}`,
			difficultyOrGrade: `Lớp ${mapping.grade}`,
			description: `Game nối khái niệm theo chương trình học · Lớp ${mapping.grade} · Chủ đề ${mapping.topicCode}`,
			scoringModel: performance?.scoringModel ?? "FINITE_SCORE",
			isScored: performance?.isScored ?? true,
			attempts: performance?.attempts ?? 0,
			completionRate: performance?.completionRate ?? 0,
			averageAccuracy: performance?.averageAccuracy ?? 0,
			averageRawScore: performance?.averageRawScore ?? 0,
			timeoutRate: performance?.timeoutRate ?? 0,
			matchingGameId: mapping.gameId,
			matchingGrade: mapping.grade,
			matchingTopicCode: mapping.topicCode,
		};
	});

	const data = [...standardRows, ...matchingRows];

	const handleDeleteStandard = async (id: number) => {
		if (!confirm(`Lưu trữ game #${id}?`)) return;
		try {
			await deleteGame.mutateAsync(id);
			toast.success("Đã lưu trữ game");
		} catch (error: unknown) {
			toast.error(getErrorMessage(error, "Không thể lưu trữ game"));
		}
	};

	const handleDeleteMatching = async (gameId: number) => {
		const mapping = mappings.find((item) => item.gameId === gameId);
		const label = mapping
			? `#${gameId} · Lớp ${mapping.grade} - Chủ đề ${mapping.topicCode}`
			: `#${gameId}`;
		if (!confirm(`Xoá matching game ${label}?`)) {
			return;
		}
		try {
			await deleteMatchingGame.mutateAsync({ gameId });
			toast.success("Đã xoá matching game");
		} catch (error: unknown) {
			toast.error(getErrorMessage(error, "Không thể xoá matching game"));
		}
	};

	const isLoading = isLoadingGames || isLoadingMatching;

	return (
		<div className="space-y-6">
			<div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
				<Card className="overflow-hidden border-slate-200/80 bg-linear-to-br from-slate-100 via-white to-slate-50 text-slate-800">
					<CardHeader className="border-b border-slate-200/80 pb-5">
						<div className="flex items-center gap-2 text-sm font-medium text-sky-700">
							<Sparkles className="h-4 w-4" />
							Workspace quản lý trò chơi
						</div>
						<CardTitle className="text-2xl text-slate-900">
							Một bảng chung cho toàn bộ game trong hệ thống
						</CardTitle>
						<CardDescription className="max-w-2xl text-slate-600">
							Theo dõi game thường và game nối khái niệm trong cùng một luồng
							quản trị, lọc nhanh theo loại, trạng thái và điều hướng thẳng tới
							trang chỉnh sửa chi tiết.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-6 pt-6 lg:grid-cols-[1.15fr_0.85fr]">
						<div className="space-y-4">
							<div className="grid gap-3 sm:grid-cols-3">
								<div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
									<div className="text-sm text-slate-500">Tổng số game</div>
									<div className="mt-2 text-3xl font-semibold text-slate-900">
										{data.length}
									</div>
								</div>
								<div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
									<div className="text-sm text-slate-500">Game thường</div>
									<div className="mt-2 text-3xl font-semibold text-slate-900">
										{standardRows.length}
									</div>
								</div>
								<div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
									<div className="text-sm text-slate-500">
										Game nối khái niệm
									</div>
									<div className="mt-2 text-3xl font-semibold text-slate-900">
										{matchingRows.length}
									</div>
								</div>
							</div>

							<div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
								<div className="flex items-center justify-between gap-4">
									<div>
										<div className="text-sm text-slate-500">
											Lượt chơi 30 ngày
										</div>
										<div className="mt-1 text-2xl font-semibold text-slate-900">
											{analytics?.overview.totalAttempts ?? 0}
										</div>
									</div>
									<div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
										{analytics?.overview.scoredAttemptRate ?? 0}% có điểm
									</div>
								</div>
								<div className="mt-3 h-2 rounded-full bg-slate-200">
									<div
										className="h-2 rounded-full bg-sky-500"
										style={{
											width: `${analytics?.overview.completionRate ?? 0}%`,
										}}
									/>
								</div>
								<div className="mt-2 text-xs text-slate-500">
									Hoàn thành {analytics?.overview.completionRate ?? 0}%
								</div>
							</div>
						</div>

						<div className="grid gap-3">
							<div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
								<div className="text-sm font-medium text-slate-500">
									Theo dõi nhanh
								</div>
								<div className="mt-3 grid gap-2 text-sm text-slate-600">
									<div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
										<span>Loại game</span>
										<span className="font-medium text-slate-900">2 nhóm</span>
									</div>
									<div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
										<span>Trạng thái</span>
										<span className="font-medium text-slate-900">
											Lọc theo bảng
										</span>
									</div>
									<div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
										<span>Hiệu suất</span>
										<span className="font-medium text-slate-900">
											30 ngày gần nhất
										</span>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<div className="grid gap-4">
					<Card className="border-slate-200/80">
						<CardHeader>
							<div className="flex items-center gap-2 text-sm font-medium text-slate-500">
								<Gamepad2 className="h-4 w-4 text-sky-600" />
								Tạo game thường
							</div>
							<CardTitle>Tải lên game HTML hoặc ZIP</CardTitle>
							<CardDescription>
								Tạo một game mới với file chơi, thumbnail và metadata cơ bản.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button asChild className="w-full justify-between">
								<Link to="/apps/games/new">
									Mở trang tạo game
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
						</CardContent>
					</Card>

					<Card className="border-slate-200/80">
						<CardHeader>
							<div className="flex items-center gap-2 text-sm font-medium text-slate-500">
								<LayoutGrid className="h-4 w-4 text-emerald-600" />
								Tạo game nối khái niệm
							</div>
							<CardTitle>Biên tập stage và cặp ghép</CardTitle>
							<CardDescription>
								Tạo game nối theo lớp và chủ đề, với giao diện full-page thay vì
								modal dài khó thao tác.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button
								asChild
								variant="outline"
								className="w-full justify-between"
							>
								<Link to="/apps/games/matching/new">
									Mở trang tạo matching game
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
						</CardContent>
					</Card>

					<Card className="border-slate-200/80">
						<CardHeader>
							<div className="flex items-center gap-2 text-sm font-medium text-slate-500">
								<Sparkles className="h-4 w-4 text-amber-600" />
								Phân tích game
							</div>
							<CardTitle>Bảng điều khiển hiệu suất và bỏ dở</CardTitle>
							<CardDescription>
								Xem số lượt chơi theo ngày, tỷ lệ hoàn thành, độ chính xác theo
								game và các game có tỷ lệ hết giờ cao.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button
								asChild
								variant="secondary"
								className="w-full justify-between"
							>
								<Link to="/apps/games/analytics">
									Mở bảng điều khiển phân tích
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>

			<Card>
				<CardHeader className="border-b">
					<CardTitle>Danh sách trò chơi</CardTitle>
					<CardDescription>
						Quản lý toàn bộ game trong một bảng duy nhất. Từ đây bạn có thể lọc,
						mở trang chi tiết hoặc xoá/lưu trữ theo từng loại game.
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-6">
					{isLoading ? (
						<div className="flex items-center gap-2 text-muted-foreground">
							<Loader2 className="h-4 w-4 animate-spin" />
							Đang tải danh sách trò chơi...
						</div>
					) : (
						<GamesTable
							data={data}
							onDeleteStandard={handleDeleteStandard}
							onDeleteMatching={handleDeleteMatching}
							isDeletingStandard={deleteGame.isPending}
							isDeletingMatching={deleteMatchingGame.isPending}
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
