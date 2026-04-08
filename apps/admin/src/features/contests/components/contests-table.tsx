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
import type { ContestListDTO } from "../types/contest.type";
import { ContestStatus } from "../types/contest.type";
import { createContestColumns } from "./contest-columns";

export type ContestsTableProps = {
	data: ContestListDTO[];
	totalPages?: number;
	search: Record<string, unknown>;
	navigate: NavigateFn;
	onView: (contest: ContestListDTO) => void;
	onEdit: (contest: ContestListDTO) => void;
	onDelete: (contest: ContestListDTO) => void;
};

export function ContestsTable({
	data,
	totalPages,
	search,
	navigate,
	onView,
	onEdit,
	onDelete,
}: ContestsTableProps) {
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [sorting, setSorting] = useState<SortingState>([]);

	const columns = useMemo(
		() => createContestColumns({ onView, onEdit, onDelete }),
		[onView, onEdit, onDelete],
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
		],
	});

	const isServerPaginated = typeof totalPages === "number" && totalPages > 0;

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
				searchPlaceholder="Tìm kiếm cuộc thi theo tiêu đề..."
				searchKey="title"
				filters={[
					{
						columnId: "status",
						title: "Trạng thái",
						options: [
							{ label: "Đang diễn ra", value: ContestStatus.RUNNING },
							{ label: "Sắp tới", value: ContestStatus.UPCOMING },
							{ label: "Đã kết thúc", value: ContestStatus.ENDED },
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
