import type React from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Eye, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export const GameDetailPage: React.FC = () => {
	const { id } = useParams({ strict: false });
	const navigate = useNavigate();
	const gameId = Number.parseInt(id || "0", 10);

	const { data: games = [], isLoading } = useAdminGamesList();
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

	const game = games.find((item) => item.id === gameId);

	useEffect(() => {
		if (!game) return;
		setForm({
			id: game.id,
			title: game.title ?? "",
			desc: game.description ?? "",
			difficulty: game.difficulty ?? "MEDIUM",
			categoryId: game.categoryId ?? undefined,
			thumbnailUrl: game.thumbnailUrl ?? "",
		});
	}, [game]);

	const getCategoryName = (
		categoryId?: number | null,
		cats?: GameCategoryOption[],
	) => {
		if (!categoryId || !cats || cats.length === 0) return "-";
		return cats.find((c) => c.id === categoryId)?.name ?? "-";
	};

	const onThumbnailChange = (file?: File | null) => {
		setForm((prev) => ({ ...prev, thumbnail: file ?? undefined }));
	};

	const onFileChange = (file?: File | null) => {
		setForm((prev) => ({ ...prev, file: file ?? undefined }));
	};

	const playUrl = game?.minioObjectName
		? `${MINIO_GAME_URL}/${game.minioObjectName}`
		: undefined;

	const handleSave = async () => {
		if (!game) return;
		try {
			await upsertGame.mutateAsync({ ...form, id: game.id });
			toast.success("Cập nhật game thành công");
		} catch (error: unknown) {
			toast.error(getErrorMessage(error, "Không thể cập nhật game"));
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

	if (isLoading) {
		return (
			<div className="flex items-center gap-2 p-6 text-muted-foreground">
				<Loader2 className="h-4 w-4 animate-spin" />
				Đang tải chi tiết game...
			</div>
		);
	}

	if (!game) {
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
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">{game.title}</h2>
						<p className="text-sm text-muted-foreground">
							ID #{game.id} · {getCategoryName(game.categoryId, categories)}
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
						<span className="inline-flex items-center gap-1">
							<Eye className="h-4 w-4" />
							{game.views ?? 0}
						</span>
						<span className="inline-flex items-center gap-1">
							<Heart className="h-4 w-4" />
							{game.likes ?? 0}
						</span>
					</div>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
				<Card>
					<CardHeader>
						<CardTitle>Thông tin game</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-1">
							<Label htmlFor="title">Tiêu đề</Label>
							<Input
								id="title"
								value={form.title}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, title: e.target.value }))
								}
							/>
						</div>

						<div className="space-y-1">
							<Label htmlFor="desc">Mô tả</Label>
							<Textarea
								id="desc"
								value={form.desc}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, desc: e.target.value }))
								}
								className="min-h-32"
							/>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-1">
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

							<div className="space-y-1">
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

						<div className="space-y-1">
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
							<div className="space-y-1">
								<Label htmlFor="thumbnailFile">Upload thumbnail</Label>
								<Input
									id="thumbnailFile"
									type="file"
									accept="image/*"
									onChange={(e) =>
										onThumbnailChange(e.target.files?.[0] ?? null)
									}
								/>
							</div>
							<div className="space-y-1">
								<Label htmlFor="file">Thay file game</Label>
								<Input
									id="file"
									type="file"
									accept=".zip,.html"
									onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Thông tin nhanh</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Trạng thái</span>
								<span className="font-medium">{game.status ?? "-"}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Danh mục</span>
								<span className="font-medium">
									{getCategoryName(game.categoryId, categories)}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Lượt xem</span>
								<span className="font-medium">{game.views ?? 0}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Lượt thích</span>
								<span className="font-medium">{game.likes ?? 0}</span>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Thao tác</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button
								className="w-full"
								onClick={() => void handleSave()}
								disabled={upsertGame.isPending}
							>
								{upsertGame.isPending ? "Đang lưu..." : "Lưu thay đổi"}
							</Button>

							{playUrl ? (
								<Button asChild className="w-full" variant="outline">
									<a href={playUrl} target="_blank" rel="noreferrer">
										<ExternalLink className="mr-2 h-4 w-4" />
										Chơi ngay
									</a>
								</Button>
							) : null}

							{game.status === "DRAFT" ? (
								<Button
									className="w-full"
									variant="outline"
									onClick={() => void handleApprove()}
									disabled={approveGame.isPending}
								>
									Duyệt
								</Button>
							) : null}

							{game.status === "PUBLISHED" ? (
								<Button
									className="w-full"
									variant="outline"
									onClick={() => void handleReject()}
									disabled={rejectGame.isPending}
								>
									Chuyển về nháp
								</Button>
							) : null}

							<Button
								className="w-full"
								variant="destructive"
								onClick={() => void handleArchive()}
								disabled={deleteGame.isPending || game.status === "ARCHIVED"}
							>
								Lưu trữ
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};
