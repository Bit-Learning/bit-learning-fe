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
	Link,
	useCanGoBack,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
import {
	Archive,
	ArrowLeft,
	ExternalLink,
	Eye,
	FileImage,
	FileUp,
	Gamepad2,
	Heart,
	Loader2,
	Save,
	Send,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import type { AdminRecentAttemptItem } from "../api/admin-games.api";
import { CurriculumLinkSection } from "../components/CurriculumLinkSection";
import { useAdminGameDetailAnalytics } from "../queries/useAdminGameAnalytics";
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
import { useRouter } from "@tanstack/react-router";

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

const GAME_TYPE_DETAILS: Record<
	NonNullable<UpsertGamePayload["gameType"]>,
	{ label: string; description: string }
> = {
	QUIZ: {
		label: "Game câu hỏi",
		description:
			"Phù hợp khi game có câu đúng, câu sai, tổng số câu hoặc cần phân tích độ chính xác.",
	},
	TYPING: {
		label: "Game gõ phím",
		description:
			"Phù hợp cho game gõ phím hoặc luyện phản xạ. Theo cấu hình hiện tại, loại này không tham gia bảng xếp hạng tổng.",
	},
	MATCHING: {
		label: "Game ghép cặp",
		description:
			"Phù hợp cho game ghép cặp hoặc nối đáp án, có điểm riêng để xếp hạng độc lập với quiz.",
	},
	OTHER: {
		label: "Khác / tùy biến",
		description:
			"Dùng khi game không khớp rõ với quiz, typing hoặc matching. Theo cấu hình mặc định, loại này không tính điểm và không lên bảng xếp hạng.",
	},
};

const getDefaultScoreConfigForGameType = (
	gameType: NonNullable<UpsertGamePayload["gameType"]>,
) => {
	if (gameType === "QUIZ" || gameType === "MATCHING") {
		return {
			scoringModel: "FINITE_SCORE" as const,
			isScored: true,
		};
	}

	return {
		scoringModel: "NO_SCORE" as const,
		isScored: false,
	};
};

const SCORING_MODEL_DETAILS: Record<
	NonNullable<UpsertGamePayload["scoringModel"]>,
	{ label: string; description: string; examples: string }
> = {
	FINITE_SCORE: {
		label: "Điểm có thang tối đa",
		description:
			"Hệ thống kỳ vọng có `rawScore` và `maxRawScore`, nên có thể tính độ chính xác hoặc tỷ lệ hoàn thành rõ ràng.",
		examples: "Ví dụ: 8/10 câu đúng, 15/20 cặp đúng.",
	},
	HIGH_SCORE: {
		label: "Điểm càng cao càng tốt",
		description:
			"Hệ thống chỉ quan tâm điểm đạt được của mỗi lượt chơi, không ép phải có tổng điểm tối đa cố định.",
		examples: "Ví dụ: điểm gõ phím, điểm arcade, điểm chạy vô tận.",
	},
	NO_SCORE: {
		label: "Không chấm điểm",
		description:
			"Hệ thống chỉ theo dõi tham gia, thời lượng và trạng thái hoàn thành, không hiển thị điểm số.",
		examples: "Ví dụ: luyện piano, sandbox, hoạt động khám phá.",
	},
};

const SCORE_TRACKING_DETAILS = {
	true: {
		label: "Có điểm",
		description:
			"UI và analytics sẽ hiển thị điểm, bảng xếp hạng hoặc tóm tắt điểm nếu kiểu tính điểm hỗ trợ.",
	},
	false: {
		label: "Không lấy điểm",
		description:
			"UI ưu tiên hiển thị tham gia và hoàn thành, tránh tạo cảm giác game có điểm khi thực tế không nên chấm.",
	},
};

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
	const router = useRouter();
	// Trả về boolean xem có thể quay lại an toàn mà không bị thoát app hay không
	const canGoBack = useCanGoBack();
	const [form, setForm] = useState<UpsertGamePayload>({
		title: "",
		desc: "",
		gameType: "QUIZ",
		scoringModel: "NO_SCORE",
		isScored: false,
		trackingConfig: "",
		difficulty: "MEDIUM",
		baseScoreMax: 100,
		difficultyMultiplier: 1.2,
		passingThreshold: 60,
		featuredViewWeight: 1,
		featuredLikeWeight: 5,
		featuredManualBoost: 0,
	});

	const handleBack = () => {
		if (canGoBack) {
			router.history.back();
		} else {
			// Fallback: Nếu không có lịch sử, ép chuyển hướng về trang danh sách mặc định
			navigate({ to: "/apps/games" });
		}
	};

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
				gameType: "QUIZ",
				scoringModel: "NO_SCORE",
				isScored: false,
				trackingConfig: "",
				difficulty: "MEDIUM",
				baseScoreMax: 100,
				difficultyMultiplier: 1.2,
				passingThreshold: 60,
				featuredViewWeight: 1,
				featuredLikeWeight: 5,
				featuredManualBoost: 0,
			});
			setThumbnailPreview(null);
			return;
		}
		if (!game) return;
		setForm({
			id: game.id,
			title: game.title ?? "",
			desc: game.description ?? "",
			gameType: game.gameType ?? "QUIZ",
			scoringModel: game.scoringModel ?? "NO_SCORE",
			isScored: game.isScored ?? game.scoringModel !== "NO_SCORE",
			trackingConfig: game.trackingConfig ?? "",
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

	const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB

	const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
	const [thumbnailError, setThumbnailError] = useState<string | null>(null);
	const [fileError, setFileError] = useState<string | null>(null);

	const onThumbnailChange = useCallback(
		(file?: File | null) => {
			if (!file) {
				setForm((prev) => ({ ...prev, thumbnail: undefined }));
				setThumbnailPreview(null);
				setThumbnailError(null);
				return;
			}
			if (file.size > FILE_SIZE_LIMIT) {
				setThumbnailError("Ảnh thumbnail vượt quá giới hạn 10MB");
				setForm((prev) => ({ ...prev, thumbnail: undefined }));
				setThumbnailPreview(null);
				return;
			}
			setThumbnailError(null);
			setForm((prev) => ({ ...prev, thumbnail: file }));
			const url = URL.createObjectURL(file);
			setThumbnailPreview(url);
		},
		[FILE_SIZE_LIMIT],
	);

	const onFileChange = useCallback(
		(file?: File | null) => {
			if (!file) {
				setForm((prev) => ({ ...prev, file: undefined }));
				setFileError(null);
				return;
			}
			if (file.size > FILE_SIZE_LIMIT) {
				setFileError("File game vượt quá giới hạn 10MB");
				setForm((prev) => ({ ...prev, file: undefined }));
				return;
			}
			setFileError(null);
			setForm((prev) => ({ ...prev, file }));
		},
		[FILE_SIZE_LIMIT],
	);

	const hasUploadError = thumbnailError !== null || fileError !== null;

	useEffect(() => {
		return () => {
			if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
		};
	}, [thumbnailPreview]);

	const playUrl =
		game?.minioObjectName !== undefined
			? `${MINIO_GAME_URL}/${game.minioObjectName}`
			: undefined;

	// Build full URL cho thumbnail hiện tại: nếu là path tương đối thì ghép base MinIO
	const currentThumbnailDisplayUrl = (() => {
		const raw = form.thumbnailUrl;
		if (!raw) return null;
		if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
		// Thumbnail được lưu trong cùng bucket scratch-games với game files
		return `${MINIO_GAME_URL}/${raw}`;
	})();
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
			? "Trọng số lượt thích đang chênh rất lớn so với lượt xem. Khu vực tâm điểm sẽ nghiêng mạnh về số lượt thích."
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
	const scoringModeDescription =
		form.scoringModel === "FINITE_SCORE"
			? "Dùng mô hình điểm trên tổng điểm. Phù hợp cho quiz, matching hoặc mọi game có điểm tối đa rõ ràng."
			: form.scoringModel === "HIGH_SCORE"
				? "Dùng mô hình điểm càng cao càng tốt. Phù hợp cho arcade, typing hoặc game cộng điểm liên tục."
				: "Chỉ theo dõi mức độ tham gia và hoàn thành, không ép game phải có điểm số.";
	const selectedGameType = GAME_TYPE_DETAILS[form.gameType ?? "QUIZ"];
	const selectedScoringModel =
		SCORING_MODEL_DETAILS[form.scoringModel ?? "NO_SCORE"];
	const selectedScoreTracking =
		SCORE_TRACKING_DETAILS[form.isScored === false ? "false" : "true"];
	const scoreTrackingWarning =
		form.scoringModel === "NO_SCORE" && form.isScored !== false
			? "Kiểu tính điểm hiện là không chấm điểm. Nên để chế độ hiển thị là không điểm để UI và analytics không hiểu nhầm đây là game có điểm."
			: form.scoringModel !== "NO_SCORE" && form.isScored === false
				? "Game này vẫn có kiểu tính điểm, nhưng bạn đang tắt hiển thị điểm. Chỉ dùng cấu hình này khi muốn lưu metrics nội bộ mà không muốn hiển thị điểm cho người học."
				: null;
	const behaviorSummaryLines =
		form.scoringModel === "FINITE_SCORE"
			? [
					"Kết quả sẽ được hiểu theo dạng điểm trên tổng điểm.",
					"Quản trị viên có thể xem độ chính xác, tỷ lệ hoàn thành và breakdown phù hợp cho quiz hoặc matching.",
					"Người học sẽ thấy điểm kiểu 8/10 thay vì điểm kỷ lục.",
				]
			: form.scoringModel === "HIGH_SCORE"
				? [
						"Kết quả sẽ được hiểu theo dạng điểm càng cao càng tốt.",
						"Quản trị viên sẽ ưu tiên điểm trung bình và điểm cao nhất thay vì độ chính xác.",
						"Người học sẽ thấy điểm kỷ lục và thời lượng thay vì điểm trên tổng điểm.",
					]
				: [
						"Kết quả sẽ được hiểu là activity không chấm điểm.",
						"Quản trị viên sẽ ưu tiên mức độ tham gia, tỷ lệ hoàn thành và thời lượng.",
						"Người học sẽ không bị hiển thị điểm giả hoặc độ chính xác giả.",
					];
	const analyticsScoringModel =
		analyticsDetail?.summary.scoringModel ?? form.scoringModel ?? "NO_SCORE";
	const analyticsModeSummary =
		analyticsScoringModel === "HIGH_SCORE"
			? {
					primaryLabel: "Điểm trung bình",
					primaryValue: String(analyticsDetail?.summary.averageRawScore ?? 0),
					secondaryLabel: "Điểm cao nhất",
					secondaryValue: String(analyticsDetail?.summary.bestRawScore ?? 0),
				}
			: analyticsScoringModel === "NO_SCORE"
				? {
						primaryLabel: "Tỷ lệ lượt có điểm",
						primaryValue: `${analyticsDetail?.summary.scoredAttemptRate ?? 0}%`,
						secondaryLabel: "Tỷ lệ hoàn thành",
						secondaryValue: `${analyticsDetail?.summary.completionRate ?? 0}%`,
					}
				: {
						primaryLabel: "Độ chính xác TB",
						primaryValue: `${analyticsDetail?.summary.averageAccuracy ?? 0}%`,
						secondaryLabel: "Tỷ lệ hết giờ",
						secondaryValue: `${analyticsDetail?.summary.timeoutRate ?? 0}%`,
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
					<button onClick={handleBack}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Quay lại danh sách
					</button>
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
								Thiết lập tiêu đề, mô tả, độ khó và thông tin hiển thị của game.
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

							<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
									<Label>Danh mục hiển thị</Label>
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

								<div className="space-y-2">
									<Label>Loại hành vi game</Label>
									<Select
										value={form.gameType ?? "QUIZ"}
										onValueChange={(value) =>
											setForm((prev) => {
												const nextGameType = value as NonNullable<
													UpsertGamePayload["gameType"]
												>;
												return {
													...prev,
													gameType: nextGameType,
													...getDefaultScoreConfigForGameType(nextGameType),
												};
											})
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Chọn loại game" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="QUIZ">Quiz / câu hỏi</SelectItem>
											<SelectItem value="TYPING">Typing / gõ phím</SelectItem>
											<SelectItem value="MATCHING">
												Matching / ghép cặp
											</SelectItem>
											<SelectItem value="OTHER">Other / tùy biến</SelectItem>
										</SelectContent>
									</Select>
									<p className="text-xs leading-5 text-muted-foreground">
										{selectedGameType.description} Trường này mô tả bản chất
										gameplay để hệ thống chọn cách xử lý phù hợp, không phải
										nhóm hiển thị.
									</p>
								</div>

								<div className="space-y-2">
									<Label>Kiểu tính điểm</Label>
									<Select
										value={form.scoringModel ?? "NO_SCORE"}
										onValueChange={(value) =>
											setForm((prev) => ({
												...prev,
												scoringModel:
													value as UpsertGamePayload["scoringModel"],
												isScored: value !== "NO_SCORE",
											}))
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Chọn kiểu tính điểm" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="FINITE_SCORE">
												Điểm có thang tối đa
											</SelectItem>
											<SelectItem value="HIGH_SCORE">
												Điểm càng cao càng tốt
											</SelectItem>
											<SelectItem value="NO_SCORE">Không chấm điểm</SelectItem>
										</SelectContent>
									</Select>
									<p className="text-xs leading-5 text-muted-foreground">
										{selectedScoringModel.description}
									</p>
									<p className="text-xs leading-5 text-muted-foreground">
										{selectedScoringModel.examples}
									</p>
								</div>
							</div>

							{/* <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
								<div className="space-y-1">
									<h3 className="text-sm font-semibold text-slate-900">
										Phần dưới đây là metadata hành vi, không phải taxonomy hiển
										thị
									</h3>
									<p className="text-sm text-slate-600">
										`Danh mục hiển thị` dùng để nhóm game theo nội dung. `Loại
										hành vi game`, `Kiểu tính điểm` và `Có hiển thị và phân tích
										điểm không` dùng để backend, tracking host và analytics hiểu
										game vận hành như thế nào.
									</p>
								</div>
							</div> */}

							{/* <div className="space-y-2">
								<Label>Có hiển thị và phân tích điểm không</Label>
								<Select
									value={form.isScored === false ? "false" : "true"}
									onValueChange={(value) =>
										setForm((prev) => ({
											...prev,
											isScored: value === "true",
										}))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Chọn chế độ hiển thị điểm" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="true">Có điểm</SelectItem>
										<SelectItem value="false">Không điểm</SelectItem>
									</SelectContent>
								</Select>
								<p className="text-xs leading-5 text-muted-foreground">
									{selectedScoreTracking.description}
								</p>
							</div> */}

							{/* <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
								<div className="space-y-3">
									<div className="space-y-1">
										<h3 className="text-sm font-semibold text-slate-900">
											Hệ thống sẽ hiểu cấu hình này như thế nào
										</h3>
										<p className="text-sm text-slate-600">
											Danh mục hiển thị hiện tại là{" "}
											<span className="font-medium text-slate-900">
												{getCategoryName(form.categoryId, categories)}
											</span>
											. Còn về mặt hành vi, game này được hiểu là{" "}
											<span className="font-medium text-slate-900">
												{selectedGameType.label}
											</span>
											; kiểu tính điểm là{" "}
											<span className="font-medium text-slate-900">
												{selectedScoringModel.label}
											</span>
											; và chế độ hiển thị là{" "}
											<span className="font-medium text-slate-900">
												{selectedScoreTracking.label}
											</span>
											.
										</p>
									</div>
									<div className="grid gap-2 md:grid-cols-3">
										{behaviorSummaryLines.map((line) => (
											<div
												key={line}
												className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
											>
												{line}
											</div>
										))}
									</div>
									{scoreTrackingWarning ? (
										<div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
											{scoreTrackingWarning}
										</div>
									) : null}
								</div>
							</div> */}

							{/* <div className="space-y-2">
								<Label htmlFor="trackingConfig">Cấu hình theo dõi</Label>
								<Textarea
									id="trackingConfig"
									value={form.trackingConfig ?? ""}
									onChange={(e) =>
										setForm((prev) => ({
											...prev,
											trackingConfig: e.target.value,
										}))
									}
									className="min-h-28 font-mono text-xs"
									placeholder='{"engine":"TURBOWARP","resultTrigger":"PROJECT_RUN_STOP"}'
								/>
								<p className="text-xs text-muted-foreground">
									{scoringModeDescription}
								</p>
								<p className="text-xs text-muted-foreground">
									Dùng khi game cần metadata kỹ thuật cho bridge hoặc engine, ví
									dụ ` engine`, `scoreVariableNames`, `resultTrigger`. Nếu bạn
									không chắc, có thể để trống và chỉ điền khi game integration
									yêu cầu.
								</p>
							</div> */}

							{/* <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-5">
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
							</div> */}

							<div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
								<div className="mb-4 space-y-1">
									<div className="flex flex-wrap items-center justify-between gap-3">
										<div className="flex flex-wrap items-center gap-2">
											<h3 className="text-sm font-semibold text-amber-950">
												Thiết lập spotlight
											</h3>
											{/* <span
												className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${spotlightStatus.className}`}
											>
												{spotlightStatus.label}
											</span> */}
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
									{/* Preview thumbnail */}
									{(thumbnailPreview ?? currentThumbnailDisplayUrl) ? (
										<div className="relative mb-3 overflow-hidden rounded-lg border bg-muted/30">
											<img
												src={
													thumbnailPreview ??
													currentThumbnailDisplayUrl ??
													undefined
												}
												alt="Thumbnail preview"
												className="h-36 w-full object-cover"
											/>
											{thumbnailPreview ? (
												<button
													type="button"
													onClick={() => {
														setThumbnailPreview(null);
														setForm((prev) => ({
															...prev,
															thumbnail: undefined,
														}));
													}}
													className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
												>
													<X className="h-3 w-3" />
												</button>
											) : null}
											{thumbnailPreview ? (
												<span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
													Ảnh mới
												</span>
											) : (
												<span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
													Ảnh hiện tại
												</span>
											)}
										</div>
									) : null}
									<Input
										id="thumbnailFile"
										type="file"
										accept="image/*"
										className={
											thumbnailError
												? "border-destructive focus-visible:ring-destructive"
												: undefined
										}
										onChange={(e) =>
											onThumbnailChange(e.target.files?.[0] ?? null)
										}
									/>
									{thumbnailError ? (
										<p className="mt-1.5 text-xs font-medium text-destructive">
											{thumbnailError}
										</p>
									) : (
										<p className="mt-2 text-xs text-muted-foreground">
											Nên dùng ảnh ngang rõ nét. Giới hạn{" "}
											<span className="font-medium text-foreground">10MB</span>.
										</p>
									)}
								</div>
								<div className="rounded-xl border border-dashed p-4">
									<div className="mb-3 flex items-center gap-2 text-sm font-medium">
										<FileUp className="h-4 w-4 text-emerald-600" />
										{isCreateMode ? "Tải tệp game" : "Thay tệp game"}
									</div>
									{/* Current game file info */}
									{!isCreateMode && game?.minioObjectName && !form.file ? (
										<div className="mb-3 flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
											<FileUp className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
											<span className="truncate font-mono">
												{game.minioObjectName}
											</span>
										</div>
									) : null}
									{form.file ? (
										<div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
											<FileUp className="h-3.5 w-3.5 shrink-0" />
											<span className="truncate font-mono">
												{form.file.name}
											</span>
											<span className="ml-auto shrink-0">
												{(form.file.size / 1024 / 1024).toFixed(1)}MB
											</span>
										</div>
									) : null}
									<Input
										id="file"
										type="file"
										accept=".zip,.html"
										className={
											fileError
												? "border-destructive focus-visible:ring-destructive"
												: undefined
										}
										onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
									/>
									{fileError ? (
										<p className="mt-1.5 text-xs font-medium text-destructive">
											{fileError}
										</p>
									) : (
										<p className="mt-2 text-xs text-muted-foreground">
											Chấp nhận{" "}
											<span className="font-medium text-foreground">.zip</span>{" "}
											hoặc{" "}
											<span className="font-medium text-foreground">.html</span>
											. Giới hạn{" "}
											<span className="font-medium text-foreground">10MB</span>.
										</p>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{!isCreateMode && gameId && form.gameType !== "MATCHING" ? (
						<CurriculumLinkSection
							gameId={gameId}
							gameType={form.gameType ?? "QUIZ"}
						/>
					) : null}
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
									<span className="text-muted-foreground">Điểm Trending</span>
									<span className="font-medium">{game?.trendScore ?? 0}</span>
								</div>
							</div>

							<Button
								className="w-full"
								onClick={() => void handleSave()}
								disabled={upsertGame.isPending || hasUploadError}
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

					{/* {!isCreateMode && analyticsDetail?.summary ? (
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
										<span className="text-muted-foreground">Lượt chơi</span>
										<span className="font-medium">
											{analyticsDetail.summary.attempts}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">Hoàn thành</span>
										<span className="font-medium">
											{analyticsDetail.summary.completionRate}%
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">
											{analyticsModeSummary.primaryLabel}
										</span>
										<span className="font-medium">
											{analyticsModeSummary.primaryValue}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">
											{analyticsModeSummary.secondaryLabel}
										</span>
										<span className="font-medium">
											{analyticsModeSummary.secondaryValue}
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
											Lượt chơi gần nhất
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
															{attempt.scoringModel === "HIGH_SCORE"
																? `Điểm ${attempt.rawScore ?? 0} • Thời lượng ${formatDuration(attempt.duration ?? 0)}`
																: attempt.scoringModel === "NO_SCORE"
																	? `Đã ghi nhận tham gia • ${attempt.attemptState ?? (attempt.completed ? "COMPLETED" : "PARTIAL")}`
																	: `Độ chính xác ${attempt.accuracy ?? 0}% • Đúng ${attempt.correctCount ?? 0} • Sai ${attempt.wrongCount ?? 0} • Hết giờ ${attempt.timeoutCount ?? 0}`}
														</div>
													</div>
												))}
										</div>
									</div>
								) : null}
							</CardContent>
						</Card>
					) : null} */}
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
