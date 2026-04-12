import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import type { TagResponse } from "../types/tag.type";

export type { TagResponse } from "../types/tag.type";

export type CreateTagsColumnsArgs = {
	onEdit: (tag: TagResponse) => void;
	onDelete: (tag: TagResponse) => void;
};

export const createTagsColumns = ({
	onEdit,
	onDelete,
}: CreateTagsColumnsArgs): ColumnDef<TagResponse>[] => [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Tên tag" />
		),
		cell: ({ row }) => (
			<span className="font-medium text-foreground">{row.original.name}</span>
		),
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Ngày tạo" />
		),
		cell: ({ row }) => {
			const createdAt = row.original.createdAt;
			return (
				<span className="text-xs text-muted-foreground">
					{new Date(createdAt).toLocaleDateString("vi-VN")}
				</span>
			);
		},
	},
	{
		id: "actions",
		header: () => null,
		cell: ({ row }) => {
			const tag = row.original;
			return (
				<div className="flex items-center justify-end gap-1">
					<Button
						size="sm"
						variant="ghost"
						className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
						onClick={() => onEdit(tag)}
					>
						<Pencil className="h-3.5 w-3.5" />
					</Button>
					<Button
						size="sm"
						variant="ghost"
						className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
						onClick={() => onDelete(tag)}
					>
						<Trash2 className="h-3.5 w-3.5" />
					</Button>
				</div>
			);
		},
		enableSorting: false,
		enableHiding: false,
	},
];
