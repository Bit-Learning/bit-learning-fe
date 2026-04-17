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
		.map((game) => ({
			id: `standard-${game.id}`,
			rowType: "standard",
			displayId: `#${game.id}`,
			title: game.title,
			status: game.status,
			categoryOrTopic: getCategoryName(game.categoryId),
			difficultyOrGrade: game.difficulty ?? "MEDIUM",
			description: game.description,
			likes: game.likes,
			views: game.views,
			standardId: game.id,
		}));

	const matchingRows: GameRow[] = mappings.map((mapping) => ({
		id: `matching-${mapping.gameId}`,
		rowType: "matching",
		displayId: `#${mapping.gameId}`,
		title: mapping.gameTitle,
		status: mapping.status,
		categoryOrTopic: `Chủ đề ${mapping.topicCode}`,
		difficultyOrGrade: `Lớp ${mapping.grade}`,
		description: `Game nối khái niệm theo chương trình học · Lớp ${mapping.grade} · Chủ đề ${mapping.topicCode}`,
		matchingGameId: mapping.gameId,
		matchingGrade: mapping.grade,
		matchingTopicCode: mapping.topicCode,
	}));

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
				<Card className="overflow-hidden border-slate-200/80 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-50">
					<CardHeader className="border-b border-white/10">
						<div className="flex items-center gap-2 text-sm font-medium text-sky-200">
							<Sparkles className="h-4 w-4" />
							Workspace quản lý trò chơi
						</div>
						<CardTitle className="text-2xl text-white">
							Một bảng chung cho toàn bộ game trong hệ thống
						</CardTitle>
						<CardDescription className="max-w-2xl text-slate-300">
							Theo dõi game thường và game nối khái niệm trong cùng một luồng
							quản trị, lọc nhanh theo loại, trạng thái và điều hướng thẳng tới
							trang chỉnh sửa chi tiết.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4 pt-6 md:grid-cols-3">
						<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
							<div className="text-sm text-slate-300">Tổng số game</div>
							<div className="mt-2 text-3xl font-semibold">{data.length}</div>
						</div>
						<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
							<div className="text-sm text-slate-300">Game thường</div>
							<div className="mt-2 text-3xl font-semibold">
								{standardRows.length}
							</div>
						</div>
						<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
							<div className="text-sm text-slate-300">Game nối khái niệm</div>
							<div className="mt-2 text-3xl font-semibold">
								{matchingRows.length}
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
							<CardTitle>Upload game HTML hoặc ZIP</CardTitle>
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
