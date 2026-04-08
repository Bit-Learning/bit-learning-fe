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
import type { TCurriculumResponse } from "../types/curriculum.type";
import { createCurriculumColumns } from "./curriculum-columns";

export type CurriculumTableProps = {
	data: TCurriculumResponse[];
	totalPages?: number;
	search: Record<string, unknown>;
	navigate: NavigateFn;
	subjectCounts?: Map<number, number>;
	onEdit: (curriculum: TCurriculumResponse) => void;
	onDelete: (curriculum: TCurriculumResponse) => void;
	onAddSubject: (curriculum: TCurriculumResponse) => void;
	onCurriculumSelect?: (curriculum: TCurriculumResponse) => void;
};

export function CurriculumTable({
	data,
	totalPages,
	search,
	navigate,
	subjectCounts,
	onEdit,
	onDelete,
	onAddSubject,
	onCurriculumSelect,
}: CurriculumTableProps) {
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [sorting, setSorting] = useState<SortingState>([]);

	const columns = useMemo(
		() =>
			createCurriculumColumns({
				onEdit,
				onDelete,
				onAddSubject,
				subjectCounts,
			}),
		[onEdit, onDelete, onAddSubject, subjectCounts],
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
		columnFilters: [{ columnId: "name", searchKey: "name", type: "string" }],
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
				searchPlaceholder="Tìm kiếm chương trình theo tên..."
				searchKey="name"
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
								<TableRow
									key={row.id}
									className="group/row cursor-pointer"
									onClick={() => onCurriculumSelect?.(row.original)}
								>
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
