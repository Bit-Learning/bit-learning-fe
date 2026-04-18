import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
	ArrowLeft,
	Archive,
	ExternalLink,
	Eye,
	FileImage,
	FileUp,
	Gamepad2,
	Heart,
	Loader2,
	Save,
	Send,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MINIO_GAME_URL } from "@/shared/constants/endpoints";
import {
	useAdminGamesList,
	useApproveGame,
	useDeleteGame,
	useGameCategories,
	useRejectGame,
	useUpsertGame,
	type GameCategoryOption,
	type UpsertGamePayload,
} from "../queries/useAdminGamesCrud";
import type { AdminRecentAttemptItem } from "../api/admin-games.api";
import { useAdminGameDetailAnalytics } from "../queries/useAdminGameAnalytics";

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

type StandardGameEditorPageProps = {
	gameId?: number;
};

const getCategoryName = (
	categoryId?: number | null,
	cats?: GameCategoryOption[],
) => {
	if (!categoryId || !cats || cats.length === 0) return "Chưa phân loại";
	return cats.find((c) => c.id === categoryId)?.name ?? "Chưa phân loại";
};

const formatDuration = (seconds: number) =>
	`${Math.floor(seconds / 60)}m ${seconds % 60}s`;

export const StandardGameEditorPage: React.FC<StandardGameEditorPageProps> = ({
	gameId,
}) => {
	const navigate = useNavigate();
	const isCreateMode = gameId === undefined;
	const { data: games = [], isLoading: isLoadingGames } = useAdminGamesList();
	const { data: categories = [] } = useGameCategories();
	const { data: analyticsDetail } = useAdminGameDetailAnalytics(gameId, 30);
	const upsertGame = useUpsertGame();
	const deleteGame = useDeleteGame();
	const approveGame = useApproveGame();
	const rejectGame = useRejectGame();
	const [form, setForm] = useState<UpsertGamePayload>({
		title: "",
		desc: "",
		difficulty: "MEDIUM",
		baseScoreMax: 100,
		difficultyMultiplier: 1.2,
		passingThreshold: 60,
		featuredViewWeight: 1,
		featuredLikeWeight: 5,
		featuredManualBoost: 0,
	});

	const game = useMemo(
		() => (isCreateMode ? undefined : games.find((item) => item.id === gameId)),
		[gameId, games, isCreateMode],
	);
	useEffect(() => {
		if (game?.gameType !== "MATCHING" || game.id === undefined) return;
		navigate({
			to: "/apps/games/matching",
			search: { gameId: game.id },
			replace: true,
		});
	}, [game?.gameType, game?.id, navigate]);

	useEffect(() => {
		if (isCreateMode) {
			setForm({
				title: "",
				desc: "",
				difficulty: "MEDIUM",
				baseScoreMax: 100,
				difficultyMultiplier: 1.2,
				passingThreshold: 60,
				featuredViewWeight: 1,
				featuredLikeWeight: 5,
				featuredManualBoost: 0,
			});
			return;
		}
		if (!game) return;
		setForm({
			id: game.id,
			title: game.title ?? "",
			desc: game.description ?? "",
			difficulty: game.difficulty ?? "MEDIUM",
			baseScoreMax: game.scoringBaseScoreMax ?? 100,
			difficultyMultiplier: game.scoringDifficultyMultiplier ?? 1.2,
			passingThreshold: game.scoringPassingThreshold ?? 60,
			featuredViewWeight: game.featuredViewWeight ?? 1,
			featuredLikeWeight: game.featuredLikeWeight ?? 5,
			featuredManualBoost: game.featuredManualBoost ?? 0,
			categoryId: game.categoryId ?? undefined,
			thumbnailUrl: game.thumbnailUrl ?? "",
		});
	}, [game, isCreateMode]);

	const onThumbnailChange = (file?: File | null) => {
		setForm((prev) => ({ ...prev, thumbnail: file ?? undefined }));
	};

	const onFileChange = (file?: File | null) => {
		setForm((prev) => ({ ...prev, file: file ?? undefined }));
	};

	const playUrl =
		game?.minioObjectName !== undefined
			? `${MINIO_GAME_URL}/${game.minioObjectName}`
			: undefined;
	const previewBaseScoreMax = form.baseScoreMax ?? 100;
	const previewDifficultyMultiplier = form.difficultyMultiplier ?? 1.2;
	const previewPassingThreshold = form.passingThreshold ?? 60;
	const previewFeaturedViewWeight = form.featuredViewWeight ?? 1;
	const previewFeaturedLikeWeight = form.featuredLikeWeight ?? 5;
	const previewFeaturedManualBoost = form.featuredManualBoost ?? 0;
	const sampleRawScore = 80;
	const sampleRawMax = 100;
	const sampleViews = 120;
	const sampleLikes = 18;
	const normalizedPreviewScore = Math.round(
		(sampleRawScore / sampleRawMax) * previewBaseScoreMax,
	);
	const leaderboardPreviewScore = Math.round(
		normalizedPreviewScore * previewDifficultyMultiplier,
	);
	const spotlightPreviewScore =
		sampleViews * previewFeaturedViewWeight +
		sampleLikes * previewFeaturedLikeWeight +
		previewFeaturedManualBoost;
	const isPassingThresholdRisk = previewPassingThreshold > previewBaseScoreMax;
	const isDifficultyMultiplierRisk = previewDifficultyMultiplier >= 2;
	const isManualBoostRisk =
		previewFeaturedManualBoost > sampleViews * previewFeaturedViewWeight;
	const isLikeWeightRisk =
		previewFeaturedLikeWeight > previewFeaturedViewWeight * 10;
	const scoringWarnings = [
		isPassingThresholdRisk
			? "Ngưỡng hoàn thành đang lớn hơn điểm chuẩn tối đa. Điều này dễ khiến người chơi gần như không thể đạt trạng thái hoàn thành."
			: null,
		isDifficultyMultiplierRisk
			? "Hệ số độ khó đang khá cao. Hãy kiểm tra lại để tránh leaderboard bị lệch quá mạnh so với các game khác."
			: null,
	]
		.filter(Boolean)
		.map((message) => message as string);
	const spotlightWarnings = [
		isManualBoostRisk
			? "Điểm đẩy thủ công hiện đang lớn hơn phần đóng góp từ lượt xem mẫu. Game có thể được đẩy spotlight quá mạnh so với tín hiệu thực tế."
			: null,
		isLikeWeightRisk
			? "Trọng số lượt thích đang chênh rất lớn so với lượt xem. Spotlight sẽ nghiêng mạnh về số lượt thích."
			: null,
	]
		.filter(Boolean)
		.map((message) => message as string);
	const scoringStatus =
		scoringWarnings.length === 0
			? {
					label: "Ổn định",
					className: "border-emerald-200 bg-emerald-50 text-emerald-700",
				}
			: scoringWarnings.length === 1
				? {
						label: "Cần xem lại",
						className: "border-amber-200 bg-amber-50 text-amber-700",
					}
				: {
						label: "Rủi ro cao",
						className: "border-orange-200 bg-orange-50 text-orange-700",
					};
	const spotlightStatus =
		spotlightWarnings.length === 0
			? {
					label: "Ổn định",
					className: "border-emerald-200 bg-emerald-50 text-emerald-700",
				}
			: spotlightWarnings.length === 1
				? {
						label: "Cần xem lại",
						className: "border-amber-200 bg-amber-50 text-amber-700",
					}
				: {
						label: "Rủi ro cao",
						className: "border-orange-200 bg-orange-50 text-orange-700",
					};

	const handleSave = async () => {
		try {
			const saved = await upsertGame.mutateAsync({
				...form,
				id: gameId,
			});
			toast.success(
				isCreateMode ? "Tạo game thành công" : "Cập nhật game thành công",
			);
			if (isCreateMode) {
				navigate({ to: "/apps/games/$id", params: { id: String(saved.id) } });
			}
		} catch (error: unknown) {
			toast.error(
				getErrorMessage(
					error,
					isCreateMode ? "Không thể tạo game" : "Không thể cập nhật game",
				),
			);
		}
	};

	const handleApprove = async () => {
		if (!game) return;
		try {
			await approveGame.mutateAsync(game.id);
			toast.success("Game đã được duyệt và xuất bản");
		} catch (error: unknown) {
			toast.error(getErrorMessage(error, "Không thể duyệt game"));
		}
	};

	const handleReject = async () => {
		if (!game) return;
		try {
			await rejectGame.mutateAsync(game.id);
			toast.success("Game đã được chuyển về trạng thái nháp");
		} catch (error: unknown) {
			toast.error(getErrorMessage(error, "Không thể chuyển game về nháp"));
		}
	};

	const handleArchive = async () => {
		if (!game) return;
		try {
			await deleteGame.mutateAsync(game.id);
			toast.success("Đã lưu trữ game");
			navigate({ to: "/apps/games" });
		} catch (error: unknown) {
			toast.error(getErrorMessage(error, "Không thể lưu trữ game"));
		}
	};

	const resetScoringDefaults = () => {
		setForm((prev) => ({
			...prev,
			baseScoreMax: 100,
			difficultyMultiplier: 1.2,
			passingThreshold: 60,
		}));
		toast.success("Đã khôi phục mặc định cho thiết lập chấm điểm");
	};

	const resetSpotlightDefaults = () => {
		setForm((prev) => ({
			...prev,
			featuredViewWeight: 1,
			featuredLikeWeight: 5,
			featuredManualBoost: 0,
		}));
		toast.success("Đã khôi phục mặc định cho thiết lập spotlight");
	};

	if (!isCreateMode && isLoadingGames) {
		return (
			<div className="flex items-center gap-2 p-6 text-muted-foreground">
				<Loader2 className="h-4 w-4 animate-spin" />
				Đang tải chi tiết game...
			</div>
		);
	}

	if (!isCreateMode && !game) {
		return (
			<div className="p-6">
				<p className="text-destructive">Không tìm thấy game.</p>
			</div>
		);
	}

	if (!isCreateMode && game?.gameType === "MATCHING") {
		return (
			<div className="flex items-center gap-2 p-6 text-muted-foreground">
				<Loader2 className="h-4 w-4 animate-spin" />
				Đang chuyển sang trình biên tập matching game...
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Button asChild variant="link" className="px-0">
					<Link to="/apps/games">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Quay lại danh sách
					</Link>
				</Button>
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div className="space-y-2">
						<div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600">
							<Gamepad2 className="h-4 w-4" />
							{isCreateMode ? "Tạo game thường" : "Biên tập game thường"}
						</div>
						<div>
							<h2 className="text-3xl font-bold tracking-tight">
								{isCreateMode ? "Tạo trò chơi mới" : game?.title}
							</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								{isCreateMode
									? "Tạo game với file HTML hoặc ZIP, metadata và thumbnail trong cùng một màn hình."
									: `ID #${game?.id} · ${getCategoryName(game?.categoryId, categories)}`}
							</p>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
						{!isCreateMode ? (
							<>
								<span className="inline-flex items-center gap-1">
									<Eye className="h-4 w-4" />
									{game?.views ?? 0}
								</span>
								<span className="inline-flex items-center gap-1">
									<Heart className="h-4 w-4" />
									{game?.likes ?? 0}
								</span>
							</>
						) : null}
					</div>
				</div>
			</div>

			<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
				<div className="space-y-6">
					<Card>
						<CardHeader className="border-b">
							<CardTitle>Thông tin cơ bản</CardTitle>
							<CardDescription>
								Thiết lập tiêu đề, mô tả, độ khó và danh mục hiển thị của game.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-5 pt-6">
							<div className="space-y-2">
								<Label htmlFor="title">Tiêu đề</Label>
								<Input
									id="title"
									value={form.title}
									onChange={(e) =>
										setForm((prev) => ({ ...prev, title: e.target.value }))
									}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="desc">Mô tả</Label>
								<Textarea
									id="desc"
									value={form.desc}
									onChange={(e) =>
										setForm((prev) => ({ ...prev, desc: e.target.value }))
									}
									className="min-h-36"
								/>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label>Độ khó</Label>
									<Select
										value={form.difficulty ?? "MEDIUM"}
										onValueChange={(value) =>
											setForm((prev) => ({ ...prev, difficulty: value }))
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Chọn độ khó" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="EASY">Dễ</SelectItem>
											<SelectItem value="MEDIUM">Trung bình</SelectItem>
											<SelectItem value="HARD">Khó</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label>Danh mục</Label>
									<Select
										value={
											form.categoryId !== undefined
												? String(form.categoryId)
												: "__none__"
										}
										onValueChange={(value) =>
											setForm((prev) => ({
												...prev,
												categoryId:
													value === "__none__" ? undefined : Number(value),
											}))
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Chọn danh mục" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="__none__">Không chọn</SelectItem>
											{categories.map((c) => (
												<SelectItem key={c.id} value={String(c.id)}>
													{c.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-5">
								<div className="mb-4 space-y-1">
									<div className="flex flex-wrap items-center justify-between gap-3">
										<div className="flex flex-wrap items-center gap-2">
											<h3 className="text-sm font-semibold text-sky-950">
												Thiết lập chấm điểm
											</h3>
											<span
												className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${scoringStatus.className}`}
											>
												{scoringStatus.label}
											</span>
										</div>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={resetScoringDefaults}
										>
											Khôi phục mặc định
										</Button>
									</div>
									<p className="text-xs text-sky-900/70">
										Các thông số này quyết định cách quy đổi kết quả chơi thành
										điểm số chuẩn hóa và điểm leaderboard.
									</p>
								</div>
								<div className="grid gap-4 md:grid-cols-3">
									<div className="space-y-2">
										<Label htmlFor="baseScoreMax">Điểm chuẩn tối đa</Label>
										<Input
											id="baseScoreMax"
											type="number"
											min={1}
											value={form.baseScoreMax ?? 100}
											onChange={(e) =>
												setForm((prev) => ({
													...prev,
													baseScoreMax: Number(e.target.value || 100),
												}))
											}
										/>
										<p className="text-xs text-sky-900/70">
											Thang điểm gốc trước khi nhân hệ số. Thường nên để `100`
											để dễ chuẩn hóa giữa các game.
										</p>
									</div>

									<div className="space-y-2">
										<Label htmlFor="difficultyMultiplier">Hệ số độ khó</Label>
										<Input
											id="difficultyMultiplier"
											type="number"
											min={0.1}
											step="0.1"
											className={
												isDifficultyMultiplierRisk
													? "border-orange-400 bg-orange-50 focus-visible:ring-orange-500"
													: undefined
											}
											value={form.difficultyMultiplier ?? 1.2}
											onChange={(e) =>
												setForm((prev) => ({
													...prev,
													difficultyMultiplier: Number(e.target.value || 1.2),
												}))
											}
										/>
										<p className="text-xs text-sky-900/70">
											Hệ số nhân vào điểm sau chuẩn hóa. Game khó hơn nên có hệ
											số cao hơn, ví dụ `1.0`, `1.2`, `1.5`.
										</p>
									</div>

									<div className="space-y-2">
										<Label htmlFor="passingThreshold">Ngưỡng hoàn thành</Label>
										<Input
											id="passingThreshold"
											type="number"
											min={0}
											max={100}
											className={
												isPassingThresholdRisk
													? "border-orange-400 bg-orange-50 focus-visible:ring-orange-500"
													: undefined
											}
											value={form.passingThreshold ?? 60}
											onChange={(e) =>
												setForm((prev) => ({
													...prev,
													passingThreshold: Number(e.target.value || 60),
												}))
											}
										/>
										<p className="text-xs text-sky-900/70">
											Mức điểm tối thiểu để xem là đạt game. Giá trị tính theo
											thang chuẩn từ `0` đến `100`.
										</p>
									</div>
								</div>
								<div className="mt-4 rounded-xl border border-sky-200 bg-white/70 p-4">
									<p className="text-xs font-semibold uppercase tracking-wide text-sky-900/70">
										Xem trước công thức
									</p>
									<div className="mt-2 space-y-2 text-sm text-slate-700">
										<p>
											Điểm chuẩn hóa minh họa:
											<span className="font-medium text-slate-950">
												{" "}
												({sampleRawScore}/{sampleRawMax}) x{" "}
												{previewBaseScoreMax} = {normalizedPreviewScore}
											</span>
										</p>
										<p>
											Điểm leaderboard minh họa:
											<span className="font-medium text-slate-950">
												{" "}
												{normalizedPreviewScore} x {previewDifficultyMultiplier}{" "}
												= {leaderboardPreviewScore}
											</span>
										</p>
										<p>
											Ngưỡng đạt hiện tại:
											<span className="font-medium text-slate-950">
												{" "}
												{previewPassingThreshold}/100
											</span>
										</p>
									</div>
								</div>
								{scoringWarnings.length > 0 ? (
									<div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
										<p className="text-xs font-semibold uppercase tracking-wide text-orange-900/80">
											Lưu ý cấu hình
										</p>
										<div className="mt-2 space-y-2 text-sm text-orange-950">
											{scoringWarnings.map((warning) => (
												<p key={warning}>• {warning}</p>
											))}
										</div>
									</div>
								) : null}
							</div>

							<div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
								<div className="mb-4 space-y-1">
									<div className="flex flex-wrap items-center justify-between gap-3">
										<div className="flex flex-wrap items-center gap-2">
											<h3 className="text-sm font-semibold text-amber-950">
												Thiết lập spotlight
											</h3>
											<span
												className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${spotlightStatus.className}`}
											>
												{spotlightStatus.label}
											</span>
										</div>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={resetSpotlightDefaults}
										>
											Khôi phục mặc định
										</Button>
									</div>
									<p className="text-xs text-amber-900/70">
										Điểm nổi bật ở trang `/games` được tính theo công thức:
										`lượt xem x trọng số xem + lượt thích x trọng số thích +
										boost thủ công`.
									</p>
								</div>
								<div className="grid gap-4 md:grid-cols-3">
									<div className="space-y-2">
										<Label htmlFor="featuredViewWeight">
											Trọng số lượt xem
										</Label>
										<Input
											id="featuredViewWeight"
											type="number"
											min={0}
											step="0.1"
											value={form.featuredViewWeight ?? 1}
											onChange={(e) =>
												setForm((prev) => ({
													...prev,
													featuredViewWeight: Number(e.target.value || 1),
												}))
											}
										/>
										<p className="text-xs text-amber-900/70">
											Mỗi lượt xem đóng góp bao nhiêu điểm vào spotlight. Tăng
											giá trị này nếu muốn ưu tiên game đang được xem nhiều.
										</p>
									</div>

									<div className="space-y-2">
										<Label htmlFor="featuredLikeWeight">
											Trọng số lượt thích
										</Label>
										<Input
											id="featuredLikeWeight"
											type="number"
											min={0}
											step="0.1"
											className={
												isLikeWeightRisk
													? "border-orange-400 bg-orange-50 focus-visible:ring-orange-500"
													: undefined
											}
											value={form.featuredLikeWeight ?? 5}
											onChange={(e) =>
												setForm((prev) => ({
													...prev,
													featuredLikeWeight: Number(e.target.value || 5),
												}))
											}
										/>
										<p className="text-xs text-amber-900/70">
											Mỗi lượt thích đóng góp bao nhiêu điểm vào spotlight. Nếu
											muốn ưu tiên chất lượng hơn số lượt xem, hãy tăng hệ số
											này.
										</p>
									</div>

									<div className="space-y-2">
										<Label htmlFor="featuredManualBoost">
											Điểm đẩy thủ công
										</Label>
										<Input
											id="featuredManualBoost"
											type="number"
											step="1"
											className={
												isManualBoostRisk
													? "border-orange-400 bg-orange-50 focus-visible:ring-orange-500"
													: undefined
											}
											value={form.featuredManualBoost ?? 0}
											onChange={(e) =>
												setForm((prev) => ({
													...prev,
													featuredManualBoost: Number(e.target.value || 0),
												}))
											}
										/>
										<p className="text-xs text-amber-900/70">
											Cộng thẳng vào điểm nổi bật để đẩy game lên spotlight theo
											ý quản trị, không phụ thuộc hoàn toàn vào view hoặc like.
										</p>
									</div>
								</div>
								<div className="mt-4 rounded-xl border border-amber-200 bg-white/70 p-4">
									<p className="text-xs font-semibold uppercase tracking-wide text-amber-900/70">
										Xem trước công thức
									</p>
									<div className="mt-2 space-y-2 text-sm text-slate-700">
										<p>
											Điểm spotlight minh họa:
											<span className="font-medium text-slate-950">
												{" "}
												{sampleViews} x {previewFeaturedViewWeight} +{" "}
												{sampleLikes} x {previewFeaturedLikeWeight} +{" "}
												{previewFeaturedManualBoost} = {spotlightPreviewScore}
											</span>
										</p>
										<p className="text-xs text-amber-900/70">
											Ví dụ trên giả định game có {sampleViews} lượt xem và{" "}
											{sampleLikes} lượt thích để bạn hình dung nhanh tác động
											của từng hệ số.
										</p>
									</div>
								</div>
								{spotlightWarnings.length > 0 ? (
									<div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
										<p className="text-xs font-semibold uppercase tracking-wide text-orange-900/80">
											Lưu ý cấu hình
										</p>
										<div className="mt-2 space-y-2 text-sm text-orange-950">
											{spotlightWarnings.map((warning) => (
												<p key={warning}>• {warning}</p>
											))}
										</div>
									</div>
								) : null}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="border-b">
							<CardTitle>Media và tệp game</CardTitle>
							<CardDescription>
								Quản lý thumbnail và file chơi của game trong cùng một khu vực.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-5 pt-6">
							<div className="space-y-2">
								<Label htmlFor="thumbnailUrl">Đường dẫn ảnh thumbnail</Label>
								<Input
									id="thumbnailUrl"
									value={form.thumbnailUrl ?? ""}
									onChange={(e) =>
										setForm((prev) => ({
											...prev,
											thumbnailUrl: e.target.value || undefined,
										}))
									}
								/>
								<p className="text-xs text-muted-foreground">
									Dùng khi ảnh thumbnail đã có sẵn ở một URL công khai. Nếu bạn
									tải ảnh mới bên dưới thì ảnh tải lên sẽ được ưu tiên.
								</p>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div className="rounded-xl border border-dashed p-4">
									<div className="mb-3 flex items-center gap-2 text-sm font-medium">
										<FileImage className="h-4 w-4 text-sky-600" />
										Tải ảnh thumbnail
									</div>
									<Input
										id="thumbnailFile"
										type="file"
										accept="image/*"
										onChange={(e) =>
											onThumbnailChange(e.target.files?.[0] ?? null)
										}
									/>
									<p className="mt-2 text-xs text-muted-foreground">
										Nên dùng ảnh ngang rõ nét để hiển thị tốt ở danh sách game
										và khối featured.
									</p>
								</div>
								<div className="rounded-xl border border-dashed p-4">
									<div className="mb-3 flex items-center gap-2 text-sm font-medium">
										<FileUp className="h-4 w-4 text-emerald-600" />
										{isCreateMode ? "Tải tệp game" : "Thay tệp game"}
									</div>
									<Input
										id="file"
										type="file"
										accept=".zip,.html"
										onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
									/>
									<p className="mt-2 text-xs text-muted-foreground">
										Chấp nhận file `.zip` hoặc `.html`.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card className="xl:sticky xl:top-24">
						<CardHeader className="border-b">
							<CardTitle>{isCreateMode ? "Xuất bản" : "Điều khiển"}</CardTitle>
							<CardDescription>
								Thao tác lưu, duyệt, chuyển nháp và lưu trữ được gom vào một
								panel rõ ràng.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4 pt-6">
							<div className="grid gap-3 rounded-xl border bg-muted/20 p-4 text-sm">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Trạng thái</span>
									<span className="font-medium">
										{isCreateMode ? "Bản nháp mới" : (game?.status ?? "-")}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Danh mục</span>
									<span className="font-medium">
										{getCategoryName(form.categoryId, categories)}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">File game</span>
									<span className="font-medium">
										{form.file?.name ??
											(isCreateMode ? "Chưa chọn" : "Đang giữ file hiện tại")}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Trend score</span>
									<span className="font-medium">{game?.trendScore ?? 0}</span>
								</div>
							</div>

							<Button
								className="w-full"
								onClick={() => void handleSave()}
								disabled={upsertGame.isPending}
							>
								<Save className="mr-2 h-4 w-4" />
								{upsertGame.isPending
									? "Đang lưu..."
									: isCreateMode
										? "Tạo game"
										: "Lưu thay đổi"}
							</Button>

							{playUrl ? (
								<Button asChild className="w-full" variant="outline">
									<a href={playUrl} target="_blank" rel="noreferrer">
										<ExternalLink className="mr-2 h-4 w-4" />
										Mở bản chơi
									</a>
								</Button>
							) : null}

							{!isCreateMode && game?.status === "DRAFT" ? (
								<Button
									className="w-full"
									variant="outline"
									onClick={() => void handleApprove()}
									disabled={approveGame.isPending}
								>
									<Send className="mr-2 h-4 w-4" />
									Duyệt và xuất bản
								</Button>
							) : null}

							{!isCreateMode && game?.status === "PUBLISHED" ? (
								<Button
									className="w-full"
									variant="outline"
									onClick={() => void handleReject()}
									disabled={rejectGame.isPending}
								>
									Chuyển về nháp
								</Button>
							) : null}

							{!isCreateMode ? (
								<Button
									className="w-full"
									variant="destructive"
									onClick={() => void handleArchive()}
									disabled={deleteGame.isPending || game?.status === "ARCHIVED"}
								>
									<Archive className="mr-2 h-4 w-4" />
									Lưu trữ game
								</Button>
							) : null}
						</CardContent>
					</Card>

					{!isCreateMode && analyticsDetail?.summary ? (
						<Card>
							<CardHeader className="border-b">
								<CardTitle>Tracking 30 ngày</CardTitle>
								<CardDescription>
									Số liệu thật lấy từ play history và result metrics của game.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4 pt-6">
								<div className="grid gap-3 rounded-xl border bg-muted/20 p-4 text-sm">
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">Attempts</span>
										<span className="font-medium">
											{analyticsDetail.summary.attempts}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">Completion</span>
										<span className="font-medium">
											{analyticsDetail.summary.completionRate}%
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">Accuracy TB</span>
										<span className="font-medium">
											{analyticsDetail.summary.averageAccuracy}%
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">Timeout</span>
										<span className="font-medium">
											{analyticsDetail.summary.timeoutRate}%
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">Thời lượng TB</span>
										<span className="font-medium">
											{formatDuration(
												analyticsDetail.summary.averageDurationSeconds,
											)}
										</span>
									</div>
								</div>

								{analyticsDetail.exitReasons.length > 0 ? (
									<div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
										<p className="text-xs font-semibold uppercase tracking-wide text-amber-900/80">
											Lý do bỏ dở phổ biến
										</p>
										<div className="mt-3 space-y-2 text-sm text-amber-950">
											{analyticsDetail.exitReasons.slice(0, 3).map((item) => (
												<div
													key={item.key}
													className="flex items-center justify-between gap-3"
												>
													<span>{item.label}</span>
													<span className="font-medium">
														{item.count} lượt • {item.rate}%
													</span>
												</div>
											))}
										</div>
									</div>
								) : null}

								{analyticsDetail.recentAttempts.length > 0 ? (
									<div className="rounded-xl border p-4">
										<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
											Attempt gần nhất
										</p>
										<div className="mt-3 space-y-3">
											{analyticsDetail.recentAttempts
												.slice(0, 3)
												.map((attempt: AdminRecentAttemptItem) => (
													<div
														key={attempt.id}
														className="rounded-lg bg-muted/40 p-3 text-sm"
													>
														<div className="flex items-center justify-between gap-3">
															<span className="font-medium">
																{new Date(attempt.playedAt).toLocaleString(
																	"vi-VN",
																)}
															</span>
															<span className="text-muted-foreground">
																{attempt.completed ? "Hoàn thành" : "Bỏ dở"}
															</span>
														</div>
														<div className="mt-2 text-xs text-muted-foreground">
															Accuracy {attempt.accuracy ?? 0}% • Đúng{" "}
															{attempt.correctCount ?? 0} • Sai{" "}
															{attempt.wrongCount ?? 0} • Hết giờ{" "}
															{attempt.timeoutCount ?? 0}
														</div>
													</div>
												))}
										</div>
									</div>
								) : null}
							</CardContent>
						</Card>
					) : null}
				</div>
			</div>
		</div>
	);
};

export const GameDetailPage: React.FC = () => {
	const { id } = useParams({ strict: false });
	const gameId = Number.parseInt(id || "0", 10);
	return <StandardGameEditorPage gameId={gameId} />;
};
