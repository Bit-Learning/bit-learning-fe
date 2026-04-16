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

export const StandardGameEditorPage: React.FC<StandardGameEditorPageProps> = ({
	gameId,
}) => {
	const navigate = useNavigate();
	const isCreateMode = gameId === undefined;
	const { data: games = [], isLoading: isLoadingGames } = useAdminGamesList();
	const { data: categories = [] } = useGameCategories();
	const upsertGame = useUpsertGame();
	const deleteGame = useDeleteGame();
	const approveGame = useApproveGame();
	const rejectGame = useRejectGame();
	const [form, setForm] = useState<UpsertGamePayload>({
		title: "",
		desc: "",
		difficulty: "MEDIUM",
	});

	const game = useMemo(
		() => (isCreateMode ? undefined : games.find((item) => item.id === gameId)),
		[gameId, games, isCreateMode],
	);

	useEffect(() => {
		if (isCreateMode) {
			setForm({ title: "", desc: "", difficulty: "MEDIUM" });
			return;
		}
		if (!game) return;
		setForm({
			id: game.id,
			title: game.title ?? "",
			desc: game.description ?? "",
			difficulty: game.difficulty ?? "MEDIUM",
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
								<Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
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
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div className="rounded-xl border border-dashed p-4">
									<div className="mb-3 flex items-center gap-2 text-sm font-medium">
										<FileImage className="h-4 w-4 text-sky-600" />
										Upload thumbnail
									</div>
									<Input
										id="thumbnailFile"
										type="file"
										accept="image/*"
										onChange={(e) =>
											onThumbnailChange(e.target.files?.[0] ?? null)
										}
									/>
								</div>
								<div className="rounded-xl border border-dashed p-4">
									<div className="mb-3 flex items-center gap-2 text-sm font-medium">
										<FileUp className="h-4 w-4 text-emerald-600" />
										{isCreateMode ? "Upload file game" : "Thay file game"}
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
