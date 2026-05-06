import {
	flexRender,
	getCoreRowModel,
	type OnChangeFn,
	type PaginationState,
	useReactTable,
} from "@tanstack/react-table";
import { DataTablePagination } from "@/components/data-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { PaginationInfo } from "@/shared/api/api.type";
import type { AdminOrder } from "../types/order.type";
import { orderColumns } from "./orders-columns";

type OrdersTableProps = {
	data: AdminOrder[];
	page: number;
	pageSize: number;
	pageInfo?: PaginationInfo;
	onPaginationChange: OnChangeFn<PaginationState>;
};

export function OrdersTable({
	data,
	page,
	pageSize,
	pageInfo,
	onPaginationChange,
}: OrdersTableProps) {
	const totalPages = Math.max(pageInfo?.totalPages ?? 0, 1);

	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data,
		columns: orderColumns,
		state: {
			pagination: {
				pageIndex: page,
				pageSize,
			},
		},
		onPaginationChange,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		pageCount: totalPages,
	});

	return (
		<div className="flex flex-1 flex-col gap-4">
			<div className="overflow-hidden rounded-xl border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
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
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
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
									colSpan={orderColumns.length}
									className="text-muted-foreground h-32 text-center"
								>
									Không tìm thấy đơn hàng phù hợp.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<DataTablePagination
				table={table}
				pageCount={totalPages}
				className="mt-auto"
			/>
		</div>
	);
}
