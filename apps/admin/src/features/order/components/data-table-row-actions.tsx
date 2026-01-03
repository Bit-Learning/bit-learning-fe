import type { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Order } from "../data/schema";
import { useOrdersContext } from "./orders-provider";

type DataTableRowActionsProps = {
	row: Row<Order>;
};

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
	const order = row.original;
	const { setActiveOrder, setIsViewDialogOpen, setIsDeleteDialogOpen } =
		useOrdersContext();

	const handleView = () => {
		setActiveOrder(order);
		setIsViewDialogOpen(true);
	};

	const handleDelete = () => {
		setActiveOrder(order);
		setIsDeleteDialogOpen(true);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
				>
					<MoreHorizontal className="h-4 w-4" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-40">
				<DropdownMenuItem onClick={handleView}>View Details</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleDelete}
					className="text-destructive focus:text-destructive"
				>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
