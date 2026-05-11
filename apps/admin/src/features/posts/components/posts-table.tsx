import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type ColumnFiltersState,
	type PaginationState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { DataTablePagination, DataTableToolbar } from "@/components/data-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { getAuthorName, getPostExcerpt, getPostTags } from "../post.utils";
import type { PostPreview } from "../types/post.type";
import { postsColumns } from "./posts-columns";

type PostsTableProps = {
	data: PostPreview[];
	isLoading?: boolean;
	totalPages?: number;
	pageIndex: number;
	pageSize: number;
	initialColumnFilters?: ColumnFiltersState;
	onPaginationChange: (pagination: PaginationState) => void;
	onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
};

export function PostsTable({
	data,
	isLoading = false,
	totalPages,
	pageIndex,
	pageSize,
	initialColumnFilters = [],
	onPaginationChange,
	onColumnFiltersChange,
}: PostsTableProps) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] =
		useState<ColumnFiltersState>(initialColumnFilters);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex,
		pageSize,
	});

	useEffect(() => {
		setPagination({ pageIndex, pageSize });
	}, [pageIndex, pageSize]);

	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data,
		columns: postsColumns,
		state: {
			sorting,
			columnFilters,
			pagination,
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: (updater) => {
			const next =
				typeof updater === "function" ? updater(columnFilters) : updater;
			setColumnFilters(next);
			onColumnFiltersChange?.(next);
		},
		onPaginationChange: (updater) => {
			const nextPagination =
				typeof updater === "function" ? updater(pagination) : updater;
			setPagination(nextPagination);
			onPaginationChange(nextPagination);
		},
		globalFilterFn: (row, _columnId, filterValue) => {
			const post = row.original;
			const normalizedSearch = String(filterValue).toLowerCase().trim();

			if (!normalizedSearch) return true;

			const searchableText = [
				post.title,
				post.slug,
				post.category?.name,
				getAuthorName(post.author),
				getPostExcerpt(post),
				...getPostTags(post).map((tag) => tag.name),
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();

			return searchableText.includes(normalizedSearch);
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		...(typeof totalPages === "number" && totalPages > 0
			? {
					manualPagination: true as const,
					pageCount: totalPages,
				}
			: {
					getPaginationRowModel: getPaginationRowModel(),
				}),
	});

	const skeletonRows = Array.from(
		{ length: 6 },
		(_, index) => `post-skeleton-${index}`,
	);

	const getColumnSkeletonKey = (index: number) => `post-column-${index}`;

	return (
		<div className={cn("flex flex-1 flex-col gap-4")}>
			<DataTableToolbar
				table={table}
				searchPlaceholder="Tìm kiếm bài viết..."
				filters={[
					{
						columnId: "isBanned",
						title: "Trạng thái",
						options: [
							{ label: "Đang hoạt động", value: "false" },
							{ label: "Bị khóa", value: "true" },
						],
					},
					{
						columnId: "isFeatured",
						title: "Nổi bật",
						options: [
							{ label: "Nổi bật", value: "true" },
							{ label: "Không nổi bật", value: "false" },
						],
					},
				]}
			/>

			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										colSpan={header.colSpan}
										className={header.column.columnDef.meta?.className}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>

					<TableBody>
						{isLoading ? (
							skeletonRows.map((rowKey) => (
								<TableRow key={rowKey}>
									{postsColumns.map((column, index) => (
										<TableCell
											key={`${rowKey}-${column.id ?? getColumnSkeletonKey(index)}`}
										>
											<Skeleton className="h-10 w-full" />
										</TableCell>
									))}
								</TableRow>
							))
						) : table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className={cell.column.columnDef.meta?.className}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={postsColumns.length}
									className="h-24 text-center text-muted-foreground"
								>
									Không tìm thấy bài viết nào
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<DataTablePagination
				table={table}
				className="mt-auto"
				pageCount={totalPages}
			/>
		</div>
	);
}
