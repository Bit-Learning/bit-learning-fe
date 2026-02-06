import { useState } from "react";
import {
	useAdminGamesList,
	useDeleteGame,
	useGameCategories,
	useUpsertGame,
	type GameCategoryOption,
	type UpsertGamePayload,
} from "../hooks/useAdminGamesCrud";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const GamesCrudManager = () => {
	const { data: games = [], isLoading } = useAdminGamesList();
	const { data: categories = [] } = useGameCategories();
	const upsertGame = useUpsertGame();
	const deleteGame = useDeleteGame();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | undefined>(undefined);
	const [form, setForm] = useState<UpsertGamePayload>({ title: "", desc: "" });

	const getErrorMessage = (e: any, fallback: string) => {
		return e?.response?.data?.message ?? e?.message ?? fallback;
	};

	const openCreate = () => {
		setEditingId(undefined);
		setForm({ title: "", desc: "", difficulty: "MEDIUM" });
		setDialogOpen(true);
	};

	const getCategoryName = (
		categoryId?: number,
		cats?: GameCategoryOption[],
	) => {
		if (!categoryId || !cats || cats.length === 0) return "-";
		return cats.find((c) => c.id === categoryId)?.name ?? "-";
	};

	const openEdit = (game: any) => {
		setEditingId(game.id as number);
		setForm({
			id: game.id,
			title: game.title ?? "",
			desc: game.description ?? "",
			difficulty: game.difficulty ?? "MEDIUM",
			categoryId: game.categoryId ?? undefined,
			thumbnailUrl: game.thumbnailUrl ?? "",
		});
		setDialogOpen(true);
	};

	const handleSubmit = async () => {
		try {
			await upsertGame.mutateAsync({ ...form, id: editingId });
			toast.success(
				editingId ? "Cập nhật game thành công" : "Tạo game thành công",
			);
			setDialogOpen(false);
		} catch (e: any) {
			toast.error(getErrorMessage(e, "Không thể lưu game"));
		}
	};

	const handleDelete = async (id: number) => {
		try {
			await deleteGame.mutateAsync(id);
			toast.success("Đã lưu trữ game");
		} catch (e: any) {
			toast.error(getErrorMessage(e, "Không thể xoá game"));
		}
	};

	const onFileChange = (file?: File | null) => {
		setForm((prev) => ({ ...prev, file: file ?? undefined }));
	};

	const onThumbnailChange = (file?: File | null) => {
		setForm((prev) => ({ ...prev, thumbnail: file ?? undefined }));
	};

	const getPlayUrl = (minioObjectName?: string) => {
		if (!minioObjectName) return "#";
		return `http://localhost:9000/scratch-games/${minioObjectName}`;
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Danh sách game</h2>
				<Button onClick={openCreate}>Thêm game</Button>
			</div>

			{isLoading ? (
				<p>Đang tải danh sách game...</p>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ID</TableHead>
							<TableHead>Tiêu đề</TableHead>
							<TableHead>Danh mục</TableHead>
							<TableHead>Mô tả</TableHead>
							<TableHead>Lượt xem</TableHead>
							<TableHead>Lượt thích</TableHead>
							<TableHead className="w-[220px] text-right">Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{games.map((g: any) => (
							<TableRow key={g.id}>
								<TableCell>{g.id}</TableCell>
								<TableCell>{g.title}</TableCell>
								<TableCell>
									{getCategoryName(g.categoryId, categories)}
								</TableCell>
								<TableCell className="max-w-xs truncate" title={g.description}>
									{g.description}
								</TableCell>
								<TableCell>{g.views ?? 0}</TableCell>
								<TableCell>{g.likes ?? 0}</TableCell>
								<TableCell className="space-x-2 text-right">
									{g.minioObjectName && (
										<Button asChild size="sm" variant="ghost">
											<a
												href={getPlayUrl(g.minioObjectName)}
												target="_blank"
												rel="noreferrer"
											>
												Xem
											</a>
										</Button>
									)}
									<Button
										size="sm"
										variant="outline"
										onClick={() => openEdit(g)}
									>
										Sửa
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={() => void handleDelete(g.id as number)}
									>
										Lưu trữ
									</Button>
								</TableCell>
							</TableRow>
						))}
						{games.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={7}
									className="text-center text-muted-foreground"
								>
									Chưa có game nào.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingId ? "Cập nhật game" : "Tạo game mới"}
						</DialogTitle>
						<DialogDescription>
							{editingId
								? "Chỉnh sửa thông tin game hiện có."
								: "Tạo game mới với file game và thông tin chi tiết."}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-2">
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
							/>
						</div>

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
										: undefined
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
									<SelectValue placeholder="Chọn danh mục (tuỳ chọn)" />
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

						{!editingId && (
							<div className="space-y-1">
								<Label htmlFor="file">File game (.zip hoặc .html)</Label>
								<Input
									id="file"
									type="file"
									accept=".zip,.html"
									onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
								/>
							</div>
						)}

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

						<div className="space-y-1">
							<Label htmlFor="thumbnailFile">Hoặc upload thumbnail</Label>
							<Input
								id="thumbnailFile"
								type="file"
								accept="image/*"
								onChange={(e) => onThumbnailChange(e.target.files?.[0] ?? null)}
							/>
						</div>
					</div>

					<DialogFooter className="gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setDialogOpen(false)}
						>
							Huỷ
						</Button>
						<Button
							type="button"
							onClick={() => void handleSubmit()}
							disabled={upsertGame.isPending}
						>
							{upsertGame.isPending ? "Đang lưu..." : "Lưu"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};
