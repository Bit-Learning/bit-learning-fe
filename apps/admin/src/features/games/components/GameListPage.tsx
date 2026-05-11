import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
	ArrowRight,
	Gamepad2,
	LayoutGrid,
	Loader2,
	Sparkles,
} from "lucide-react";
import { useState } from "react";
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
	useBulkUpdateGameStatus,
} from "../queries/useAdminGamesCrud";
import { useAdminGameAnalyticsDashboard } from "../queries/useAdminGameAnalytics";
import {
	useDeleteMatchingGame,
	useMatchingGameMappings,
} from "../queries/useAdminMatchingGame";
import { GamesTable } from "./games-table";
import type { GameRow } from "./games-columns";
import type { ColumnFiltersState } from "@tanstack/react-table";

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
	const bulkUpdateStatus = useBulkUpdateGameStatus();
	const navigate = useNavigate({ from: "/apps/games/" });
	const search = useSearch({ from: "/_authenticated/apps/games/" });
	const [selectedRows, setSelectedRows] = useState<GameRow[]>([]);

	const initialColumnFilters: ColumnFiltersState = [
		...(search.status ? [{ id: "status", value: [search.status] }] : []),
		...(search.rowType ? [{ id: "rowType", value: [search.rowType] }] : []),
	];

	const handleColumnFiltersChange = (filters: ColumnFiltersState) => {
		const statusFilter = filters.find((f) => f.id === "status");
		const rowTypeFilter = filters.find((f) => f.id === "rowType");
		const statusValues = statusFilter?.value as string[] | undefined;
		const rowTypeValues = rowTypeFilter?.value as string[] | undefined;
		navigate({
			search: {
				status: statusValues?.[0],
				rowType: rowTypeValues?.[0],
			},
			replace: true,
			resetScroll: false,
		});
	};

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

	const handleBulkPublish = async () => {
		const ids = selectedRows
			.map((r) => r.standardId ?? r.matchingGameId)
			.filter((id): id is number => id !== undefined);
		if (ids.length === 0) return;
		try {
			await bulkUpdateStatus.mutateAsync({ ids, status: "PUBLISHED" });
			toast.success(`Đã xuất bản ${ids.length} game`);
			setSelectedRows([]);
		} catch (error: unknown) {
			toast.error(getErrorMessage(error, "Không thể xuất bản game"));
		}
	};

	const handleBulkDraft = async () => {
		const ids = selectedRows
			.map((r) => r.standardId ?? r.matchingGameId)
			.filter((id): id is number => id !== undefined);
		if (ids.length === 0) return;
		try {
			await bulkUpdateStatus.mutateAsync({ ids, status: "DRAFT" });
			toast.success(`Đã chuyển ${ids.length} game về nháp`);
			setSelectedRows([]);
		} catch (error: unknown) {
			toast.error(getErrorMessage(error, "Không thể chuyển game về nháp"));
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
							Quản lý trò chơi
						</CardTitle>
						<CardDescription className="max-w-2xl text-slate-600">
							Theo dõi game thường và game nối khái niệm trong cùng một luồng
							quản trị, lọc nhanh theo loại, trạng thái và điều hướng thẳng tới
							trang chỉnh sửa chi tiết.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-6 pt-6">
						<div className="space-y-4">
							<div className="grid gap-3 sm:grid-cols-3">
								<div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
									<div className="text-sm text-slate-500">Tổng số trò chơi</div>
									<div className="mt-2 text-3xl font-semibold text-slate-900">
										{data.length}
									</div>
								</div>
								<div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
									<div className="text-sm text-slate-500">Trò chơi thường</div>
									<div className="mt-2 text-3xl font-semibold text-slate-900">
										{standardRows.length}
									</div>
								</div>
								<div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
									<div className="text-sm text-slate-500">
										Trò chơi nối khái niệm
									</div>
									<div className="mt-2 text-3xl font-semibold text-slate-900">
										{matchingRows.length}
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
									Chuyển đến trang tạo trò chơi
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
						</CardContent>
					</Card>

					<Card className="border-slate-200/80">
						<CardHeader>
							<div className="flex items-center gap-2 text-sm font-medium text-slate-500">
								<LayoutGrid className="h-4 w-4 text-emerald-600" />
								Tạo trò chơi nối khái niệm
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
									Chuyển đến trang tạo trò chơi nối khái niệm
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
					{selectedRows.length > 0 && (
						<div className="mb-4 flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3">
							<span className="text-sm font-medium text-sky-800">
								Đã chọn {selectedRows.length} game
							</span>
							<div className="ml-auto flex gap-2">
								<Button
									size="sm"
									variant="default"
									disabled={bulkUpdateStatus.isPending}
									onClick={handleBulkPublish}
								>
									{bulkUpdateStatus.isPending ? (
										<Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
									) : null}
									Xuất bản
								</Button>
								<Button
									size="sm"
									variant="outline"
									disabled={bulkUpdateStatus.isPending}
									onClick={handleBulkDraft}
								>
									Chuyển về nháp
								</Button>
							</div>
						</div>
					)}
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
							initialColumnFilters={initialColumnFilters}
							onColumnFiltersChange={handleColumnFiltersChange}
							onSelectionChange={setSelectedRows}
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
