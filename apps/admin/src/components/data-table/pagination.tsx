import {
	ChevronLeftIcon,
	ChevronRightIcon,
	DoubleArrowLeftIcon,
	DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn, getPageNumbers } from "@/shared/lib/utils";

type DataTablePaginationProps<TData> = {
	table: Table<TData>;
	className?: string;
	pageCount?: number;
};

export function DataTablePagination<TData>({
	table,
	className,
	pageCount,
}: DataTablePaginationProps<TData>) {
	const currentPage = table.getState().pagination.pageIndex + 1;
	const totalPages = pageCount ?? table.getPageCount();
	const pageNumbers = getPageNumbers(currentPage, totalPages);
	const canPreviousPage = currentPage > 1;
	const canNextPage = totalPages > 0 && currentPage < totalPages;

	return (
		<div
			className={cn(
				"flex items-center justify-between overflow-clip px-2",
				"@max-2xl/content:flex-col-reverse @max-2xl/content:gap-4",
				className,
			)}
			style={{ overflowClipMargin: 1 }}
		>
			<div className="flex w-full items-center justify-between">
				<div className="flex w-25 items-center justify-center text-sm font-normal @2xl/content:hidden">
					Trang {currentPage} trên {totalPages}
				</div>
				<div className="flex items-center gap-2 @max-2xl/content:flex-row-reverse">
					<Select
						value={`${table.getState().pagination.pageSize}`}
						onValueChange={(value) => {
							table.setPageSize(Number(value));
						}}
					>
						<SelectTrigger className="h-8 w-17.5">
							<SelectValue placeholder={table.getState().pagination.pageSize} />
						</SelectTrigger>
						<SelectContent side="top">
							{[10, 20, 30, 40, 50].map((pageSize) => (
								<SelectItem key={pageSize} value={`${pageSize}`}>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className="hidden text-sm font-normal sm:block">Hàng mỗi trang</p>
				</div>
			</div>

			<div className="flex items-center sm:space-x-6 lg:space-x-8">
				<div className="flex w-25 items-center justify-center text-sm font-normal @max-3xl/content:hidden">
					Trang {currentPage} trên {totalPages}
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						className="size-8 p-0 @max-md/content:hidden"
						onClick={() => table.setPageIndex(0)}
						disabled={!canPreviousPage}
					>
						<span className="sr-only">Go to first page</span>
						<DoubleArrowLeftIcon className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="size-8 p-0"
						onClick={() => table.previousPage()}
						disabled={!canPreviousPage}
					>
						<span className="sr-only">Go to previous page</span>
						<ChevronLeftIcon className="h-4 w-4" />
					</Button>

					{/* Page number buttons */}
					{pageNumbers.map((pageNumber, index) => (
						<div key={`${pageNumber}-${index}`} className="flex items-center">
							{pageNumber === "..." ? (
								<span className="text-muted-foreground px-1 text-sm">...</span>
							) : (
								<Button
									variant={currentPage === pageNumber ? "default" : "outline"}
									className="h-8 min-w-8 px-2"
									onClick={() => table.setPageIndex((pageNumber as number) - 1)}
								>
									<span className="sr-only">Go to page {pageNumber}</span>
									{pageNumber}
								</Button>
							)}
						</div>
					))}

					<Button
						variant="outline"
						className="size-8 p-0"
						onClick={() => table.nextPage()}
						disabled={!canNextPage}
					>
						<span className="sr-only">Go to next page</span>
						<ChevronRightIcon className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="size-8 p-0 @max-md/content:hidden"
						onClick={() => table.setPageIndex(totalPages - 1)}
						disabled={!canNextPage}
					>
						<span className="sr-only">Go to last page</span>
						<DoubleArrowRightIcon className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
