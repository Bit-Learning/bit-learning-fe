import { useState } from "react";
import {
	useAdminGamesList,
	useGameCategories,
	useUpsertGame,
	type GameCategoryOption,
	type UpsertGamePayload,
} from "../queries/useAdminGamesCrud";
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
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { GamesTable } from "./games-table";
import type { GameRow } from "./games-columns";
import { Loader2 } from "lucide-react";

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
	const { data: games = [], isLoading } = useAdminGamesList();
	const { data: categories = [] } = useGameCategories();
	const upsertGame = useUpsertGame();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | undefined>(undefined);
	const [form, setForm] = useState<UpsertGamePayload>({ title: "", desc: "" });

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

	const handleSubmit = async () => {
		try {
			await upsertGame.mutateAsync({ ...form, id: editingId });
			toast.success(
				editingId ? "Cập nhật game thành công" : "Tạo game thành công",
			);
			setDialogOpen(false);
		} catch (error: unknown) {
			toast.error(getErrorMessage(error, "Không thể lưu game"));
		}
	};

	const onFileChange = (file?: File | null) => {
		setForm((prev) => ({ ...prev, file: file ?? undefined }));
	};

	const onThumbnailChange = (file?: File | null) => {
		setForm((prev) => ({ ...prev, thumbnail: file ?? undefined }));
	};

	const tableData: GameRow[] = games.map((g) => ({
		...g,
		categoryName: getCategoryName(g.categoryId, categories),
	}));

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-xl font-semibold">Danh sách trò chơi</h2>
				<Button onClick={openCreate}>Thêm trò chơi</Button>
			</div>

			{isLoading ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					Đang tải danh sách trò chơi...
				</>
			) : (
				<GamesTable data={tableData} />
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingId ? "Cập nhật trò chơi" : "Tạo trò chơi mới"}
						</DialogTitle>
						<DialogDescription>
							{editingId
								? "Chỉnh sửa thông tin trò chơi hiện có."
								: "Tạo trò chơi mới với file trò chơi và thông tin chi tiết."}
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
