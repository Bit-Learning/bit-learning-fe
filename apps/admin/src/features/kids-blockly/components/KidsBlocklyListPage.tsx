import { useState } from "react";
import { toast } from "sonner";
import { Blocks, Loader2, Plus, Sparkles } from "lucide-react";
import { getRouteApi } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	useCreateKidsBlocklyLevel,
	useUpdateKidsBlocklyLevel,
	usePublishKidsBlocklyLevel,
	useKidsBlocklyLevels,
} from "../queries/useKidsBlockly";
import {
	KidsBlocklyLevelForm,
	type LevelFormValues,
} from "./KidsBlocklyLevelForm";
import { KidsBlocklyTable } from "./kids-blockly-table";
import type { KidsBlocklyLevel } from "../api/kids-blockly.api";

function getErrorMessage(error: unknown, fallback: string): string {
	if (
		typeof error === "object" &&
		error !== null &&
		"response" in error &&
		typeof (error as any).response?.data?.message === "string"
	) {
		return (error as any).response.data.message;
	}
	if (error instanceof Error) return error.message;
	return fallback;
}

const route = getRouteApi("/_authenticated/apps/kids-blockly/");

export function KidsBlocklyListPage() {
	const search = route.useSearch();
	const navigate = route.useNavigate();

	const page = ((search.page ?? 1) as number) - 1;
	const pageSize = (search.pageSize ?? 10) as number;

	const {
		data: response,
		isLoading,
		isError,
	} = useKidsBlocklyLevels({ page, pageSize });

	const levels = (response?.data ?? []) as KidsBlocklyLevel[];
	const totalPages = response?.page?.totalPages ?? 0;
	const totalElements = response?.page?.totalElements ?? 0;
	const publishedCount = levels.filter((l) => l.isPublished).length;

	const [formOpen, setFormOpen] = useState(false);
	const [editingLevel, setEditingLevel] = useState<KidsBlocklyLevel | null>(
		null,
	);
	const [publishingLevelId, setPublishingLevelId] = useState<string | null>(
		null,
	);

	const createLevel = useCreateKidsBlocklyLevel();
	const updateLevel = useUpdateKidsBlocklyLevel();
	const publishLevel = usePublishKidsBlocklyLevel();

	const handleOpenCreate = () => {
		setEditingLevel(null);
		setFormOpen(true);
	};

	const handleOpenEdit = (level: KidsBlocklyLevel) => {
		setEditingLevel(level);
		setFormOpen(true);
	};

	const handleSubmit = async (values: LevelFormValues) => {
		const isEditing = !!editingLevel;
		const payload = {
			order: values.order,
			title: values.title,
			subtitle: values.subtitle,
			gridSize: { rows: values.gridRows, cols: values.gridCols },
			start: { x: values.startX, y: values.startY, dir: values.startDir },
			goal: { x: values.goalX, y: values.goalY },
			obstacles: values.obstacles,
			allowedBlocks: values.allowedBlocks,
			hint: values.hint,
			par: values.par,
			isPublished: values.isPublished,
		};

		try {
			if (isEditing) {
				await updateLevel.mutateAsync({ levelId: editingLevel!.id, payload });
				toast.success(`Đã cập nhật màn chơi "${values.title}"`);
			} else {
				await createLevel.mutateAsync({
					...payload,
					id: values.id || undefined,
				});
				toast.success(`Đã tạo màn chơi "${values.title}"`);
			}
			setFormOpen(false);
		} catch (error) {
			toast.error(
				getErrorMessage(
					error,
					isEditing ? "Không thể cập nhật màn chơi" : "Không thể tạo màn chơi",
				),
			);
		}
	};

	const handleTogglePublish = async (level: KidsBlocklyLevel) => {
		const next = !level.isPublished;
		setPublishingLevelId(level.id);
		try {
			await publishLevel.mutateAsync({ levelId: level.id, isPublished: next });
			toast.success(
				next
					? `Đã xuất bản màn chơi "${level.title}"`
					: `Đã ẩn màn chơi "${level.title}"`,
			);
		} catch (error) {
			toast.error(
				getErrorMessage(error, "Không thể thay đổi trạng thái xuất bản"),
			);
		} finally {
			setPublishingLevelId(null);
		}
	};

	const isSubmitting = createLevel.isPending || updateLevel.isPending;

	return (
		<div className="space-y-6">
			{/* Header card */}
			<Card className="overflow-hidden border-slate-200/80 bg-linear-to-br from-slate-100 via-white to-slate-50 text-slate-800">
				<CardHeader className="border-b border-slate-200/80 pb-5">
					<div className="flex items-center gap-2 text-sm font-medium text-violet-700">
						<Sparkles className="h-4 w-4" />
						Workspace quản lý Kids Blockly
					</div>
					<CardTitle className="text-2xl text-slate-900">
						Quản lý màn chơi Kids Blockly
					</CardTitle>
					<CardDescription className="max-w-2xl text-slate-600">
						Tạo, chỉnh sửa và xuất bản các màn chơi lập trình kéo thả dành cho
						trẻ em. Mỗi màn chơi bao gồm lưới, vị trí xuất phát, đích đến,
						chướng ngại vật và tập khối lệnh cho phép.
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-6">
					<div className="grid gap-3 sm:grid-cols-3">
						<div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
							<div className="text-sm text-slate-500">Tổng màn chơi</div>
							<div className="mt-2 text-3xl font-semibold text-slate-900">
								{isLoading ? "—" : totalElements}
							</div>
						</div>
						<div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
							<div className="text-sm text-slate-500">
								Đã xuất bản (trang này)
							</div>
							<div className="mt-2 text-3xl font-semibold text-emerald-600">
								{isLoading ? "—" : publishedCount}
							</div>
						</div>
						<div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
							<div className="text-sm text-slate-500">
								Chưa xuất bản (trang này)
							</div>
							<div className="mt-2 text-3xl font-semibold text-slate-400">
								{isLoading ? "—" : levels.length - publishedCount}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Table card */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between border-b">
					<div>
						<CardTitle>Danh sách màn chơi</CardTitle>
						<CardDescription className="mt-1">
							Quản lý toàn bộ màn chơi Kids Blockly. Lọc theo trạng thái, chỉnh
							sửa hoặc thay đổi trạng thái xuất bản trực tiếp từ bảng.
						</CardDescription>
					</div>
					<Button onClick={handleOpenCreate} className="shrink-0">
						<Plus className="mr-2 h-4 w-4" />
						Tạo màn chơi
					</Button>
				</CardHeader>
				<CardContent className="pt-6">
					{isLoading && (
						<div className="flex items-center gap-2 py-10 text-muted-foreground">
							<Loader2 className="h-4 w-4 animate-spin" />
							Đang tải danh sách màn chơi...
						</div>
					)}

					{isError && (
						<div className="py-10 text-center text-sm text-destructive">
							Không thể tải danh sách màn chơi.
						</div>
					)}

					{!isLoading && !isError && levels.length === 0 && (
						<div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
							<Blocks className="h-10 w-10 opacity-30" />
							<p className="text-sm">Chưa có màn chơi nào.</p>
							<Button variant="outline" size="sm" onClick={handleOpenCreate}>
								<Plus className="mr-2 h-4 w-4" />
								Tạo màn chơi đầu tiên
							</Button>
						</div>
					)}

					{!isLoading && !isError && levels.length > 0 && (
						<KidsBlocklyTable
							data={levels}
							totalPages={totalPages}
							search={search as Record<string, unknown>}
							navigate={navigate}
							onEdit={handleOpenEdit}
							onTogglePublish={handleTogglePublish}
							publishingLevelId={publishingLevelId}
						/>
					)}
				</CardContent>
			</Card>

			<KidsBlocklyLevelForm
				open={formOpen}
				onOpenChange={setFormOpen}
				editingLevel={editingLevel}
				onSubmit={handleSubmit}
				isSubmitting={isSubmitting}
			/>
		</div>
	);
}
