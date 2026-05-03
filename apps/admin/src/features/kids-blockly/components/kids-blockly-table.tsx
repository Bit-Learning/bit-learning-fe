import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getSortedRowModel,
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
import {
	type NavigateFn,
	useTableUrlState,
} from "@/shared/hooks/use-table-url-state";
import { cn } from "@/shared/lib/utils";
import type { KidsBlocklyLevel } from "../api/kids-blockly.api";
import { createKidsBlocklyColumns } from "./kids-blockly-columns";

type KidsBlocklyTableProps = {
	data: KidsBlocklyLevel[];
	totalPages?: number;
	search: Record<string, unknown>;
	navigate: NavigateFn;
	onEdit: (level: KidsBlocklyLevel) => void;
	onTogglePublish: (level: KidsBlocklyLevel) => void;
	publishingLevelId?: string | null;
};

export function KidsBlocklyTable({
	data,
	totalPages,
	search,
	navigate,
	onEdit,
	onTogglePublish,
	publishingLevelId = null,
}: KidsBlocklyTableProps) {
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
		columnFilters: [
			{ columnId: "isPublished", searchKey: "isPublished", type: "array" },
		],
	});

	const isServerPaginated = typeof totalPages === "number" && totalPages > 0;

	const columns = createKidsBlocklyColumns({
		onEdit,
		onTogglePublish,
		publishingLevelId,
	});

	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable<KidsBlocklyLevel>({
		data,
		columns,
		state: { sorting, pagination, columnFilters },
		onSortingChange: setSorting,
		onPaginationChange,
		onColumnFiltersChange,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		...(isServerPaginated
			? { manualPagination: true as const, pageCount: totalPages }
			: { manualPagination: true as const, pageCount: totalPages ?? 1 }),
	});

	useEffect(() => {
		ensurePageInRange(table.getPageCount());
	}, [table, ensurePageInRange]);

	return (
		<div className="flex flex-1 flex-col gap-4">
			<DataTableToolbar
				table={table}
				searchPlaceholder="Lọc theo tiêu đề..."
				searchKey="title"
				filters={[
					{
						columnId: "isPublished",
						title: "Trạng thái",
						options: [
							{ label: "Đã xuất bản", value: "true" },
							{ label: "Chưa xuất bản", value: "false" },
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
											"bg-background group-hover/row:bg-muted",
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
												"bg-background group-hover/row:bg-muted",
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
									className="h-24 text-center text-muted-foreground"
								>
									Chưa có màn chơi nào.
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
