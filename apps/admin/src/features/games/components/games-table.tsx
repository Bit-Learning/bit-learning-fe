import {
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type ColumnFiltersState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { DataTablePagination, DataTableToolbar } from "@/components/data-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/shared/lib/utils";
import { createGamesColumns, type GameRow } from "./games-columns";

type GamesTableProps = {
	data: GameRow[];
	onDeleteStandard: (id: number) => void;
	onDeleteMatching: (gameId: number) => void;
	isDeletingStandard?: boolean;
	isDeletingMatching?: boolean;
	initialColumnFilters?: ColumnFiltersState;
	onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
};

export function GamesTable({
	data,
	onDeleteMatching,
	onDeleteStandard,
	isDeletingMatching = false,
	isDeletingStandard = false,
	initialColumnFilters = [],
	onColumnFiltersChange,
}: GamesTableProps) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] =
		useState<ColumnFiltersState>(initialColumnFilters);

	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable<GameRow>({
		data,
		columns: createGamesColumns({
			onDeleteMatching,
			onDeleteStandard,
			isDeletingMatching,
			isDeletingStandard,
		}),
		state: {
			sorting,
			columnFilters,
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: (updater) => {
			const next =
				typeof updater === "function" ? updater(columnFilters) : updater;
			setColumnFilters(next);
			onColumnFiltersChange?.(next);
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	return (
		<div className={cn("flex flex-1 flex-col gap-4")}>
			<DataTableToolbar
				table={table}
				searchPlaceholder="Lọc game theo tiêu đề..."
				searchKey="title"
				filters={[
					{
						columnId: "rowType",
						title: "Loại game",
						options: [
							{ label: "Game thường", value: "standard" },
							{ label: "Nối khái niệm", value: "matching" },
						],
					},
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
									data-state={row.getIsSelected() && "selected"}
									className="group/row"
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
									colSpan={table.getAllLeafColumns().length}
									className="h-24 text-center text-muted-foreground"
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
