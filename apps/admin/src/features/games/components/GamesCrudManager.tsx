import { useState, useEffect } from "react";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import {
	useAdminGamesList,
	useDeleteGame,
	useGameCategories,
	useUpsertGame,
	useApproveGame,
	useRejectGame,
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
import { DataTablePagination, DataTableToolbar } from "@/components/data-table";
import {
	useTableUrlState,
	type NavigateFn,
} from "@/shared/hooks/use-table-url-state";
import { toast } from "sonner";
import { MINIO_GAME_URL } from "@/shared/constants/endpoints";
import { gamesColumns } from "./games-columns";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

export type GameRowData = {
	id: number;
	title: string;
	status: string;
	categoryName: string;
	description: string;
	views: number;
	likes: number;
	minioObjectName?: string;
	categoryId?: number;
	thumbnailUrl?: string;
	difficulty?: string;
};

type DataTableProps = {
	data: GameRowData[];
	search: Record<string, unknown>;
	navigate: NavigateFn;
	onEdit: (game: GameRowData) => void;
	onDelete: (id: number) => Promise<void>;
	onApprove: (id: number) => Promise<void>;
	onReject: (id: number) => Promise<void>;
};

function GamesDataTable({
	data,
	search,
	navigate,
	onEdit,
	onDelete,
	onApprove,
	onReject,
}: DataTableProps) {
	const [rowSelection, setRowSelection] = useState({});
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [sorting, setSorting] = useState<SortingState>([]);

	const {
		columnFilters,
		onColumnFiltersChange,
		pagination,
		onPaginationChange,
		ensurePageInRange,
	} = useTableUrlState({
		search,
		navigate,
		pagination: { defaultPage: 1, defaultPageSize: 10 },
		globalFilter: { enabled: false },
		columnFilters: [{ columnId: "status", searchKey: "status", type: "array" }],
	});

	const table = useReactTable({
		data,
		columns: gamesColumns,
		state: {
			sorting,
			pagination,
			rowSelection,
			columnFilters,
			columnVisibility,
		},
		enableRowSelection: true,
		onPaginationChange,
		onColumnFiltersChange,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		getPaginationRowModel: getPaginationRowModel(),
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	useEffect(() => {
		ensurePageInRange(table.getPageCount());
	}, [table, ensurePageInRange]);

	return (
		<div className="w-full space-y-4">
			<DataTableToolbar
				table={table}
				searchPlaceholder="Lọc game theo tiêu đề..."
				searchKey="title"
				filters={[
					{
						columnId: "status",
						title: "Trạng thái",
						options: [
							{ label: "Nháp", value: "DRAFT" },
							{ label: "Đã xuất bản", value: "PUBLISHED" },
							{ label: "Đã lưu trữ", value: "ARCHIVED" },
						],
					},
				]}
			/>
			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="group/row">
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											colSpan={header.colSpan}
											className="bg-background group-hover/row:bg-muted"
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									className="group/row"
								>
									{row.getVisibleCells().map((cell) => {
										if (cell.column.id === "actions") {
											const game = row.original as GameRowData;
											return (
												<TableCell key={cell.id} className="text-right">
													<DropdownMenu modal={false}>
														<DropdownMenuTrigger asChild>
															<Button
																variant="ghost"
																className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
															>
																<DotsHorizontalIcon className="h-4 w-4" />
																<span className="sr-only">Open menu</span>
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end" className="w-50">
															{game.minioObjectName && (
																<>
																	<DropdownMenuItem asChild>
																		<a
																			href={`${MINIO_GAME_URL}/${game.minioObjectName}`}
																			target="_blank"
																			rel="noreferrer"
																		>
																			Xem
																		</a>
																	</DropdownMenuItem>
																	<DropdownMenuSeparator />
																</>
															)}
															{game.status === "DRAFT" && (
																<DropdownMenuItem
																	onClick={() => void onApprove(game.id)}
																>
																	Duyệt
																</DropdownMenuItem>
															)}
															{game.status === "PUBLISHED" && (
																<DropdownMenuItem
																	onClick={() => void onReject(game.id)}
																>
																	Chuyển về nháp
																</DropdownMenuItem>
															)}
															<DropdownMenuItem onClick={() => onEdit(game)}>
																Sửa
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																disabled={game.status === "ARCHIVED"}
																onClick={() => void onDelete(game.id)}
																className="text-destructive"
															>
																Lưu trữ
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											);
										}

										return (
											<TableCell
												key={cell.id}
												className="bg-background group-hover/row:bg-muted"
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										);
									})}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={gamesColumns.length}
									className="h-24 text-center"
								>
									Chưa có game nào.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<DataTablePagination table={table} className="mt-auto" />
		</div>
	);
}

export const GamesCrudManager = () => {
	const { data: games = [], isLoading } = useAdminGamesList();
	const { data: categories = [] } = useGameCategories();
	const upsertGame = useUpsertGame();
	const deleteGame = useDeleteGame();
	const approveGame = useApproveGame();
	const rejectGame = useRejectGame();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | undefined>(undefined);
	const [form, setForm] = useState<UpsertGamePayload>({ title: "", desc: "" });
	const [search, setSearch] = useState<Record<string, unknown>>({});

	const getErrorMessage = (e: any, fallback: string) => {
		return e?.response?.data?.message ?? e?.message ?? fallback;
	};

	const openCreate = () => {
		setEditingId(undefined);
		setForm({ title: "", desc: "", difficulty: "MEDIUM" });
		setDialogOpen(true);
	};

	const openEdit = (game: GameRowData) => {
		setEditingId(game.id);
		setForm({
			id: game.id,
			title: game.title,
			desc: game.description,
			difficulty: game.difficulty ?? "MEDIUM",
			categoryId: game.categoryId,
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

	const handleApprove = async (id: number) => {
		try {
			await approveGame.mutateAsync(id);
			toast.success("Game đã được duyệt và xuất bản");
		} catch (e: any) {
			toast.error(getErrorMessage(e, "Không thể duyệt game"));
		}
	};

	const handleReject = async (id: number) => {
		try {
			await rejectGame.mutateAsync(id);
			toast.success("Game đã được chuyển về trạng thái nháp");
		} catch (e: any) {
			toast.error(getErrorMessage(e, "Không thể chuyển trạng thái game"));
		}
	};

	const onFileChange = (file?: File | null) => {
		setForm((prev) => ({ ...prev, file: file ?? undefined }));
	};

	const onThumbnailChange = (file?: File | null) => {
		setForm((prev) => ({ ...prev, thumbnail: file ?? undefined }));
	};

	const tableData: GameRowData[] = games.map((g: any) => ({
		id: g.id,
		title: g.title,
		status: g.status,
		categoryName: categories.find((c) => c.id === g.categoryId)?.name ?? "-",
		description: g.description ?? "",
		views: g.views ?? 0,
		likes: g.likes ?? 0,
		minioObjectName: g.minioObjectName,
		categoryId: g.categoryId,
		thumbnailUrl: g.thumbnailUrl,
		difficulty: g.difficulty,
	}));

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Danh sách game</h2>
				<Button onClick={openCreate}>Thêm game</Button>
			</div>

			{isLoading ? (
				<p className="text-muted-foreground">Đang tải danh sách game...</p>
			) : (
				<GamesDataTable
					data={tableData}
					search={search}
					navigate={(to) => setSearch(to as Record<string, unknown>)}
					onEdit={openEdit}
					onDelete={handleDelete}
					onApprove={handleApprove}
					onReject={handleReject}
				/>
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
