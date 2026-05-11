import {
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	type VisibilityState,
	useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { DataTablePagination, DataTableToolbar } from "@/components/data-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	type NavigateFn,
	useTableUrlState,
} from "@/shared/hooks/use-table-url-state";
import { cn } from "@/shared/lib/utils";
import type { CoursePreview } from "../types/course.type";
import { createCoursesColumns } from "./courses-columns";

export type CoursesTableProps = {
	data: CoursePreview[];
	totalPages?: number;
	search: Record<string, unknown>;
	navigate: NavigateFn;
	onEdit: (course: CoursePreview) => void;
	onDelete: (course: CoursePreview) => void;
};

export function CoursesTable({
	data,
	totalPages,
	search,
	navigate,
	onEdit,
	onDelete,
}: CoursesTableProps) {
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [sorting, setSorting] = useState<SortingState>([]);

	const columns = useMemo(
		() => createCoursesColumns({ onEdit, onDelete }),
		[onEdit, onDelete],
	);

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
		columnFilters: [
			{ columnId: "title", searchKey: "title", type: "string" },
			{ columnId: "status", searchKey: "status", type: "array" },
			{ columnId: "grade", searchKey: "grade", type: "array" },
			{ columnId: "level", searchKey: "level", type: "array" },
		],
	});

	const isServerPaginated = typeof totalPages === "number" && totalPages > 0;

	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			pagination,
			columnFilters,
			columnVisibility,
		},
		onSortingChange: setSorting,
		onPaginationChange,
		onColumnFiltersChange,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		...(isServerPaginated
			? {
					manualPagination: true as const,
					pageCount: totalPages,
				}
			: {
					getPaginationRowModel: getPaginationRowModel(),
				}),
	});

	useEffect(() => {
		ensurePageInRange(table.getPageCount());
	}, [table, ensurePageInRange]);

	return (
		<div
			className={cn(
				'max-sm:has-[div[role="toolbar"]]:mb-16',
				"flex flex-1 flex-col gap-4",
			)}
		>
			<DataTableToolbar
				table={table}
				searchPlaceholder="Tìm kiếm khóa học theo tiêu đề..."
				searchKey="title"
				filters={[
					{
						columnId: "status",
						title: "Trạng thái",
						options: [
							{ label: "Chờ duyệt", value: "PENDING" },
							{ label: "Đã xuất bản", value: "PUBLISHED" },
							// { label: "Từ chối", value: "REJECTED" },
						],
					},
					{
						columnId: "grade",
						title: "Lớp",
						options: [
							// { label: "Lớp 1", value: "1" },
							// { label: "Lớp 2", value: "2" },
							{ label: "Lớp 3", value: "3" },
							{ label: "Lớp 4", value: "4" },
							{ label: "Lớp 5", value: "5" },
							{ label: "Lớp 6", value: "6" },
							{ label: "Lớp 7", value: "7" },
							{ label: "Lớp 8", value: "8" },
							{ label: "Lớp 9", value: "9" },
							{ label: "Lớp 10", value: "10" },
							{ label: "Lớp 11", value: "11" },
							{ label: "Lớp 12", value: "12" },
						],
					},
					{
						columnId: "level",
						title: "Độ khó",
						options: [
							{ label: "Cơ bản", value: "BEGINNING" },
							{ label: "Trung cấp", value: "INTERMEDIATE" },
							{ label: "Nâng cao", value: "ADVANCED" },
						],
					},
				]}
			/>
			<div className="overflow-hidden rounded-none border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="group/row">
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										colSpan={header.colSpan}
										className={cn(
											"bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
											header.column.columnDef.meta?.className,
											header.column.columnDef.meta?.thClassName,
										)}
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
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} className="group/row">
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className={cn(
												"bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
												cell.column.columnDef.meta?.className,
												cell.column.columnDef.meta?.tdClassName,
											)}
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
									colSpan={columns.length}
									className="h-24 text-center"
								>
									Không có kết quả.
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
